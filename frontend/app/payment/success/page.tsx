'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect, Suspense } from 'react';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        if (orderId) {
            console.log("Payment Success Redirect verified. Order ID:", orderId);
        }
    }, [orderId]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafaf7]">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full animate-scaleIn">
                <div className="mx-auto w-20 h-20 bg-[#f0f4ed] rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-[#475d2a]" />
                </div>
                
                <h1 className="text-3xl font-extrabold text-[#475d2a] mb-2">Payment Successful!</h1>
                <p className="text-gray-500 mb-6">Your payment has been securely processed. Thank you for choosing ShuddhEats.</p>
                
                <div className="bg-[#f9faf8] p-4 rounded-xl border border-gray-100 mb-8 inline-block w-full">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Order ID</span>
                    <span className="block font-mono text-[#475d2a] font-bold text-lg">{orderId || 'Processing...'}</span>
                </div>

                <div className="flex flex-col gap-3">
                    <Link href="/track" className="btn-primary w-full justify-center py-3">
                        Track Order <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/shop" className="btn-outline w-full justify-center py-3">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
