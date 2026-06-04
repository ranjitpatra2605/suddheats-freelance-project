'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Copy, Check } from 'lucide-react';

interface BackupCode {
    code: string;
    copied?: boolean;
}

export default function TwoFASettingsPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [manualKey, setManualKey] = useState('');
    const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
    const [verifyCode, setVerifyCode] = useState('');
    const [disablePassword, setDisablePassword] = useState('');
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Wait for auth to load before checking
        if (!authLoading && !isAdmin) {
            router.push('/auth/login');
            return;
        }

        // Only fetch if we're authenticated and admin
        if (!authLoading && isAdmin) {
            fetchTwoFAStatus();
        }
    }, [authLoading, isAdmin, router]);

    // Show loading screen while auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4ed' }}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-green-600 rounded-full mx-auto mb-4" style={{ animation: 'spin 1s linear infinite' }}></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const fetchTwoFAStatus = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setTwoFAEnabled(data.twoFactorEnabled);
        } catch (err) {
            console.error('Error fetching 2FA status:', err);
        }
    };

    const handleSetup2FA = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/twofa/setup');
            setQrCode(data.qrCode);
            setManualKey(data.manual_entry_key);
            setBackupCodes(data.backupCodes.map((code: string) => ({ code })));
            setVerificationStep(true);
            toast.success('Scan the QR code with your authenticator app');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to setup 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySetup = async () => {
        if (verifyCode.length !== 6) {
            toast.error('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/twofa/verify-setup', {
                totpCode: verifyCode,
                secret: manualKey
            });
            setTwoFAEnabled(true);
            setBackupCodes(data.backupCodes.map((code: string) => ({ code })));
            setShowBackupCodes(true);
            setVerificationStep(false);
            setVerifyCode('');
            toast.success('2FA enabled successfully! Store your backup codes in a safe place.');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to verify code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!disablePassword) {
            toast.error('Please enter your password');
            return;
        }

        setLoading(true);
        try {
            await api.post('/twofa/disable', { password: disablePassword });
            setTwoFAEnabled(false);
            setDisablePassword('');
            setShowBackupCodes(false);
            setBackupCodes([]);
            toast.success('2FA disabled successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCodes(prev => new Set(prev).add(code));
        setTimeout(() => {
            setCopiedCodes(prev => {
                const newSet = new Set(prev);
                newSet.delete(code);
                return newSet;
            });
        }, 2000);
    };

    const downloadBackupCodes = () => {
        const text = backupCodes.map(bc => bc.code).join('\n');
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', 'backup-codes.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="min-h-screen py-8" style={{ background: '#f0f4ed' }}>
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8" style={{ color: '#475d2a' }}>Two-Factor Authentication</h1>

                {/* Current Status */}
                <div className="card p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2" style={{ color: '#475d2a' }}>Status</h2>
                            <p className={`text-sm font-semibold ${twoFAEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                                {twoFAEnabled ? '✓ 2FA is enabled' : '○ 2FA is disabled'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Setup Section */}
                {!twoFAEnabled && !verificationStep && (
                    <div className="card p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4" style={{ color: '#475d2a' }}>Enable Two-Factor Authentication</h2>
                        <p className="text-gray-600 mb-4">
                            Two-factor authentication adds an extra layer of security to your account. You'll need to enter a code from your authenticator app when you log in.
                        </p>
                        <button
                            onClick={handleSetup2FA}
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3"
                        >
                            {loading ? 'Setting up...' : 'Enable 2FA'}
                        </button>
                    </div>
                )}

                {/* Verification Step */}
                {verificationStep && (
                    <div className="card p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4" style={{ color: '#475d2a' }}>Scan QR Code</h2>

                        {qrCode && (
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-3">Scan this QR code with your authenticator app:</p>
                                <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48 border-2 border-gray-200 rounded" />
                            </div>
                        )}

                        <div className="bg-gray-100 p-3 rounded mb-6">
                            <p className="text-xs text-gray-600 mb-2">OR enter this key manually:</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 font-mono text-sm bg-white p-2 rounded border border-gray-300">{manualKey}</code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(manualKey);
                                        toast.success('Copied!');
                                    }}
                                    className="p-2 hover:bg-gray-200 rounded"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#475d2a' }}>Enter 6-digit code:</label>
                            <input
                                type="text"
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                className="input-field text-center text-2xl font-mono tracking-widest"
                                pattern="[0-9]*"
                            />
                        </div>

                        <button
                            onClick={handleVerifySetup}
                            disabled={loading || verifyCode.length !== 6}
                            className="btn-primary w-full justify-center py-3 mb-2"
                        >
                            {loading ? 'Verifying...' : 'Verify & Enable'}
                        </button>
                        <button
                            onClick={() => {
                                setVerificationStep(false);
                                setVerifyCode('');
                                setQrCode('');
                                setManualKey('');
                            }}
                            className="w-full py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Backup Codes */}
                {showBackupCodes && (
                    <div className="card p-6 mb-6 border-2 border-green-200 bg-green-50">
                        <div className="flex items-center gap-2 mb-4">
                            <Check className="w-5 h-5 text-green-600" />
                            <h2 className="text-xl font-bold" style={{ color: '#475d2a' }}>Backup Codes</h2>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">
                            <strong>Important:</strong> Save these 10 backup codes in a safe place. You can use one of these codes instead of your authenticator code if you lose your phone.
                        </p>
                        <div className="bg-white p-4 rounded border border-gray-300 mb-4 max-h-40 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                                {backupCodes.map((bc, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <code className="flex-1 font-mono text-sm">{bc.code}</code>
                                        <button
                                            onClick={() => copyToClipboard(bc.code)}
                                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                        >
                                            {copiedCodes.has(bc.code) ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={downloadBackupCodes}
                            className="w-full py-2 border border-green-600 text-green-600 rounded hover:bg-green-100"
                        >
                            Download Backup Codes
                        </button>
                    </div>
                )}

                {/* Disable 2FA */}
                {twoFAEnabled && (
                    <div className="card p-6 border-2 border-red-200 bg-red-50">
                        <h2 className="text-xl font-bold mb-4" style={{ color: '#475d2a' }}>Disable Two-Factor Authentication</h2>
                        <p className="text-sm text-gray-700 mb-4">
                            Enter your password to disable 2FA. This will remove the requirement to enter an authenticator code during login.
                        </p>
                        <input
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            placeholder="Enter your password"
                            className="input-field mb-4"
                        />
                        <button
                            onClick={handleDisable2FA}
                            disabled={loading || !disablePassword}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
