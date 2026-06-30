'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (!res.ok) throw new Error('Failed');
            setSent(true);
            setForm({ name: '', email: '', subject: '', message: '' }); // Clear form
        } catch {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20">
            <section className="py-20 animate-fadeInUp" style={{ background: 'linear-gradient(135deg, #475d2a, #3a4620)' }}>
                <div className="page-container text-center">
                    <div className="badge mb-4 animate-slideInTop" style={{ background: 'rgba(246,201,28,0.2)', color: 'rgb(223, 196, 172)' }}>Get in Touch</div>
                    <h1 className="text-5xl font-extrabold text-white mb-4 animate-fadeInUp delay-100">We'd Love to <span style={{ color: 'rgb(223, 196, 172)' }}>Hear</span> From You</h1>
                    <p className="text-white/70 text-lg max-w-xl mx-auto animate-fadeInUp delay-200">Questions, feedback, bulk orders, or just wanna say hi — we're here!</p>
                </div>
            </section>

            <div className="page-container py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Info Cards */}
                    <div className="space-y-4">
                        {[
                            { Icon: Mail, title: 'Email Us', detail: 'shuddheats3126@gmail.com', sub: 'Reply within 24 hours' },
                            { Icon: Phone, title: 'Call Us', detail: '+91 88508 23761', sub: 'Mon-Sat, 9am-6pm IST' },
                            { Icon: MapPin, title: 'Our Kitchen', detail: 'Mumbai', sub: 'Maharashtra' },
                            { Icon: Clock, title: 'Business Hours', detail: 'Mon-Sat: 9am-6pm', sub: 'Sun: Closed' },
                        ].map(({ Icon, title, detail, sub }, i) => (
                            <div key={title} className="card p-5 flex gap-4 items-start animate-slideInLeft" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f0f4ed' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#475d2a' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm" style={{ color: '#475d2a' }}>{title}</h3>
                                    <p className="font-medium text-sm mt-0.5">{detail}</p>
                                    <p className="text-xs text-gray-400">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="md:col-span-2 card p-8 animate-slideInRight">
                        {sent ? (
                            <div className="text-center py-12 animate-scaleIn">
                                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                                <h3 className="text-3xl font-extrabold mb-2 text-[#475d2a]">Message Sent! 🎉</h3>
                                <p className="text-gray-500 font-medium">We'll get back to you within 24 hours. Happy snacking!</p>
                                <button onClick={() => setSent(false)} className="btn-outline mt-8">Send Another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 animate-fadeInUp">
                                <h2 className="text-2xl font-bold mb-6" style={{ color: '#475d2a' }}>Send a Message</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {[{ n: 'name', l: 'Your Name', p: 'Rahul Sharma' }, { n: 'email', l: 'Email', p: 'rahul@email.com', t: 'email' }].map(({ n, l, p, t = 'text' }) => (
                                        <div key={n}>
                                            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475d2a' }}>{l}</label>
                                            <input type={t} value={(form as any)[n]} onChange={e => setForm(f => ({ ...f, [n]: e.target.value }))}
                                                placeholder={p} required className="input-field" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475d2a' }}>Subject</label>
                                    <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                        placeholder="Order query, feedback, etc." required className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475d2a' }}>Message</label>
                                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                        placeholder="Tell us what's on your mind..." rows={5} required className="input-field resize-none" />
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 disabled:opacity-60">
                                    <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
