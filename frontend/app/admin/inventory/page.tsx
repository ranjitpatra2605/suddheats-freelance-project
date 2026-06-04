'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

export default function InventoryPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [inventory, setInventory] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStock, setEditStock] = useState('');

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) router.push('/auth/login');
    }, [user, isAdmin, loading]);

    useEffect(() => {
        if (!isAdmin) return;
        const fetchInventory = async () => {
            try {
                const { data } = await api.get('/admin/inventory');
                setInventory(data);
            } catch {
                // Mock data fallback
                setInventory([
                    { id: '1', name: 'Himalayan Pink Salt Makhana', sku: 'MAKH-001', stock: 150, minStock: 20, category: 'Makhana' },
                    { id: '2', name: 'Peri Peri Makhana', sku: 'MAKH-002', stock: 120, minStock: 20, category: 'Makhana' },
                    { id: '3', name: 'Butter & Herbs Makhana', sku: 'MAKH-003', stock: 90, minStock: 20, category: 'Makhana' },
                    { id: '4', name: 'Classic Salted Air Fried Chips', sku: 'CHIP-001', stock: 200, minStock: 30, category: 'Air Fried Chips' },
                    { id: '5', name: 'Masala Air Fried Chips', sku: 'CHIP-002', stock: 180, minStock: 30, category: 'Air Fried Chips' },
                    { id: '6', name: 'Beetroot & Spinach Chips', sku: 'CHIP-003', stock: 100, minStock: 25, category: 'Air Fried Chips' },
                    { id: '7', name: 'Protein Power Diet Mix', sku: 'MIX-001', stock: 80, minStock: 15, category: 'Diet Mix' },
                    { id: '8', name: 'Trail Mix Supreme', sku: 'MIX-002', stock: 60, minStock: 15, category: 'Diet Mix' },
                    { id: '9', name: 'Chaat Flavoured Roasted Mixture', sku: 'MIX-003', stock: 110, minStock: 20, category: 'Diet Mix' },
                ]);
            } finally {
                setFetching(false);
            }
        };
        fetchInventory();
    }, [isAdmin]);

    const handleUpdateStock = async (id: string) => {
        try {
            await api.patch(`/admin/inventory/${id}`, { stock: parseInt(editStock) });
            setInventory(inv => inv.map(item => item.id === id ? { ...item, stock: parseInt(editStock) } : item));
            setEditingId(null);
            setEditStock('');
        } catch (err) {
            console.error('Error updating stock:', err);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/admin/inventory/${id}`);
            setInventory(inv => inv.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error deleting item:', err);
        }
    };

    if (loading || fetching) return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#475d2a] border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    const lowStockItems = inventory.filter(item => item.stock <= item.minStock);

    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#fafaf7' }}>
            <div className="page-container">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="section-title">Inventory Management</h1>
                        <p className="section-subtitle">Manage product stock levels</p>
                    </div>
                    <button className="btn-primary text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                </div>

                {/* Low Stock Alert */}
                {lowStockItems.length > 0 && (
                    <div className="card p-4 mb-6 bg-orange-50 border-l-4" style={{ borderColor: 'rgb(223, 196, 172)' }}>
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-orange-900 mb-1">Low Stock Alert</h3>
                                <p className="text-sm text-orange-800">{lowStockItems.length} product(s) are below minimum stock level</p>
                                <div className="mt-2 flex gap-2 flex-wrap">
                                    {lowStockItems.map(item => (
                                        <span key={item.id} className="text-xs bg-orange-200 text-orange-900 px-2 py-1 rounded">
                                            {item.name}: {item.stock}/{item.minStock}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inventory Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead style={{ background: '#f0f4ed' }}>
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#475d2a' }}>Product</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#475d2a' }}>SKU</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#475d2a' }}>Category</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: '#475d2a' }}>Current Stock</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: '#475d2a' }}>Min Level</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: '#475d2a' }}>Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold" style={{ color: '#475d2a' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                                        <td className="px-6 py-4 text-center">
                                            {editingId === item.id ? (
                                                <input
                                                    type="number"
                                                    value={editStock}
                                                    onChange={(e) => setEditStock(e.target.value)}
                                                    className="input-field w-20 text-center"
                                                />
                                            ) : (
                                                <span className="font-bold" style={{ color: '#475d2a' }}>{item.stock}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.minStock}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                                    item.stock > item.minStock
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {item.stock > item.minStock ? 'In Stock' : 'Low'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {editingId === item.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStock(item.id)}
                                                            className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingId(null); setEditStock(''); }}
                                                            className="text-xs bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => { setEditingId(item.id); setEditStock(item.stock.toString()); }}
                                                            className="text-gray-500 hover:text-blue-500"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(item.id)}
                                                            className="text-gray-500 hover:text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="card p-6 text-center">
                        <p className="text-gray-600 text-sm mb-2">Total Products</p>
                        <p className="text-3xl font-bold" style={{ color: '#475d2a' }}>{inventory.length}</p>
                    </div>
                    <div className="card p-6 text-center">
                        <p className="text-gray-600 text-sm mb-2">Total Stock</p>
                        <p className="text-3xl font-bold" style={{ color: '#475d2a' }}>
                            {inventory.reduce((sum, item) => sum + item.stock, 0)}
                        </p>
                    </div>
                    <div className="card p-6 text-center">
                        <p className="text-gray-600 text-sm mb-2">Low Stock Items</p>
                        <p className="text-3xl font-bold text-orange-500">{lowStockItems.length}</p>
                    </div>
                    <div className="card p-6 text-center">
                        <p className="text-gray-600 text-sm mb-2">Avg Stock Level</p>
                        <p className="text-3xl font-bold" style={{ color: '#475d2a' }}>
                            {Math.round(inventory.reduce((sum, item) => sum + item.stock, 0) / inventory.length)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
