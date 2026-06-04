'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
    ShoppingBag, 
    CreditCard, 
    Star, 
    ArrowRight, 
    Copy, 
    Check, 
    ExternalLink, 
    Calendar, 
    Package, 
    Clock, 
    Truck, 
    CheckCircle2, 
    AlertCircle, 
    Repeat2, 
    Home, 
    History,
    ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { addToCart } = useCart();
    
    const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
    const [rawOrders, setRawOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        favoriteProduct: null as string | null,
        repeatPurchases: 0,
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login?redirect=/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchPurchaseHistory();
        }
    }, [user]);

    const fetchPurchaseHistory = async () => {
        try {
            const response = await api.get('/orders/myorders');
            const orders = response.data || [];
            setRawOrders(orders);

            // Process purchase history
            const productMap = new Map();
            let totalOrders = 0;
            let totalSpent = 0;

            orders.forEach((order: any) => {
                totalOrders++;
                totalSpent += order.totalPrice || 0;

                order.items?.forEach((item: any) => {
                    const key = item.productId || item.name;
                    if (productMap.has(key)) {
                        productMap.get(key).quantity += item.quantity || 1;
                        productMap.get(key).purchases += 1;
                    } else {
                        productMap.set(key, {
                            ...item,
                            quantity: item.quantity || 1,
                            purchases: 1,
                            lastBought: new Date(order.createdAt).toLocaleDateString(),
                        });
                    }
                });
            });

            // Sort by repeat purchases
            const sorted = Array.from(productMap.values())
                .sort((a, b) => b.purchases - a.purchases);

            setPurchaseHistory(sorted);

            setStats({
                totalOrders,
                totalSpent: Math.round(totalSpent),
                favoriteProduct: sorted[0]?.name || 'None yet',
                repeatPurchases: sorted.filter(p => p.purchases > 1).length,
            });
        } catch (err) {
            console.error('Failed to fetch purchase history:', err);
            setMockData();
        } finally {
            setLoading(false);
        }
    };

    const setMockData = () => {
        const mockProducts = [
            { name: 'Himalayan Pink Salt Makhana', purchases: 5, quantity: 15, price: 99, thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg', lastBought: '2026-03-10' },
            { name: 'Vegetable Chips', purchases: 3, quantity: 9, price: 149, thumbnail: '/images/products/vegetable-chips.svg', lastBought: '2026-03-05' },
            { name: 'Protein Power Diet Mix', purchases: 2, quantity: 6, price: 179, thumbnail: '/images/products/millet-cookies.svg', lastBought: '2026-02-28' },
        ];
        setPurchaseHistory(mockProducts);
        
        // Mock detailed orders
        const mockOrders = [
            {
                id: 'ORD-849204',
                createdAt: '2026-03-10T14:32:00.000Z',
                status: 'Delivered',
                totalPrice: 496,
                trackingId: 'AWB-7492049102',
                items: [
                    { name: 'Himalayan Pink Salt Makhana', quantity: 3, price: 99, weight: 75, packaging: 'pouch', image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg' },
                    { name: 'Vegetable Chips', quantity: 1, price: 149, weight: 100, packaging: 'jar', image: '/images/products/vegetable-chips.svg' }
                ]
            },
            {
                id: 'ORD-729482',
                createdAt: '2026-03-05T09:15:00.000Z',
                status: 'Shipped',
                totalPrice: 298,
                trackingId: 'AWB-5920481024',
                items: [
                    { name: 'Vegetable Chips', quantity: 2, price: 149, weight: 100, packaging: 'pouch', image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563581/shuddheats/products/broccoli-chips.jpg' }
                ]
            },
            {
                id: 'ORD-619204',
                createdAt: '2026-02-28T18:45:00.000Z',
                status: 'Processing',
                totalPrice: 657,
                trackingId: null,
                items: [
                    { name: 'Protein Power Diet Mix', quantity: 3, price: 179, weight: 100, packaging: 'jar', image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563587/shuddheats/products/jowar-nuts-cookies.jpg' },
                    { name: 'Himalayan Pink Salt Makhana', quantity: 1, price: 99, weight: 35, packaging: 'pouch', image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg' }
                ]
            }
        ];
        setRawOrders(mockOrders);

        setStats({
            totalOrders: mockOrders.length,
            totalSpent: 1451,
            favoriteProduct: 'Himalayan Pink Salt Makhana',
            repeatPurchases: 3,
        });
        setLoading(false);
    };

    const handleCopy = (text: string, id: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success(`${label} copied! 📋`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleBuyAgain = async (item: any) => {
        try {
            await addToCart(
                item.product || item.productId || 'mock-id',
                item.name,
                item.image || item.thumbnail || 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg',
                item.price,
                1,
                {
                    weight: item.weight || 75,
                    packaging: (item.packaging || 'pouch') as 'jar' | 'pouch'
                }
            );
            toast.success(`${item.name} added to cart! 🛒`);
        } catch (err) {
            console.error('Failed to add to cart:', err);
            toast.error('Failed to add item to cart');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 };
            case 'shipped':
                return { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700', icon: Truck };
            case 'processing':
                return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', icon: Clock };
            case 'cancelled':
                return { bg: 'bg-red-50 border-red-100', text: 'text-red-700', icon: AlertCircle };
            default:
                return { bg: 'bg-gray-50 border-gray-100', text: 'text-gray-700', icon: Clock };
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-[#fafaf7]">
                <div className="w-12 h-12 border-4 border-[#475d2a] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen pt-24 pb-20 bg-[#fafaf7]">
            <div className="page-container max-w-6xl">
                
                {/* Modern Welcoming Banner */}
                <div className="bg-gradient-to-br from-[#475d2a] via-[#3a4f22] to-[#2c3d18] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-md mb-12 animate-fadeInUp">
                    <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 to-transparent opacity-60 pointer-events-none"></div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="badge border-white/20 text-emerald-200 mb-4 bg-white/10 uppercase tracking-widest text-[10px] font-bold">
                            User Dashboard
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Welcome back, {user.name}! 👋</h1>
                        <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium">Explore your past order history, track live shipments, shop your favorites, or request support directly from your personal panel.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 animate-fadeInUp delay-100">
                    <div className="card border border-gray-100/60 p-5 sm:p-6 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                            <span className="text-xl">📦</span>
                        </div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Orders</p>
                        <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 text-[#475d2a]">{stats.totalOrders}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Placed since registration</p>
                    </div>

                    <div className="card border border-gray-100/60 p-5 sm:p-6 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                            <span className="text-xl">💰</span>
                        </div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Spent</p>
                        <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 text-amber-600">₹{stats.totalSpent.toLocaleString('en-IN')}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Lifetime value</p>
                    </div>

                    <div className="card border border-gray-100/60 p-5 sm:p-6 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="w-10 h-10 bg-[#f0f4ed] rounded-xl flex items-center justify-center mb-3">
                            <span className="text-xl">🔁</span>
                        </div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Repeat Buys</p>
                        <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 text-[#475d2a]">{stats.repeatPurchases}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Mascots recommended buys</p>
                    </div>

                    <div className="card border border-gray-100/60 p-5 sm:p-6 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-3">
                            <span className="text-xl">⭐</span>
                        </div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Top Snacker Pick</p>
                        <h3 className="text-xs sm:text-sm font-bold mt-1 line-clamp-2 text-[#475d2a] min-h-[2.5rem] leading-tight flex items-center">{stats.favoriteProduct}</h3>
                    </div>
                </div>

                {/* Main Sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    
                    {/* Order History - Left (col-span-8) */}
                    <div className="lg:col-span-8 space-y-6 animate-fadeInUp delay-200">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-[#475d2a] flex items-center gap-2">
                                <History className="w-5.5 h-5.5" /> Recent Orders
                            </h2>
                            <p className="text-xs text-gray-400 mt-1 font-medium">Keep track of your snack deliveries and order details</p>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="skeleton h-48 w-full" />
                                ))}
                            </div>
                        ) : rawOrders.length === 0 ? (
                            <div className="rounded-2xl p-10 text-center border border-gray-100 bg-white">
                                <div className="text-5xl mb-4">🌾</div>
                                <h3 className="text-base font-bold text-[#475d2a] mb-1">No Orders Placed Yet</h3>
                                <p className="text-xs text-gray-400 mb-6 max-w-sm mx-auto font-medium">Once you purchase a clean snack pack from our shop, it will show up here along with its tracking ID.</p>
                                <Link href="/shop" className="btn-primary text-xs py-2 px-4">
                                    Browse Our Shop
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {rawOrders.map((order) => {
                                    const statusStyle = getStatusStyles(order.status);
                                    const StatusIcon = statusStyle.icon;
                                    return (
                                        <div 
                                            key={order.id}
                                            className="card border border-gray-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-white rounded-2xl p-5 sm:p-6 hover:shadow-[0_12px_30px_-6px_rgba(71,93,42,0.06)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
                                        >
                                            {/* Header Bar */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100/80 pb-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-600">Ordered: {formatDate(order.createdAt)}</span>
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {order.status}
                                                </span>
                                            </div>

                                            {/* Order Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                                {/* Left - Purchased Items */}
                                                <div className="md:col-span-8 space-y-3">
                                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Items Purchased</p>
                                                    {order.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex gap-3 items-center bg-gray-50/50 hover:bg-gray-50 p-2 rounded-xl transition-all duration-200 border border-gray-100/50">
                                                            <div className="h-12 w-12 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100">
                                                                <img 
                                                                    src={item.image || 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg'} 
                                                                    alt={item.name} 
                                                                    className="h-full w-full object-contain" 
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xs font-bold text-gray-700 truncate">{item.name}</h4>
                                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                                    {item.weight && `${item.weight}g`}
                                                                    {item.weight && item.packaging && ' • '}
                                                                    {item.packaging && (item.packaging === 'jar' ? '🏺 Glass Jar' : '📦 Pouch')}
                                                                    {` • Qty: ${item.quantity}`}
                                                                </p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleBuyAgain(item)}
                                                                className="btn-outline border border-[#475d2a]/30 hover:border-[#475d2a] hover:bg-[#475d2a]/5 text-[#475d2a] text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-all"
                                                            >
                                                                Buy Again
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Right - Order Summaries */}
                                                <div className="md:col-span-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 md:pl-5 pt-4 md:pt-0">
                                                    <div className="space-y-3">
                                                        {/* Order ID Copy block */}
                                                        <div>
                                                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Order ID</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="font-mono text-xs font-bold text-gray-700 truncate max-w-[120px]">{order.id}</span>
                                                                <button 
                                                                    onClick={() => handleCopy(order.id, order.id, 'Order ID')}
                                                                    className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-[#475d2a] cursor-pointer"
                                                                    title="Copy Order ID"
                                                                >
                                                                    {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Tracking ID Copy block */}
                                                        <div>
                                                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Tracking AWB</p>
                                                            {order.trackingId ? (
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="font-mono text-xs font-bold text-emerald-700 truncate max-w-[120px]">{order.trackingId}</span>
                                                                    <button 
                                                                        onClick={() => handleCopy(order.trackingId, order.trackingId, 'Tracking ID')}
                                                                        className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-emerald-700 cursor-pointer"
                                                                        title="Copy Tracking ID"
                                                                    >
                                                                        {copiedId === order.trackingId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[10px] text-gray-400 italic mt-0.5 font-medium">Processing shipment...</p>
                                                            )}
                                                        </div>

                                                        {/* Pricing */}
                                                        <div>
                                                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Total Pricing</p>
                                                            <p className="text-xl font-extrabold text-[#475d2a] mt-0.5">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </div>

                                                    {/* Direct Track Button */}
                                                    <div className="mt-4 pt-2">
                                                        <Link 
                                                            href={`/track?id=${order.id}`}
                                                            className="w-full btn-primary text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm hover:shadow hover:scale-102 transition-all duration-200 block text-center font-bold"
                                                        >
                                                            Track Order <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Favorites & Shortcuts - Right (col-span-4) */}
                    <div className="lg:col-span-4 space-y-8 animate-fadeInUp delay-300">
                        {/* Compact Favorites list */}
                        <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-5">
                            <div>
                                <h3 className="text-lg font-extrabold text-[#475d2a] flex items-center gap-1.5">
                                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> Loved Snacks
                                </h3>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Items you buy most frequently</p>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
                                </div>
                            ) : purchaseHistory.length === 0 ? (
                                <p className="text-xs text-gray-400 italic py-4 font-medium text-center">No favorites marked yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {purchaseHistory.slice(0, 3).map((product, idx) => (
                                        <div key={idx} className="flex gap-3 items-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
                                            <div className="h-10 w-10 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100">
                                                <img 
                                                    src={product.thumbnail || 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg'} 
                                                    alt={product.name} 
                                                    className="h-full w-full object-contain" 
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-700 truncate">{product.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-extrabold text-[#475d2a]">₹{product.price}</span>
                                                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.25 rounded-md">Bought {product.purchases}x</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleBuyAgain(product)}
                                                className="p-1.5 hover:bg-[#475d2a] hover:text-white rounded-lg transition-all border border-gray-200 text-gray-600 cursor-pointer"
                                                title="Add to Cart"
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Navigation Shortcuts */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider pl-1">Quick Links</h3>
                            
                            <Link href="/shop" className="card border border-gray-100 p-5 bg-white hover:shadow-md hover:border-[#475d2a]/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🛍️</span>
                                    <div>
                                        <h4 className="font-bold text-sm text-[#475d2a]">Explore Snack Shop</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">Browse our full clean labeled range</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#475d2a] group-hover:translate-x-0.5 transition-all" />
                            </Link>

                            <Link href="/track" className="card border border-gray-100 p-5 bg-white hover:shadow-md hover:border-[#475d2a]/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📍</span>
                                    <div>
                                        <h4 className="font-bold text-sm text-[#475d2a]">Manual Order Tracker</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">Trace any order ID manually</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#475d2a] group-hover:translate-x-0.5 transition-all" />
                            </Link>

                            <Link href="/contact" className="card border border-gray-100 p-5 bg-white hover:shadow-md hover:border-[#475d2a]/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💬</span>
                                    <div>
                                        <h4 className="font-bold text-sm text-[#475d2a]">Customer Care Support</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">Talk to our clean-eating assistants</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#475d2a] group-hover:translate-x-0.5 transition-all" />
                            </Link>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
