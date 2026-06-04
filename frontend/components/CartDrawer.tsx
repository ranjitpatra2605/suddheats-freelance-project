'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, Leaf } from 'lucide-react';
import { useCart } from '@/context/CartContext';
// @ts-ignore
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedProducts?: Array<{
    id: string;
    name: string;
    price: number;
    thumbnail: string;
    slug: string;
  }>;
}

export default function CartDrawer({
  isOpen,
  onClose,
  suggestedProducts = [],
}: CartDrawerProps) {
  const { items, subtotal, removeFromCart, updateQuantity, updateItemOptions } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  const getDynamicPrice = (itemName: string, weight: number, currentPrice: number, currentWeight: number) => {
    const name = itemName.toLowerCase();
    const isMakhana = name.includes('makhana');
    
    // Find base price first to calculate other prices dynamically
    let basePrice = currentPrice;
    if (currentWeight) {
      if (isMakhana) {
        if (currentWeight <= 35) basePrice = 249; // standard 100g fallback base
        else if (currentWeight === 75) basePrice = 249;
      } else {
        if (currentWeight <= 35) basePrice = 119;
        else if (currentWeight === 75) basePrice = 119;
      }
    }

    if (isMakhana) {
      if (weight <= 35) return 99;
      if (weight === 75) return 199;
      return 249;
    } else {
      if (weight <= 35) return 49;
      if (weight === 75) return 89;
      return basePrice;
    }
  };

  // Handle drawer entrance animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId);
  };

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity >= 1) {
      await updateQuantity(productId, quantity);
    }
  };

  // Discount thresholds
  const FREE_SHIPPING_THRESHOLD = 599;
  const FREE_GIFT_THRESHOLD = 999;
  const remainingForShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const remainingForGift = Math.max(0, FREE_GIFT_THRESHOLD - subtotal);

  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const giftProgress = Math.min(100, (subtotal / FREE_GIFT_THRESHOLD) * 100);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isAnimating
            ? 'bg-black/50 backdrop-blur-sm'
            : 'bg-black/0 backdrop-blur-none'
        }`}
        onClick={onClose}
      />

      {/* Cart Drawer - Mobile: Full screen, Desktop: Right sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 bg-white transition-all duration-300 ease-out flex flex-col overflow-hidden w-full sm:w-96 md:w-[420px] ${
          isAnimating
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky, No Scroll */}
        <div className="flex-shrink-0 sticky top-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-white z-10 gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-bold" style={{ color: '#475d2a' }}>
              🛒 Your Cart
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-5xl mb-3">🛍️</div>
              <p className="text-gray-600 font-medium mb-2 text-sm">Your cart is empty</p>
              <p className="text-xs text-gray-500 mb-4">
                Add some delicious products to get started!
              </p>
              <button
                onClick={onClose}
                className="btn-primary text-xs sm:text-sm py-2 px-3"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Discount Progress Bars */}
              <div className="space-y-2.5 sm:space-y-3">
                {/* Free Shipping Progress */}
                <div className="bg-gradient-to-r from-[#f0f4ed] to-[#e8f5e9] p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Leaf className="w-3 h-3" style={{ color: '#475d2a' }} />
                      Free Shipping
                    </span>
                    <span className="text-xs font-bold" style={{ color: '#475d2a' }}>
                      ₹{FREE_SHIPPING_THRESHOLD}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${shippingProgress}%`,
                        background: '#475d2a',
                      }}
                    />
                  </div>
                  {remainingForShipping > 0 ? (
                    <p className="text-xs text-gray-600 mt-1">
                      Add ₹{remainingForShipping} more for free shipping ✨
                    </p>
                  ) : (
                    <p className="text-xs font-bold" style={{ color: '#475d2a' }}>
                      ✓ Free Shipping Unlocked!
                    </p>
                  )}
                </div>

                {/* Free Gift Progress */}
                <div className="bg-gradient-to-r from-[#fef3c7] to-[#fde68a] p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      🎁 Free Gift
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      ₹{FREE_GIFT_THRESHOLD}
                    </span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${giftProgress}%`,
                        background: '#c9a227',
                      }}
                    />
                  </div>
                  {remainingForGift > 0 ? (
                    <p className="text-xs text-amber-900 mt-1">
                      Add ₹{remainingForGift} more for a free gift! 🎉
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-amber-900">
                      ✓ You've unlocked a free gift!
                    </p>
                  )}
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-2 sm:space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product}
                    className="group bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex gap-2.5 sm:gap-3">
                      {/* Product Image */}
                      <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#f0f4ed] flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold line-clamp-2" style={{ color: '#475d2a' }}>
                          {item.name}
                        </h3>
                        
                        {/* Interactive Weight & Packaging Selector */}
                        <div className="flex flex-col gap-1.5 mt-1.5 mb-2 bg-gray-50/50 p-1.5 rounded-lg border border-gray-100/80">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Weight:</span>
                            <div className="flex gap-1 animate-fadeIn">
                              {[30, 75, 100].map((w) => {
                                const displayWeight = w === 30 && item.name.toLowerCase().includes('makhana') ? 35 : w;
                                const isSelected = item.weight === displayWeight;
                                return (
                                  <button
                                    key={w}
                                    onClick={async () => {
                                      const packaging = displayWeight >= 100 ? 'jar' : 'pouch';
                                      const price = getDynamicPrice(item.name, displayWeight, item.price, item.weight || 100);
                                      await updateItemOptions(item.product, displayWeight, packaging, price);
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
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                            <span>Packaging:</span>
                            <span className="font-bold" style={{ color: '#475d2a' }}>
                              {item.packaging === 'jar' ? '🏺 Glass Jar' : '📦 Eco Pouch'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: '#475d2a' }}>
                          ₹{item.price}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.product)}
                        className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 mt-auto flex-shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-3 justify-between">
                      <div className="flex items-center gap-1 bg-[#f0f4ed] rounded-lg p-1">
                        <button
                          onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                          className="p-1.5 sm:p-1 hover:bg-white rounded transition-colors"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" style={{ color: '#475d2a' }} />
                        </button>
                        <span
                          className="w-6 text-center text-xs font-bold min-h-6 flex items-center justify-center"
                          style={{ color: '#475d2a' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                          className="p-1.5 sm:p-1 hover:bg-white rounded transition-colors"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" style={{ color: '#475d2a' }} />
                        </button>
                      </div>
                      <span className="text-xs sm:text-sm font-bold flex-shrink-0" style={{ color: '#475d2a' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested Products */}
              {suggestedProducts.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    💡 You might also like
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {suggestedProducts.slice(0, 3).map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-all duration-200 group"
                      >
                        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#f0f4ed] rounded flex items-center justify-center flex-shrink-0">
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold line-clamp-1" style={{ color: '#475d2a' }}>
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-600">₹{product.price}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#475d2a] transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky Footer - Always Visible */}
        {items.length > 0 && (
          <div
            className="flex-shrink-0 sticky bottom-0 bg-white border-t border-gray-100 px-5 sm:px-6 py-4 space-y-3"
            style={{ boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)' }}
          >
            {/* Summary */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                <span className="font-semibold" style={{ color: '#475d2a' }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {subtotal > 100 && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Est. Savings
                  </span>
                  <span className="font-semibold text-green-600">
                    ₹{Math.round(subtotal * 0.05)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-1.5 sm:pt-2 flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900">Total</span>
                <span className="text-base sm:text-lg font-bold" style={{ color: '#475d2a' }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full btn-primary justify-center text-xs sm:text-sm py-2.5 sm:py-3 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 block"
            >
              Proceed to Checkout
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
