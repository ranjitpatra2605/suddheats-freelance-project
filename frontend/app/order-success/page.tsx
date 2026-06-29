'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home, Sparkles, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto pt-20 sm:pt-0" style={{ background: 'rgba(255,255,255,0.97)' }}>
            <div className="text-center max-w-md mx-3 sm:mx-4 my-8 sm:my-0 animate-scaleIn">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-6">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center animate-pulse-green"
                        style={{ background: 'linear-gradient(135deg, #475d2a, #5a7434)' }}>
                        <svg viewBox="0 0 52 52" className="w-12 h-12 sm:w-16 sm:h-16">
                            <circle cx="26" cy="26" r="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                            <path fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                strokeDasharray="100" strokeDashoffset="0" d="M14 27 l8 8 l16-16"
                                style={{ animation: 'checkmark 0.5s ease 0.3s both' }} />
                        </svg>
                    </div>
                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 text-[rgb(223,196,172)] animate-bounce-slow" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold mb-2 sm:mb-3" style={{ color: '#475d2a' }}>Order Placed! 🎉</h1>
                
                <p className="text-gray-500 text-sm sm:text-lg mb-2">Thank you for choosing ShuddhEats!</p>
                
                <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-mono font-bold mb-6 sm:mb-8"
                    style={{ background: '#f0f4ed', color: '#475d2a' }}>
                    Order ID: {orderId || 'Loading...'}
                </div>
                
                <div className="flex justify-center gap-0 mb-8 sm:mb-10 overflow-x-auto px-2">
                    {[
                        { Icon: CheckCircle, label: 'Confirmed', done: true },
                        { Icon: Package, label: 'Packing', done: false },
                        { Icon: Truck, label: 'Shipped', done: false },
                        { Icon: Home, label: 'Delivered', done: false },
                    ].map(({ Icon, label, done }, i, arr) => (
                        <div key={label} className="flex items-center flex-shrink-0">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${done ? 'text-white' : 'text-gray-300'}`}
                                    style={done ? { background: '#475d2a' } : { background: '#f3f4f6' }}>
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <span className="text-xs mt-1 font-medium whitespace-nowrap" style={{ color: done ? '#475d2a' : '#9ca3af' }}>{label}</span>
                            </div>
                            {i < arr.length - 1 && <div className="w-6 sm:w-10 h-0.5 -mt-4 sm:-mt-5" style={{ background: done ? '#f0f4ed' : '#f3f4f6' }} />}
                        </div>
                    ))}
                </div>
                
                <div className="flex flex-col gap-2.5 sm:gap-3">
                    <Link href="/track" className="btn-primary justify-center text-xs sm:text-base py-3 sm:py-4 w-full">
                        Track Your Order <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <Link href="/shop" className="btn-outline justify-center py-2.5 sm:py-3 w-full text-xs sm:text-base">Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
