'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search, Package, Truck, CheckCircle, Clock, Home, AlertCircle } from 'lucide-react';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
const STATUS_ICONS: any = { Pending: Clock, Processing: Package, Shipped: Truck, 'Out for Delivery': Truck, Delivered: CheckCircle, Cancelled: AlertCircle };

export default function TrackPage() {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const trackOrder = async (id: string) => {
        setLoading(true); setError(''); setOrder(null);
        try {
            const { data } = await api.get(`/orders/track/${id}`);
            setOrder(data);
        } catch {
            // Mock order for demo
            if (id.startsWith('MOCK-') || id.startsWith('ORD-')) {
                setOrder({
                    id: id,
                    status: 'Processing',
                    createdAt: new Date().toISOString(),
                    isPaid: true,
                    totalPrice: 437,
                    items: [{ name: 'Himalayan Pink Salt Makhana', quantity: 2, price: 199 }],
                    shippingAddress: { fullName: 'Test User', city: 'Mumbai', pincode: '400001' }
                });
            } else {
                setError('Order not found. Please check your Order ID.');
            }
        } finally { setLoading(false); }
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;
        trackOrder(orderId.trim());
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const queryParams = new URLSearchParams(window.location.search);
            const urlId = queryParams.get('id');
            if (urlId) {
                setOrderId(urlId);
                trackOrder(urlId);
            }
        }
    }, []);

    const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#fafaf7' }}>
            <div className="page-container max-w-2xl">
                <div className="text-center mb-10">
                    <div className="badge badge-primary mb-4">Order Tracking</div>
                    <h1 className="section-title">Track Your Snacks 📦</h1>
                    <p className="section-subtitle mt-2">Enter your Order ID to see real-time delivery status</p>
                </div>

                <form onSubmit={handleTrack} className="card p-6 mb-6">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#475d2a' }}>Order ID</label>
                    <div className="flex gap-3">
                        <input value={orderId} onChange={e => setOrderId(e.target.value)}
                            placeholder="e.g. 6789abc or MOCK-1709123456789"
                            className="input-field flex-1" />
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} /> : <Search className="w-5 h-5" />}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
                </form>

                {order && (
                    <div className="space-y-4 animate-fadeInUp">
                        {/* Status Card */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs text-gray-400 font-mono">ORDER ID</p>
                                    <p className="font-bold" style={{ color: '#475d2a' }}>{order.id}</p>
                                </div>
                                <span className={`badge ${order.status === 'Delivered' ? '' : order.status === 'Cancelled' ? '' : 'badge-primary'}`}
                                    style={order.status === 'Delivered' ? { background: '#d1fae5', color: '#065f46' } : order.status === 'Cancelled' ? { background: '#fee2e2', color: '#991b1b' } : {}}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Progress Steps */}
                            {order.status !== 'Cancelled' && (
                                <div className="flex justify-between relative">
                                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 mx-8" />
                                    <div className="absolute top-5 left-0 h-0.5 bg-[#475d2a] mx-8 transition-all duration-700"
                                        style={{ width: `${(Math.min(currentStep, STATUS_STEPS.length - 1) / (STATUS_STEPS.length - 1)) * 100}%` }} />
                                    {STATUS_STEPS.map((s, i) => {
                                        const done = i <= currentStep;
                                        const Icon = STATUS_ICONS[s] || Clock;
                                        return (
                                            <div key={s} className="flex flex-col items-center z-10">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${done ? 'text-white' : 'text-gray-300 bg-white border-2 border-gray-200'}`}
                                                    style={done ? { background: '#475d2a' } : {}}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs mt-2 font-medium text-center max-w-[56px] leading-tight"
                                                    style={{ color: done ? '#475d2a' : '#9ca3af' }}>{s}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="card p-6">
                            <h3 className="font-bold mb-4" style={{ color: '#475d2a' }}>Order Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Order Date</span><span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className={order.isPaid ? 'text-green-600 font-medium' : 'text-orange-500'}>{order.isPaid ? '✓ Paid' : 'Pending'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold" style={{ color: '#475d2a' }}>₹{order.totalPrice}</span></div>
                                {order.shippingAddress && <div className="flex justify-between"><span className="text-gray-500">Deliver to</span><span>{order.shippingAddress.fullName}, {order.shippingAddress.city}</span></div>}
                            </div>
                            {order.items && order.items.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="font-semibold text-sm mb-3" style={{ color: '#475d2a' }}>Items</h4>
                                    {order.items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between text-sm py-1">
                                            <span>{item.name} × {item.quantity}</span>
                                            <span className="font-medium">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
