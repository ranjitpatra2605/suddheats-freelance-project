'use client';
import Link from 'next/link';
import { XCircle, RefreshCcw } from 'lucide-react';

export default function PaymentFailedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafaf7]">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full animate-scaleIn">
                <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                
                <h1 className="text-3xl font-extrabold text-red-600 mb-2">Payment Failed</h1>
                <p className="text-gray-500 mb-8">We couldn't process your payment, or the transaction was cancelled. Your account has not been charged.</p>
                
                <div className="flex flex-col gap-3">
                    <Link href="/checkout" className="btn-primary w-full justify-center py-3 bg-red-600 hover:bg-red-700 text-white border-0">
                        <RefreshCcw className="w-5 h-5 mr-2" /> Try Again
                    </Link>
                    <Link href="/shop" className="btn-outline w-full justify-center py-3">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
