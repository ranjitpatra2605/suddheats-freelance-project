'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function TwoFAVerifyPage() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { verifyTwoFA, requiresTwoFA, tempSessionToken } = useAuth();
    const router = useRouter();

    // Only check on initial load if we should be on this page
    useEffect(() => {
        // If not in 2FA flow, redirect back to login
        if (!requiresTwoFA && !tempSessionToken) {
            router.push('/auth/login');
        }
    }, []); // Only run once on mount

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
        setCode(value);
        setError('');

        // Auto-submit when 6 purely numerical digits are entered
        if (/^\d{6}$/.test(value)) {
            handleSubmit(value);
        }
    };

    const handleSubmit = async (codeToSubmit: string = code) => {
        if (codeToSubmit.length !== 6 && codeToSubmit.length !== 8) {
            setError('Please enter a 6-digit authenticator code or 8-character backup code');
            return;
        }

        setLoading(true);
        try {
            await verifyTwoFA(codeToSubmit);
            toast.success('2FA verified successfully!');
            router.push('/admin');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Invalid code. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            setCode('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-3 sm:px-4" style={{ background: '#f0f4ed' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #475d2a' }}>
                        <Image
                            src="https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563574/shuddheats/assets/logo-se-circle.png"
                            alt="ShuddhEats Logo"
                            width={80}
                            height={80}
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#475d2a' }}>Two-Factor Auth</h1>
                    <p className="text-xs sm:text-base text-gray-500 mt-1 sm:mt-2">Enter the 6-digit code from your app</p>
                </div>

                <div className="card p-4 sm:p-8">
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-center" style={{ color: '#475d2a' }}>Authenticator Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={handleCodeChange}
                            placeholder="Code / Backup Code"
                            maxLength={8}
                            disabled={loading}
                            autoFocus
                            className="input-field text-center text-xl sm:text-2xl tracking-widest font-mono p-3 sm:p-4 w-full"
                        />
                        {error && (
                            <p className="text-red-500 text-xs sm:text-sm mt-2 text-center">{error}</p>
                        )}
                    </div>

                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading || (code.length !== 6 && code.length !== 8)}
                        className="btn-primary w-full justify-center py-3 sm:py-4 mt-4 sm:mt-6 text-sm sm:text-base h-12 sm:h-auto flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                            'Verify'
                        )}
                    </button>

                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            Can't find your code?{' '}
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="font-bold hover:underline"
                                style={{ color: '#475d2a' }}
                            >
                                Try again
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
