'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, useRef } from 'react';
import api from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

interface ConfettiPiece { id: number; left: string; color: string; delay: string; size: string; }

function ConfettiEffect() {
    const pieces: ConfettiPiece[] = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        color: ['#475d2a', 'rgb(223, 196, 172)', '#f0f4ed', '#ffffff', '#ff6b6b', '#4ecdc4'][Math.floor(Math.random() * 6)],
        delay: `${Math.random() * 2}s`,
        size: `${6 + Math.random() * 10}px`,
    }));
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map(p => (
                <div key={p.id} className="confetti-piece absolute"
                    style={{ left: p.left, backgroundColor: p.color, width: p.size, height: p.size, animationDuration: `${2 + Math.random() * 2}s`, animationDelay: p.delay }} />
            ))}
        </div>
    );
}

function PaymentVerifyContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const verifiedRef = useRef(false);

    useEffect(() => {
        if (!orderId || verifiedRef.current) return;
        verifiedRef.current = true;
        
        const verifyPayment = async () => {
            try {
                // Poll/verify backend
                const response = await api.get(`/payment/status/${orderId}`);
                if (response.data.isPaid || response.data.status === 'PAID') {
                    setStatus('success');
                    // Wait 3 seconds to show confetti, then redirect to order-success
                    setTimeout(() => {
                        router.push(`/order-success?order_id=${orderId}`);
                    }, 3500);
                } else {
                    setStatus('failed');
                    setTimeout(() => {
                        router.push(`/payment-failed`);
                    }, 2500);
                }
            } catch (error) {
                console.error("Error verifying payment status:", error);
                setStatus('failed');
                setTimeout(() => {
                    router.push(`/payment-failed`);
                }, 2500);
            }
        };

        // Delay slightly to give webhook time to process if needed
        setTimeout(verifyPayment, 1500);

    }, [orderId, router]);

    if (!orderId) {
        return <div className="min-h-screen flex flex-col items-center justify-center">Invalid Order ID</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafaf7]">
            {status === 'verifying' && (
                <div className="text-center animate-pulse">
                    <div className="w-16 h-16 border-4 border-[#475d2a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold text-[#475d2a]">Verifying your payment...</h2>
                    <p className="text-gray-500 mt-2">Please do not close this window.</p>
                </div>
            )}
            
            {status === 'success' && (
                <>
                    <ConfettiEffect />
                    <div className="text-center animate-scaleIn z-10 relative">
                        <div className="mx-auto w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-14 h-14 text-green-600" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-[#475d2a] mb-4">Payment Successful! 🎉</h1>
                        <p className="text-lg text-gray-600 mb-6 font-medium">Preparing your order details...</p>
                    </div>
                </>
            )}

            {status === 'failed' && (
                <div className="text-center animate-scaleIn z-10 relative">
                    <div className="mx-auto w-28 h-28 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="w-14 h-14 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-red-600 mb-4">Payment Failed</h1>
                    <p className="text-lg text-gray-600 mb-6 font-medium">Redirecting back to checkout...</p>
                </div>
            )}
        </div>
    );
}

export default function PaymentVerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PaymentVerifyContent />
        </Suspense>
    );
}
