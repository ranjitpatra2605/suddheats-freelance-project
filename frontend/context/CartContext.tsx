'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartItem {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    weight?: number;
    packaging?: 'jar' | 'pouch';
}

interface CartContextType {
    items: CartItem[];
    totalItems: number;
    subtotal: number;
    addToCart: (productId: string, name: string, image: string, price: number, quantity?: number, options?: { weight?: number; packaging?: 'jar' | 'pouch' }) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    updateItemOptions: (productId: string, weight: number, packaging: 'jar' | 'pouch', price: number) => Promise<void>;
    clearCart: () => void;
    fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const { user } = useAuth();

    const setNormalizedItems = (cartItems: any[]) => {
        const normalized = (cartItems || []).map(item => ({
            ...item,
            product: typeof item.product === 'object' && item.product !== null ? item.product.id : item.product
        }));
        setItems(normalized);
    };

    const fetchCart = async () => {
        if (!user) { setItems([]); return; }
        try {
            const { data } = await api.get('/cart');
            setNormalizedItems(data.items || []);
        } catch { setItems([]); }
    };

    useEffect(() => { fetchCart(); }, [user]);

    const addToCart = async (productId: string, name: string, image: string, price: number, quantity = 1, options?: { weight?: number; packaging?: 'jar' | 'pouch' }) => {
        if (!user) { toast.error('Please login to add items to cart'); return; }
        try {
            const { data } = await api.post('/cart', { productId, quantity, weight: options?.weight, packaging: options?.packaging });
            setNormalizedItems(data.items || []);
            toast.success(`${name} added to cart! 🛒`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    const removeFromCart = async (productId: string) => {
        try {
            const { data } = await api.delete(`/cart/${productId}`);
            setNormalizedItems(data.items || []);
            toast.success('Item removed from cart');
        } catch { toast.error('Failed to remove item'); }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 1) { removeFromCart(productId); return; }
        try {
            const { data } = await api.post('/cart', { productId, quantity });
            setNormalizedItems(data.items || []);
        } catch { toast.error('Failed to update quantity'); }
    };

    const updateItemOptions = async (productId: string, weight: number, packaging: 'jar' | 'pouch', price: number) => {
        try {
            const { data } = await api.post('/cart/update-options', { productId, weight, packaging, price });
            setNormalizedItems(data.items || []);
        } catch { toast.error('Failed to update product option'); }
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, totalItems, subtotal, addToCart, removeFromCart, updateQuantity, updateItemOptions, clearCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
