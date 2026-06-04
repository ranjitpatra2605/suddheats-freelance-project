'use client';
import { useState, Suspense, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, requiresTwoFA } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await login(email, password);
            
            if (result?.requiresTwoFASetup) {
                toast.success('Admin login successful. Please set up 2FA.');
                router.push('/admin/settings/2fa');
            } else if (result?.requiresTwoFA) {
                toast.success('2FA Required');
                router.push('/auth/2fa');
            } else {
                toast.success('Welcome back! 🌿');
                router.push(redirect);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally { setLoading(false); }
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
                    <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#475d2a' }}>Welcome Back!</h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-1">Sign in to your ShuddhEats account</p>
                </div>
                <div className="card p-4 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: '#475d2a' }}>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                placeholder="you@email.com" className="input-field text-sm py-2.5 sm:py-2 px-3 sm:px-4 w-full" />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: '#475d2a' }}>Password</label>
                            <div className="relative">
                                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                    placeholder="Enter your password" className="input-field text-sm py-2.5 sm:py-2 px-3 sm:px-4 pr-12 w-full" />
                                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1" title={show ? "Hide password" : "Show password"}>
                                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 sm:py-4 mt-2 text-sm sm:text-base h-12 sm:h-auto flex items-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Login'}
                        </button>
                    </form>
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs sm:text-sm text-gray-500">Don't have an account?{' '}
                            <Link href="/auth/register" className="font-bold hover:underline" style={{ color: '#475d2a' }}>Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4ed' }}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-[#475d2a] rounded-full animate-spin mx-auto mb-4"></div>
                    <p style={{ color: '#475d2a' }} className="font-semibold">Loading...</p>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
