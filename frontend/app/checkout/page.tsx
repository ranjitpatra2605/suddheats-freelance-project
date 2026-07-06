'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { load } from '@cashfreepayments/cashfree-js';

function PaymentProcessingModal() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="card p-6 sm:p-10 max-w-sm w-full text-center animate-scaleIn bg-white rounded-2xl shadow-xl">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-[#475d2a] rounded-full animate-spin"></div>
                </div>
                <div className="text-lg sm:text-xl font-bold mb-3" style={{ color: '#475d2a' }}>
                    Redirecting to Secure Payment...
                </div>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    Please wait while we securely redirect you to the payment gateway. Do not refresh or close this page.
                </p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full w-full animate-pulse" style={{ background: 'linear-gradient(90deg, #475d2a, rgb(223, 196, 172))' }} />
                </div>
                <p className="text-xs text-gray-400 mt-5">ShuddhEats — Secure Checkout</p>
            </div>
        </div>
    );
}

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

// ✅ Field defined OUTSIDE CheckoutPage — prevents focus loss on every keystroke
interface FieldProps {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    colSpan?: number;
    value: string;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Field({ name, label, type = 'text', placeholder = '', colSpan = 1, value, error, onChange }: FieldProps) {
    return (
        <div className={colSpan === 2 ? 'col-span-2' : 'col-span-1'}>
            <label className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5" style={{ color: '#475d2a' }}>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`input-field text-sm py-2.5 sm:py-2 px-3 sm:px-4 ${error ? 'border-red-400' : ''}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [promoCode, setPromoCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedPromo, setAppliedPromo] = useState('');

    const shipping = subtotal >= 499 ? 0 : 49;
    const total = Math.max(0, subtotal - discountAmount + shipping);
    const orderCreatedRef = useRef(false);

    const [form, setForm] = useState({ fullName: user?.name || '', phone: '', addressLine1: '', addressLine2: '', city: '', state: 'Maharashtra', pincode: '' });
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        // Reactive validation: clear error for the field being typed
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleApplyPromo = (e: React.FormEvent) => {
        e.preventDefault();
        const code = promoCode.trim().toUpperCase();
        if (appliedPromo) {
            toast.error('Promo code already applied');
            return;
        }
        if (code === 'SHUDDHEATS10' || code === 'FIRST10' || code === 'CLEAN10') {
            const calculatedDiscount = Math.round(subtotal * 0.1);
            setDiscountAmount(calculatedDiscount);
            setAppliedPromo(code);
            toast.success('10% First Order discount applied! 🎉');
        } else {
            toast.error('Invalid promo code');
        }
    };

    const handleRemovePromo = () => {
        setDiscountAmount(0);
        setAppliedPromo('');
        setPromoCode('');
        toast.success('Discount removed');
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.fullName) e.fullName = 'Required';
        
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!form.phone || !phoneRegex.test(form.phone)) {
            e.phone = 'Valid 10-digit Indian mobile number required';
        }
        
        if (!form.addressLine1) e.addressLine1 = 'Required';
        if (!form.city) e.city = 'Required';
        if (!form.pincode || form.pincode.length !== 6) e.pincode = 'Valid 6-digit pincode required';
        
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!user) { router.push('/auth/login?redirect=/checkout'); return; }
        console.log("USER AT CHECKOUT:", user);
        if (!user.email) { toast.error('Email is required for payment'); return; }
        if (items.length === 0) { toast.error('Cart is empty'); return; }
        
        if (paymentMethod === 'COD') {
            handlePaymentComplete('MOCK-' + Date.now(), 'COD');
            return;
        }
        
        setProcessing(true);
        handlePaymentComplete('MOCK-' + Date.now());
    };

    const handlePaymentComplete = async (mockOrderId: string, overrideMethod?: string) => {
        // Guard: prevent double order creation if callback fires more than once
        if (orderCreatedRef.current) return;
        orderCreatedRef.current = true;
        try {
            let backendOrderId = mockOrderId;
            try {
                const { data: order } = await api.post('/orders', {
                    items: items.map(i => ({ 
                        product: i.product, 
                        name: i.name, 
                        image: i.image, 
                        price: i.price, 
                        quantity: i.quantity,
                        weight: i.weight,
                        packaging: i.packaging
                    })),
                    shippingAddress: form,
                    itemsPrice: subtotal,
                    shippingPrice: shipping,
                    totalPrice: total,
                    paymentMethod: overrideMethod || 'ONLINE'
                });
                backendOrderId = order.id;

                if (overrideMethod !== 'COD') {
                    console.log("Creating order...");
                    const token = localStorage.getItem('shuddheats_token');
                    
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://suddheats-freelance-project-production-b773.up.railway.app';
                    const response = await fetch(`${baseUrl}/api/payment/create-order`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({
                            orderId: backendOrderId,
                            amount: total,
                            currency: 'INR',
                            customer_phone: form.phone || user?.phone || '',
                            customer_email: user?.email || '',
                            customer_name: form.fullName || user?.name || ''
                        })
                    });
                    
                    const data = await response.json();
                    console.log("Order API response:", data);
                    
                    if (!data.payment_session_id) {
                        toast.error("Invalid payment session ID from backend");
                        orderCreatedRef.current = false;
                        setProcessing(false);
                        return; // STOP execution
                    }
                    
                    console.log("Payment Session ID:", data.payment_session_id);
                    
                    // Force production mode for real payments
                    const cashfreeMode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'SANDBOX' ? 'sandbox' : 'production';
                    console.log("SDK initialization details:", { mode: cashfreeMode });
                    
                    const cashfree = await load({
                        mode: cashfreeMode
                    });
                    
                    console.log("Opening Cashfree Checkout");
                    cashfree.checkout({
                        paymentSessionId: data.payment_session_id,
                        redirectTarget: "_self"
                    }).then((result: any) => {
                        if (result.error) {
                            console.error("COMPLETE error object:", result.error);
                            console.error("paymentSessionId being passed:", data.payment_session_id);
                            toast.error(result.error.message || "Payment failed");
                            orderCreatedRef.current = false;
                            setProcessing(false);
                        }
                    });
                    return; // Prevent further execution to let redirect happen
                }
            } catch (err) {
                console.error("Payment API Error:", err);
                toast.error("Failed to initialize payment gateway");
                orderCreatedRef.current = false;
                setProcessing(false);
                return;
            }
            
            clearCart();
            setProcessing(false);
            router.push(`/order-success?order_id=${backendOrderId}`);
        } catch { orderCreatedRef.current = false; }
    };

    if (processing) return <PaymentProcessingModal />;

    if (items.length === 0) return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
                <Link href="/shop" className="btn-primary">Go Shopping</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-28" style={{ background: '#fafaf7' }}>
            <div className="page-container">
                {/* Header - Compact */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#475d2a' }}>
                        Checkout
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                    {/* Main Content - Left */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <h2 className="text-lg font-bold mb-4" style={{ color: '#475d2a' }}>
                                📍 Delivery Details
                            </h2>
                            <form onSubmit={handleOrder} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Field name="fullName" label="Full Name" placeholder="Rahul Sharma" colSpan={2} value={form.fullName} error={errors.fullName} onChange={handleChange} />
                                    <Field name="phone" label="Phone" type="tel" placeholder="10-digit" value={form.phone} error={errors.phone} onChange={handleChange} />
                                    <div />
                                    <Field name="addressLine1" label="Address 1" placeholder="House/Flat no. & Street" colSpan={2} value={form.addressLine1} error={errors.addressLine1} onChange={handleChange} />
                                    <Field name="addressLine2" label="Address 2 (optional)" placeholder="Landmark" colSpan={2} value={form.addressLine2} error={errors.addressLine2} onChange={handleChange} />
                                    <Field name="city" label="City" placeholder="Mumbai" value={form.city} error={errors.city} onChange={handleChange} />
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475d2a' }}>State</label>
                                        <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input-field text-sm py-2 px-3">
                                            {STATES.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <Field name="pincode" label="Pincode" placeholder="400001" type="tel" value={form.pincode} error={errors.pincode} onChange={handleChange} />
                                </div>
                            </form>
                        </div>

                        {/* Payment */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <h2 className="text-lg font-bold mb-4" style={{ color: '#475d2a' }}>
                                💳 Payment Method
                            </h2>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'ONLINE' ? 'border-[#475d2a] bg-[#f0f4ed]' : 'border-gray-100'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="ONLINE" 
                                        checked={paymentMethod === 'ONLINE'} 
                                        onChange={() => setPaymentMethod('ONLINE')} 
                                        className="w-4 h-4 text-[#475d2a] focus:ring-[#475d2a]"
                                    />
                                    <div>
                                        <div className="font-bold text-sm" style={{ color: '#475d2a' }}>Online Payment (Secure)</div>
                                        <div className="text-xs text-gray-500">Pay via Credit/Debit Card, UPI, Wallets</div>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-[#475d2a] bg-[#f0f4ed]' : 'border-gray-100'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="COD" 
                                        checked={paymentMethod === 'COD'} 
                                        onChange={() => setPaymentMethod('COD')} 
                                        className="w-4 h-4 text-[#475d2a] focus:ring-[#475d2a]"
                                    />
                                    <div>
                                        <div className="font-bold text-sm" style={{ color: '#475d2a' }}>Cash on Delivery (Pay when product is delivered)</div>
                                        <div className="text-xs text-gray-500">Only available for India delivery addresses</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right */}
                    <div className="lg:sticky lg:top-28 self-start">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <h3 className="font-bold mb-3" style={{ color: '#475d2a' }}>
                                📦 Order Summary
                            </h3>

                            {/* Items - No Fixed Height, Let Main Page Scroll */}
                            <div className="space-y-2">
                                {items.map(item => (
                                    <div key={item.product} className="flex gap-2 items-start pb-2 border-b border-gray-100 last:border-0">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded flex-shrink-0" style={{ background: '#f0f4ed' }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{item.name}</p>
                                            {(item.weight || item.packaging) && (
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                    {item.weight && `${item.weight}g`}
                                                    {item.weight && item.packaging && ' • '}
                                                    {item.packaging && (item.packaging === 'jar' ? '🏺 Jar' : '📦 Pouch')}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-xs font-bold flex-shrink-0" style={{ color: '#475d2a' }}>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Input */}
                            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                                <label className="block text-xs font-extrabold uppercase tracking-wider" style={{ color: '#475d2a' }}>
                                    🏷️ Promo Code
                                </label>
                                {appliedPromo ? (
                                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                                        <span className="font-bold text-emerald-800">Code "{appliedPromo}" Applied!</span>
                                        <button type="button" onClick={handleRemovePromo} className="text-red-500 hover:text-red-700 font-bold cursor-pointer transition-colors duration-150">
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={e => setPromoCode(e.target.value)}
                                            placeholder="e.g. FIRST10"
                                            className="input-field text-xs py-1.5 px-3 flex-1 min-h-[36px]"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyPromo}
                                            className="btn-primary text-xs px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer min-h-[36px]"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Pricing */}
                            <div className="space-y-1.5 text-sm border-t border-gray-100 pt-4 mt-4">
                                {subtotal < 499 ? (
                                    <div className="text-xs text-orange-600 font-semibold mb-2 bg-orange-50 p-2 rounded">
                                        Add ₹{499 - subtotal} more for FREE delivery
                                    </div>
                                ) : (
                                    <div className="text-xs text-green-600 font-semibold mb-2 bg-green-50 p-2 rounded flex items-center gap-1">
                                        🎉 Free Delivery on orders above ₹499
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">₹{subtotal}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-semibold animate-scaleIn">
                                        <span>Discount (10%)</span>
                                        <span>-₹{discountAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className={shipping === 0 ? 'text-green-600 font-bold' : ''}>
                                        {shipping === 0 ? '✓ FREE' : `₹${shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span style={{ color: '#475d2a' }}>₹{total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer - Pay Button */}
            <div
                className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3"
                style={{ boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06)' }}
            >
                <div className="page-container flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-xl font-bold" style={{ color: '#475d2a' }}>₹{total}</p>
                    </div>
                    <button
                        onClick={handleOrder}
                        disabled={Object.keys(errors).length > 0}
                        className="flex-shrink-0 px-6 py-2.5 rounded-lg font-bold text-white text-sm transition-all duration-200"
                        style={{
                            background: Object.keys(errors).length > 0 ? '#bbb' : '#475d2a',
                            cursor: Object.keys(errors).length > 0 ? 'not-allowed' : 'pointer',
                            opacity: Object.keys(errors).length > 0 ? 0.6 : 1,
                        }}
                    >
                        {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now 🔒'}
                    </button>
                </div>
            </div>
        </div>
    );
}
