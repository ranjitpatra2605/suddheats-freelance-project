'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, MessageSquare, Mail, User, Clock } from 'lucide-react';
import Link from 'next/link';

export default function QueriesPage() {
    const [queries, setQueries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/');
        } else if (user && user.role === 'admin') {
            fetchQueries();
        }
    }, [user]);

    const fetchQueries = async () => {
        try {
            const res = await api.get('/admin/queries');
            setQueries(res.data);
        } catch (error) {
            console.error('Error fetching queries:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-20">
            <div className="w-12 h-12 border-4 border-[#475d2a] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[#f9faf7]">
            <div className="page-container max-w-6xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#475d2a]">Customer Queries</h1>
                        <p className="text-gray-500 font-medium">Manage and view messages from the contact form</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {queries.map((q) => (
                        <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 animate-fadeInUp">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#f0f4ed] flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-[#475d2a]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{q.name}</h3>
                                        <a href={`mailto:${q.email}`} className="text-sm text-gray-500 hover:text-[#475d2a] flex items-center gap-1 transition-colors">
                                            <Mail className="w-3 h-3" /> {q.email}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#f9faf7] p-4 rounded-xl border border-gray-50 flex-1">
                                <h4 className="font-semibold text-[#475d2a] mb-2 text-sm">{q.subject}</h4>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{q.message}</p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(q.createdAt).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    ))}

                    {queries.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-[#f0f4ed] rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-10 h-10 text-[#475d2a]" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-700">No queries yet</h2>
                            <p className="text-gray-500">When customers contact you, they will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
