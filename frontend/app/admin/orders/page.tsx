'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, X, User, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const STATUS_COLORS: any = { Pending: '#fef3c7', Processing: '#dbeafe', Shipped: '#e0ffe0', 'Out for Delivery': '#f3e8ff', Delivered: '#d1fae5', Cancelled: '#fee2e2' };
const STATUS_TEXT: any = { Pending: '#92400e', Processing: '#1e40af', Shipped: '#166534', 'Out for Delivery': '#6b21a8', Delivered: '#065f46', Cancelled: '#991b1b' };

function CustomerDetailsModal({ order, onClose }: { order: any; onClose: () => void }) {
    const addr = order.shippingAddress || {};
    const orderDate = new Date(order.createdAt);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
            <div className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl" style={{ background: '#fff', border: '2px solid #f0f4ed' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl" style={{ background: '#475d2a' }}>
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-white" />
                        <span className="font-bold text-white text-lg">Customer Details</span>
                    </div>
                    <button onClick={onClose} className="text-white hover:opacity-70 transition-opacity">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* Order ID strip */}
                <div className="px-6 py-2 text-xs font-mono font-bold" style={{ background: '#f0f4ed', color: '#475d2a' }}>
                    Order #{order.id.slice(-6).toUpperCase()}
                </div>
                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Name */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0f4ed' }}>
                            <User className="w-4 h-4" style={{ color: '#475d2a' }} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Customer Name</p>
                            <p className="font-bold" style={{ color: '#475d2a' }}>{addr.fullName || order.user?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{order.user?.email || ''}</p>
                        </div>
                    </div>
                    {/* Phone */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0f4ed' }}>
                            <Phone className="w-4 h-4" style={{ color: '#475d2a' }} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Phone Number</p>
                            <p className="font-semibold text-gray-700">{addr.phone || 'N/A'}</p>
                        </div>
                    </div>
                    {/* Address */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0f4ed' }}>
                            <MapPin className="w-4 h-4" style={{ color: '#475d2a' }} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Delivery Address</p>
                            <p className="font-semibold text-gray-700">{addr.addressLine1 || 'N/A'}</p>
                            {addr.addressLine2 && <p className="text-sm text-gray-500">{addr.addressLine2}</p>}
                            <p className="text-sm text-gray-600">{[addr.city, addr.state].filter(Boolean).join(', ')}</p>
                            {addr.pincode && <p className="text-sm text-gray-500">Pincode: <span className="font-semibold">{addr.pincode}</span></p>}
                        </div>
                    </div>
                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0f4ed' }}>
                            <Calendar className="w-4 h-4" style={{ color: '#475d2a' }} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Order Placed</p>
                            <p className="font-semibold text-gray-700">{orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="px-6 pb-5">
                    <button onClick={onClose} className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90" style={{ background: '#475d2a', color: 'white' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminOrdersPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => { if (!loading && (!user || !isAdmin)) router.push('/auth/login'); }, [user, isAdmin, loading]);

    const load = () => {
        api.get('/admin/orders').then(r => setOrders(r.data)).catch(() => setOrders([
            { id: 'ord1abc', user: { name: 'Priya Sharma', email: 'priya@example.com' }, totalPrice: 437, status: 'Processing', isPaid: true, createdAt: new Date().toISOString(), items: [{ name: 'Himalayan Makhana', quantity: 2, price: 199 }, { name: 'Air Fried Chips', quantity: 1, price: 89 }], shippingAddress: { fullName: 'Priya Sharma', phone: '9876543210', addressLine1: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' } },
            { id: 'ord2def', user: { name: 'Rahul Gupta', email: 'rahul@example.com' }, totalPrice: 249, status: 'Delivered', isPaid: true, createdAt: new Date().toISOString(), items: [{ name: 'Protein Diet Mix', quantity: 1, price: 249 }], shippingAddress: { fullName: 'Rahul Gupta', phone: '9123456789', addressLine1: '45 Park St', city: 'Kolkata', state: 'West Bengal', pincode: '700016' } },
        ])).finally(() => setFetching(false));
    };
    useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status });
            setOrders(o => o.map(ord => ord.id === orderId ? { ...ord, status } : ord));
            toast.success('Order status updated!');
        } catch { toast.error('Error updating status'); }
    };

    const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#fafaf7' }}>
            {selectedOrder && <CustomerDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            <div className="page-container">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 rounded-xl hover:bg-[#f0f4ed] transition-colors"><ArrowLeft className="w-5 h-5" style={{ color: '#475d2a' }} /></Link>
                    <h1 className="section-title">Orders ({filtered.length})</h1>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['All', ...STATUSES].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === s ? 'text-white' : 'bg-white text-gray-500 hover:bg-[#f0f4ed]'}`}
                            style={filter === s ? { background: '#475d2a' } : {}}>
                            {s}
                        </button>
                    ))}
                </div>

                {fetching ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">No orders found</div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(order => (
                            <div key={order.id} className="card p-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                                            style={{ background: '#475d2a', fontSize: '0.7rem' }}>
                                            #{order.id.slice(-4).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold" style={{ color: '#475d2a' }}>{order.user?.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-400">{order.user?.email}</p>
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                                {order.items?.slice(0, 2).map((item: any, i: number) => (
                                                    <span key={i} className="badge badge-primary text-xs">{item.name} ×{item.quantity}</span>
                                                ))}
                                                {order.items?.length > 2 && <span className="badge bg-gray-100 text-gray-500 text-xs">+{order.items.length - 2} more</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="text-right">
                                            <p className="font-bold text-lg" style={{ color: '#475d2a' }}>₹{order.totalPrice}</p>
                                            <p className={`text-xs font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                                                {order.isPaid ? '✓ Paid' : 'Unpaid'}
                                            </p>
                                        </div>
                                        {/* Details Button */}
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all hover:bg-[#475d2a] hover:text-white"
                                            style={{ borderColor: '#475d2a', color: '#475d2a', background: '#f0f4ed' }}>
                                            Details
                                        </button>
                                        <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                                            className="px-3 py-2 rounded-xl border-2 border-[#f0f4ed] text-sm font-semibold focus:outline-none focus:border-[#475d2a] transition-colors"
                                            style={{ background: STATUS_COLORS[order.status], color: STATUS_TEXT[order.status] }}>
                                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {/* Date + Time */}
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
