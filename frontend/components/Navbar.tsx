'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

/* ─── Premium Modern Navbar Styles ─────────────────────────── */
const NAV_CSS = `
  /* Every pill — static outlined box */
  .nav-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid rgba(85, 107, 47, 0.25);
    padding: 3px;
    white-space: nowrap;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(4px);
    cursor: pointer;
    text-decoration: none;
    position: relative;
    z-index: 10;
  }

  /* Hover — inactive pills */
  .nav-pill:hover:not(.nav-pill--active) {
    border-color: rgba(85, 107, 47, 0.55);
    background: rgba(85, 107, 47, 0.05);
    transform: translateY(-1px) scale(1.03);
    box-shadow: 0 2px 6px rgba(85, 107, 47, 0.05);
  }

  /* Inactive text */
  .nav-pill-text-inactive {
    font-size: 0.8rem;
    font-weight: 500;
    color: #556B2F;
    padding: 6px 14px;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .nav-pill:hover .nav-pill-text-inactive {
    color: #3e4f22;
  }

  /* Active state */
  .nav-pill--active {
    border-color: transparent;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    overflow: hidden; /* Clip any inner beam from bleeding outside the border */
    /* Combine scale with 3D translation to force proper rounded border clipping */
    transform: scale(1.04) translate3d(0, 0, 0);
    -webkit-transform: scale(1.04) translate3d(0, 0, 0);
  }

  /* Active outer box masking background */
  .nav-pill-active-mask {
    position: absolute;
    inset: 1.5px;
    border-radius: 10.5px;
    background: rgba(255, 255, 255, 0.95);
    z-index: 0;
    transition: background 0.3s;
  }

  /* Compact green pill (inside active) */
  .nav-pill-inner-active {
    position: relative;
    z-index: 1;
    background: linear-gradient(135deg, #556B2F 0%, #3e4f22 100%);
    border-radius: 9999px;
    padding: 6px 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
    animation: activePillEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes activePillEnter {
    from { opacity: 0; transform: scale(0.93); }
    to { opacity: 1; transform: scale(1); }
  }

  /* Rotating Border Wrapper */
  .rotating-border-wrapper {
    position: absolute;
    inset: 0px;
    border-radius: 12px;
    overflow: hidden;
    z-index: -1;
    pointer-events: none;
    /* Force Hardware Acceleration for clipping */
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
    isolation: isolate;
  }

  /* Spinning light beam */
  .spinning-beam {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 250%;
    height: 250%;
    transform: translate(-50%, -50%) rotate(0deg);
    background: conic-gradient(
      from 0deg,
      transparent 25%,
      #556B2F 45%,
      #a2b978 50%,
      #556B2F 55%,
      transparent 75%
    );
    animation: navRotate 3s linear infinite;
  }

  @keyframes navRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* Mobile active dot */
  .nav-dot-active {
    display: inline-block;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #556B2F;
    box-shadow: 0 0 8px 2px rgba(85, 107, 47, 0.7);
    flex-shrink: 0;
    animation: dotPulse 2s ease-in-out infinite;
  }
  @keyframes dotPulse {
    0%,100% { box-shadow: 0 0 6px 2px rgba(85, 107, 47, 0.6); }
    50%      { box-shadow: 0 0 12px 4px rgba(85, 107, 47, 0.9); }
  }

  /* Premium thin green border for navbar container */
  .premium-navbar {
    border: 1px solid rgba(85, 107, 47, 0.45) !important;
  }
`;

export default function Navbar() {
    const router   = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen]     = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { totalItems } = useCart();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleLogout = () => { logout(); router.push('/'); };

    const allLinks = [
        { label: 'Home',        href: '/' },
        { label: 'Shop',        href: '/shop' },
        { label: 'About',       href: '/about' },
        { label: 'Contact',     href: '/contact' },
        { label: 'Track Order', href: '/track' },
    ];

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: NAV_CSS }} />

            <div className="fixed top-[34px] w-full z-50 sm:py-4 px-0 sm:px-4 flex justify-center pointer-events-none transition-all duration-500">
                <nav className="pointer-events-auto w-full max-w-6xl premium-navbar bg-white/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:rounded-2xl py-1">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-14 sm:h-16">

                            {/* ── Logo ── */}
                            <Link href="/" className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
                                <Image
                                    src="/images/logo.png"
                                    alt="Shuddh Eats Logo"
                                    width={130}
                                    height={44}
                                    className="h-5 sm:h-6 w-auto object-contain py-1"
                                    priority
                                />
                            </Link>

                            {/* ── Desktop Nav Links ── */}
                            <div className="hidden lg:flex items-center gap-3 md:gap-4">
                                {allLinks.map(l => {
                                    const active = isActive(l.href);
                                    return (
                                        <Link
                                            key={l.href}
                                            href={l.href}
                                            className={`nav-pill${active ? ' nav-pill--active' : ''}`}
                                        >
                                            {/* Rotating border (rendered inside link) */}
                                            {active && (
                                                <>
                                                    <div className="rotating-border-wrapper">
                                                        <div className="spinning-beam" />
                                                    </div>
                                                    <span className="nav-pill-active-mask" />
                                                </>
                                            )}

                                            {active ? (
                                                <span className="nav-pill-inner-active">
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        color: '#ffffff',
                                                        letterSpacing: '0.01em',
                                                    }}>
                                                        {l.label}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="nav-pill-text-inactive">
                                                    {l.label}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* ── Right Actions ── */}
                            <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4 lg:gap-5">

                                {/* Cart */}
                                <Link href="/cart" className="relative p-2 rounded-lg transition-all duration-300 hover:bg-black/5">
                                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#556B2F' }} />
                                    {totalItems > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white animate-scaleIn"
                                            style={{ background: '#556B2F', fontSize: '0.625rem' }}
                                        >
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>

                                {/* User actions */}
                                {user ? (
                                    <div className="hidden lg:flex items-center gap-2 md:gap-3">
                                        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-black/5 transition-all" title="Dashboard">
                                            <LayoutDashboard className="w-5 h-5" style={{ color: '#556B2F' }} />
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link href="/admin" className="p-2 rounded-lg hover:bg-black/5 transition-all" title="Admin">
                                                <LayoutDashboard className="w-5 h-5" style={{ color: '#c9a227' }} />
                                            </Link>
                                        )}
                                        <div className="h-6 w-px bg-gray-200 hidden md:block" />
                                        <span className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-white hidden md:inline" style={{ background: '#556B2F' }}>
                                            {(user.name || "User").split(' ')[0]}
                                        </span>
                                        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 transition-all" title="Logout">
                                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <Link href="/auth/login"
                                        className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm text-white transition-all hover:shadow-md"
                                        style={{ background: '#556B2F' }}>
                                        <User className="w-4 h-4" />
                                        <span>Login</span>
                                    </Link>
                                )}

                                {/* Mobile hamburger */}
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="lg:hidden p-2 rounded-lg hover:bg-black/5 transition-all"
                                    title={isOpen ? 'Close' : 'Menu'}
                                >
                                    {isOpen
                                        ? <X    className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#556B2F' }} />
                                        : <Menu className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#556B2F' }} />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* ── Mobile menu ── */}
                        {isOpen && (
                            <div className="lg:hidden pb-3 sm:pb-4 border-t border-[#556B2F]/20 animate-slideDown">
                                <div className="flex flex-col gap-1 py-2 sm:py-3">
                                    {allLinks.map(l => {
                                        const active = isActive(l.href);
                                        return (
                                            <Link
                                                key={l.href}
                                                href={l.href}
                                                onClick={() => setIsOpen(false)}
                                                className="px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-colors hover:bg-black/5 flex items-center gap-2.5"
                                                style={{ color: active ? '#556B2F' : '#1C1917', fontWeight: active ? 700 : 500 }}
                                            >
                                                {active && <span className="nav-dot-active" />}
                                                {l.label}
                                            </Link>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-gray-100 my-2" />

                                <div className="flex flex-col gap-1 py-2">
                                    {user ? (
                                        <>
                                            <Link href="/dashboard" onClick={() => setIsOpen(false)}
                                                className="px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-black/5"
                                                style={{ color: '#1C1917' }}>
                                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link href="/admin" onClick={() => setIsOpen(false)}
                                                    className="px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-black/5"
                                                    style={{ color: '#c9a227' }}>
                                                    <LayoutDashboard className="w-4 h-4" /> Admin
                                                </Link>
                                            )}
                                            <div className="px-3 sm:px-4 py-2 text-xs font-semibold text-white rounded-md inline-block" style={{ background: '#556B2F' }}>
                                                {user.name}
                                            </div>
                                            <button
                                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                                className="text-left px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-red-50 text-red-500">
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </>
                                    ) : (
                                        <Link href="/auth/login" onClick={() => setIsOpen(false)}
                                            className="mx-3 sm:mx-4 px-4 py-2.5 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2"
                                            style={{ background: '#556B2F' }}>
                                            <User className="w-4 h-4" /> Login
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </>
    );
}