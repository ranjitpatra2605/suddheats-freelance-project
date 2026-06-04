import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{ background: '#475d2a' }} className="text-white">
            <div className="page-container pt-16 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <div className="h-24 w-24 rounded-full overflow-hidden flex items-center justify-center mb-6" style={{ background: 'rgba(255,255,255,0.95)' }}>
                            <Image
                                src="https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563574/shuddheats/assets/logo-se-circle.png"
                                alt="ShuddhEats Logo"
                                width={96}
                                height={96}
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <p className="text-sm leading-relaxed opacity-80 mb-6">
                            Clean ingredients, roasted goodness, and sustainable packaging. Snacking the way nature intended.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.instagram.com/_shuddheats_?utm_source=qr&igsh=MTZ2OXAzMDBreHBoMA==" target="_blank" rel="noopener noreferrer"
                                className="w-9 h-9 rounded-xl flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                                style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-xl flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                                style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-xl flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                                style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <Facebook className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-5 opacity-60">Quick Links</h4>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Shop', href: '/shop' },
                                { label: 'About Us', href: '/about' },
                                { label: 'Contact', href: '/contact' },
                                { label: 'Track Order', href: '/track' },
                            ].map(l => (
                                <Link key={l.href} href={l.href} className="group flex items-center gap-2 text-sm opacity-75 hover:opacity-100 hover:text-[rgb(223,196,172)] transition-all duration-300 w-fit">
                                    <span className="w-0 h-0 overflow-hidden group-hover:w-1.5 group-hover:h-1.5 rounded-full bg-[rgb(223,196,172)] transition-all duration-300 flex-shrink-0"></span>
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">{l.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Information */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-5 opacity-60">Information</h4>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Contact Information', href: '/contact' },
                                { label: 'Refund policy', href: '/refund' },
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Shipping policy', href: '/shipping' },
                                { label: 'Terms of service', href: '/terms' },
                            ].map(l => (
                                <Link key={l.href} href={l.href} className="group flex items-center gap-2 text-sm opacity-75 hover:opacity-100 hover:text-[rgb(223,196,172)] transition-all duration-300 w-fit">
                                    <span className="w-0 h-0 overflow-hidden group-hover:w-1.5 group-hover:h-1.5 rounded-full bg-[rgb(223,196,172)] transition-all duration-300 flex-shrink-0"></span>
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">{l.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-5 opacity-60">Categories</h4>
                        <div className="flex flex-col gap-3">
                            {['Flavoured Makhanas', 'Air Fried Chips', 'No Sugar No Palm Oil Millet Cookies'].map(c => (
                                <Link key={c} href={`/shop?category=${encodeURIComponent(c)}`}
                                    className="group flex items-center gap-2 text-sm opacity-75 hover:opacity-100 hover:text-[rgb(223,196,172)] transition-all duration-300 w-fit">
                                    <span className="w-0 h-0 overflow-hidden group-hover:w-1.5 group-hover:h-1.5 rounded-full bg-[rgb(223,196,172)] transition-all duration-300 flex-shrink-0"></span>
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">{c}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-5 opacity-60">Get in Touch</h4>
                        <div className="flex flex-col gap-4">
                            {[
                                { Icon: Mail, text: 'hello@shuddheats.com' },
                                { Icon: Phone, text: '+91 98765 43210' },
                                { Icon: MapPin, text: 'Mumbai, Maharashtra' },
                            ].map(({ Icon, text }) => (
                                <div key={text} className="flex items-center gap-3 text-sm opacity-75">
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs opacity-50">
                    <p>© 2026 shuddheats.co.in - All rights reserved. Made with 💚 in India.</p>
                    <div className="text-center md:text-right italic">
                        "Thank you for choosing healthy, guilt-free snacking! 🌱"
                    </div>
                </div>
            </div>
        </footer>
    );
}
