'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    thumbnail: string;
    category: string;
    ratings: number;
    numReviews: number;
    isBestSeller?: boolean;
    stock: number;
    shortDescription?: string;
    weight?: number; // in grams
}

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const [selectedWeight, setSelectedWeight] = useState<number>(() => {
        const name = product.name.toLowerCase();
        if (name.includes('35g') || name.includes('30g')) return name.includes('makhana') ? 35 : 30;
        if (name.includes('75g')) return 75;
        if (name.includes('100g')) return 100;
        
        if (product.weight) {
            const parsed = parseInt(product.weight.toString());
            if (parsed) return parsed;
        }
        return 100; // default fallback
    });

    const isMakhana = product.category?.toLowerCase().includes('makhana') || product.name.toLowerCase().includes('makhana');

    const getDynamicPrice = () => {
        if (isMakhana) {
            if (selectedWeight <= 35) {
                return { price: 99, originalPrice: 129 };
            } else if (selectedWeight === 75) {
                return { price: 199, originalPrice: 249 };
            } else {
                return { price: 249, originalPrice: 299 };
            }
        } else {
            if (selectedWeight <= 35) {
                return { price: 49, originalPrice: 69 };
            } else if (selectedWeight === 75) {
                return { price: 89, originalPrice: 119 };
            } else {
                let basePrice = product.price;
                let baseOriginal = product.originalPrice || (product.price + 40);
                const currentName = product.name.toLowerCase();
                const is30gOr35g = currentName.includes('30g') || currentName.includes('35g');
                const is75g = currentName.includes('75g');
                if (is30gOr35g || is75g) {
                    basePrice = 119;
                    baseOriginal = 159;
                }
                return { price: basePrice, originalPrice: baseOriginal };
            }
        }
    };

    const { price, originalPrice } = getDynamicPrice();
    const packagingType = selectedWeight >= 100 ? 'jar' : 'pouch';

    const discount = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : null;

    const btnRef = useRef<HTMLButtonElement>(null);
    const [added, setAdded] = useState(false);

    const spawnRipple = useCallback((e: React.MouseEvent) => {
        const btn = btnRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.6;
        const span = document.createElement('span');
        span.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.32);width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;transform:scale(0);animation:cartRipple 0.55s linear forwards;pointer-events:none;z-index:3`;
        btn.appendChild(span);
        span.addEventListener('animationend', () => span.remove());
    }, []);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (added || isAdding) return;
        spawnRipple(e);
        setIsAdding(true);
        try {
            await addToCart(
                product.id,
                product.name,
                product.thumbnail,
                price,
                1,
                { weight: selectedWeight, packaging: packagingType }
            );
            setAdded(true);
            setTimeout(() => setAdded(false), 2400);
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const getPackagingType = () => {
        if (selectedWeight <= 35) return { type: 'Pouch', color: '#fbbf24' };
        if (selectedWeight === 75) return { type: 'Pouch', color: '#fbbf24' };
        if (selectedWeight >= 100) return { type: 'Jar', color: '#f97316' };
        return null;
    };

    const packaging = getPackagingType();

    return (
        <>
        <div className="card group cursor-pointer flex flex-col h-full hover:shadow-2xl transition-all duration-300 ease-out">
            <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden flex-shrink-0 flex items-center justify-center group/image" style={{ aspectRatio: '3/4', background: '#f0f4ed' }}>
                <Image
                    src={product.thumbnail || 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg'}
                    alt={product.name}
                    fill
                    priority={false}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/image:scale-110"
                    style={product.category?.toLowerCase().includes('cookie') ? { objectPosition: '40% center' } : {}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />

                {/* Badges - Better positioned */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isBestSeller && (
                        <span className="badge animate-scaleIn" style={{ background: 'rgb(223, 196, 172)', color: 'rgb(84, 82, 82)', fontSize: '0.7rem' }}>⭐ Best Seller</span>
                    )}
                    {discount && (
                        <span className="badge animate-scaleIn" style={{ background: '#475d2a', color: 'white', fontSize: '0.7rem', animationDelay: '0.1s', fontWeight: '800' }}>{discount}% OFF</span>
                    )}
                </div>

                {/* Stock warning */}
                {product.stock < 10 && product.stock > 0 && (
                    <span className="absolute bottom-3 right-3 badge text-xs animate-pulse" style={{ background: '#fee2e2', color: '#991b1b' }}>
                        Only {product.stock} left!
                    </span>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-bold">Out of Stock</span>
                    </div>
                )}
            </Link>

            <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                <span className="badge badge-primary mb-2 sm:mb-3 text-xs">{product.category}</span>

                <Link href={`/shop/${product.slug}`}>
                    <h3 className="font-bold text-xs sm:text-sm md:text-base my-1.5 sm:my-2 hover:text-[#475d2a] transition-colors line-clamp-2 leading-snug">{product.name}</h3>
                </Link>

                {product.shortDescription && (
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2 sm:mb-3">{product.shortDescription}</p>
                )}

                {/* Ratings */}
                <div className="flex items-center gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition-colors ${i < Math.round(product.ratings) ? 'fill-[rgb(223,196,172)] text-[rgb(223,196,172)]' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-400">({product.numReviews})</span>
                </div>

                {/* Weight Selector */}
                <div className="flex items-center justify-between gap-1.5 mt-1 mb-3 bg-gray-50/50 p-2 rounded-xl border border-gray-100/60" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight:</span>
                    <div className="flex gap-1">
                        {[30, 75, 100].map((w) => {
                            const displayWeight = w === 30 && isMakhana ? 35 : w;
                            const isSelected = selectedWeight === displayWeight;
                            return (
                                <button
                                    key={w}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setSelectedWeight(displayWeight);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all border ${
                                        isSelected
                                            ? 'bg-[#475d2a] border-[#475d2a] text-white shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {displayWeight}g
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price and Button */}
                <div className="flex items-end justify-between gap-2 mt-auto flex-wrap">
                    <div className="flex flex-col">
                        <span className="text-base sm:text-lg md:text-xl font-extrabold" style={{ color: '#475d2a' }}>₹{price}</span>
                        {originalPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                        )}
                    </div>

                    {/* ── Premium animated cart button ── */}
                    <button
                        ref={btnRef}
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        aria-label="Add to cart"
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            border: '1.8px solid #2d4a1e',
                            borderRadius: '9999px',
                            background: added ? '#2d4a1e' : '#fff',
                            color: added ? '#fff' : '#2d4a1e',
                            padding: '7px 18px',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            opacity: product.stock === 0 ? 0.45 : 1,
                            transition: 'color 0.42s cubic-bezier(0.4,0,0.2,1), box-shadow 0.42s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)',
                            boxShadow: added ? '0 6px 20px rgba(45,74,30,0.28)' : 'none',
                            transform: 'translateY(0)',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                            if (!added) {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(45,74,30,0.22)';
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!added) {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {/* Slide fill layer */}
                        <span style={{
                            position: 'absolute', inset: 0,
                            background: '#2d4a1e',
                            borderRadius: '9999px',
                            transform: added ? 'translateX(0)' : 'translateX(-105%)',
                            transition: 'transform 0.46s cubic-bezier(0.4,0,0.2,1)',
                            zIndex: 0,
                        }} />
                        {/* Cart icon */}
                        {!added && (
                            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, position: 'relative', zIndex: 1, stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}>
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                        )}
                        {/* Check icon */}
                        {added && (
                            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, position: 'relative', zIndex: 1, stroke: '#fff', fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}>
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        )}
                        <span style={{ position: 'relative', zIndex: 1 }}>
                            {added ? 'Added!' : isAdding ? 'Adding…' : 'Add'}
                        </span>
                    </button>

                    <style>{`@keyframes cartRipple { to { transform: scale(4); opacity: 0; } }`}</style>
                </div>
            </div>
        </div>
        </>
    );
}
