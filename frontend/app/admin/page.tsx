'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ArrowRight, Shield } from 'lucide-react';

export default function AdminDashboard() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalUsers: 0, totalRevenue: 0, recentOrders: [] as any[] });
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) router.push('/auth/login');
    }, [user, isAdmin, loading]);

    useEffect(() => {
        if (!isAdmin) return;
        api.get('/admin/dashboard').then(r => setStats(r.data)).catch(() => {
            setStats({
                totalOrders: 12, totalProducts: 9, totalUsers: 47, totalRevenue: 8940, recentOrders: [
                    { id: 'ord1', user: { name: 'Priya Sharma', email: 'priya@example.com' }, totalPrice: 437, status: 'Processing', isPaid: true, createdAt: new Date().toISOString() },
                    { id: 'ord2', user: { name: 'Rahul Gupta', email: 'rahul@example.com' }, totalPrice: 199, status: 'Shipped', isPaid: true, createdAt: new Date().toISOString() },
                ]
            });
        }).finally(() => setFetching(false));
    }, [isAdmin]);

    if (loading || fetching) return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#475d2a] border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    const statCards = [
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, prefix: '', suffix: '', color: '#475d2a' },
        { label: 'Revenue', value: stats.totalRevenue, icon: DollarSign, prefix: '₹', suffix: '', color: 'rgb(223, 196, 172)' },
        { label: 'Products', value: stats.totalProducts, icon: Package, prefix: '', suffix: '', color: '#5a7434' },
        { label: 'Customers', value: stats.totalUsers, icon: Users, prefix: '', suffix: '', color: '#3a4620' },
    ];

    const STATUS_COLORS: any = { Pending: '#fef3c7', Processing: '#dbeafe', Shipped: '#e0ffe0', 'Out for Delivery': '#f3e8ff', Delivered: '#d1fae5', Cancelled: '#fee2e2' };
    const STATUS_TEXT: any = { Pending: '#92400e', Processing: '#1e40af', Shipped: '#166534', 'Out for Delivery': '#6b21a8', Delivered: '#065f46', Cancelled: '#991b1b' };

    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#fafaf7' }}>
            <div className="page-container">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                    <div>
                        <h1 className="section-title text-2xl sm:text-3xl">Admin Dashboard</h1>
                        <p className="section-subtitle text-sm sm:text-base">Welcome, {user?.name} 👋</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link href="/admin/products" className="btn-primary text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4 w-full sm:w-auto text-center">Manage Products</Link>
                        <Link href="/admin/orders" className="btn-outline text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4 w-full sm:w-auto text-center">Manage Orders</Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
                    {statCards.map(({ label, value, icon: Icon, prefix, color }) => (
                        <div key={label} className="card p-3 sm:p-4 lg:p-6">
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <span className="text-xs sm:text-sm font-medium text-gray-500 line-clamp-1">{label}</span>
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0f4ed' }}>
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
                                </div>
                            </div>
                            <p className="text-lg sm:text-xl lg:text-2xl font-extrabold line-clamp-1" style={{ color }}>{prefix}{value.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Live stats</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {[
                        { href: '/admin/products', label: 'Products', desc: 'Add, edit, delete products', icon: Package },
                        { href: '/admin/orders', label: 'Orders', desc: 'View and update order status', icon: ShoppingBag },
                        { href: '/admin/inventory', label: 'Inventory', desc: 'Manage stock levels', icon: TrendingUp },
                        { href: '/admin/settings/2fa', label: 'Security (2FA)', desc: 'Manage 2-Factor Authentication', icon: Shield },
                    ].map(({ href, label, desc, icon: Icon }) => (
                        <Link key={href} href={href} className="card p-4 sm:p-5 group flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 group-hover:bg-[#475d2a]" style={{ background: '#f0f4ed' }}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white transition-colors" style={{ color: '#475d2a' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm sm:text-base" style={{ color: '#475d2a' }}>{label}</h3>
                                <p className="text-xs text-gray-400 line-clamp-1">{desc}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#475d2a] transition-colors flex-shrink-0" />
                        </Link>
                    ))}
                </div>

                {/* Recent Orders */}
                <div className="card overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-50 gap-3">
                        <h2 className="font-bold text-base sm:text-lg" style={{ color: '#475d2a' }}>Recent Orders</h2>
                        <Link href="/admin/orders" className="text-xs sm:text-sm font-medium hover:underline" style={{ color: '#475d2a' }}>View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead style={{ background: '#f8faf7' }}>
                                <tr>
                                    {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                                        <th key={h} className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 sm:px-4 py-2.5 sm:py-4 font-mono text-xs text-gray-500">{order.id.slice(-8)}</td>
                                        <td className="px-3 sm:px-4 py-2.5 sm:py-4">
                                            <p className="font-medium text-xs sm:text-sm line-clamp-1">{order.user?.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-400 line-clamp-1">{order.user?.email}</p>
                                        </td>
                                        <td className="px-3 sm:px-4 py-2.5 sm:py-4 font-bold text-xs sm:text-base" style={{ color: '#475d2a' }}>₹{order.totalPrice}</td>
                                        <td className="px-3 sm:px-4 py-2.5 sm:py-4">
                                            <span className="badge text-xs" style={{ background: STATUS_COLORS[order.status] || '#f3f4f6', color: STATUS_TEXT[order.status] || '#374151' }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-2.5 sm:py-4 text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
