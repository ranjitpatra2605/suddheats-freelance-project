'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
    requiresTwoFA: boolean;
    tempSessionToken: string | null;
    verifyTwoFA: (totpCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [requiresTwoFA, setRequiresTwoFA] = useState(false);
    const [tempSessionToken, setTempSessionToken] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Safe localStorage access for mobile
            if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('shuddheats_user');
                if (stored) {
                    setUser(JSON.parse(stored));
                }
            }
        } catch (error) {
            console.warn('localStorage not available:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            console.log('🔐 Attempting login:', { email, hasPassword: !!password });
            const { data } = await api.post('/auth/login', { email, password });

            if (data.requiresTwoFA) {
                // Admin with 2FA enabled
                console.log('✅ 2FA required:', { email, role: data.role });
                setRequiresTwoFA(true);
                setTempSessionToken(data.tempSessionToken);
                return { requiresTwoFA: true };
            }

            // Normal login
            console.log('✅ Login successful:', { _id: data._id, email: data.email, role: data.role });
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('shuddheats_token', data.token);
                    localStorage.setItem('shuddheats_user', JSON.stringify(data));
                }
            } catch (e) {
                console.warn('Could not save to localStorage:', e);
            }
            setUser(data);
            setRequiresTwoFA(false);
            setTempSessionToken(null);
            return { requiresTwoFA: false };
        } catch (error) {
            console.warn('❌ Login failed:', error);
            throw error;
        }
    };

    const verifyTwoFA = async (totpCode: string) => {
        if (!tempSessionToken) {
            throw new Error('No temp session token available');
        }

        const { data } = await api.post('/auth/verify-2fa', {
            tempSessionToken,
            totpCode
        });

        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('shuddheats_token', data.token);
                localStorage.setItem('shuddheats_user', JSON.stringify(data));
            }
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
        setUser(data);
        setRequiresTwoFA(false);
        setTempSessionToken(null);
    };

    const register = async (name: string, email: string, password: string, phone?: string) => {
        try {
            console.log('📝 Attempting registration:', { name, email, phone, hasPassword: !!password });
            const { data } = await api.post('/auth/register', { name, email, password, phone });
            console.log('✅ Registration successful:', { _id: data._id, email: data.email, role: data.role });
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('shuddheats_token', data.token);
                    localStorage.setItem('shuddheats_user', JSON.stringify(data));
                }
            } catch (e) {
                console.warn('Could not save to localStorage:', e);
            }
            setUser(data);
        } catch (error) {
            console.error('❌ Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('shuddheats_token');
                localStorage.removeItem('shuddheats_user');
            }
        } catch (e) {
            console.warn('Could not clear localStorage:', e);
        }
        setUser(null);
        setRequiresTwoFA(false);
        setTempSessionToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin', requiresTwoFA, tempSessionToken, verifyTwoFA }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
