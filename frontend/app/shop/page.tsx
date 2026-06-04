'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import api from '@/lib/api';
import { Search, SlidersHorizontal, X, Grid3x3, List } from 'lucide-react';

const CATEGORIES = ['All', 'Flavoured Makhanas', 'Air Fried Chips', 'No Sugar No Palm Oil Millet Cookies'];
const SORTS = [
    { label: 'Newest', value: '' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Top Rated', value: 'rating' },
];

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [sort, setSort] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

    const mockProducts = [
    {
        "name": "Himalayan Salt Makhana",
        "slug": "himalayan-salt-makhana",
        "description": "Light, airy fox nuts air-popped and seasoned with pure Himalayan pink salt. High in protein, low in fat, and completely guilt-free. Perfect for evening snacking.",
        "shortDescription": "Air-popped fox nuts with Himalayan pink salt.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563585/shuddheats/products/himalayan-salt-makhana.jpg"
        ],
        "stock": 150,
        "weight": "100g",
        "ingredients": [
            "Fox Nuts (Makhana)",
            "Himalayan Pink Salt",
            "Cold Pressed Coconut Oil"
        ],
        "nutritionFacts": {
            "calories": 347,
            "protein": 9.7,
            "carbs": 76.9,
            "fat": 0.1,
            "fiber": 0.5
        },
        "tags": [
            "makhana",
            "healthy",
            "low-fat",
            "himalayan-salt"
        ],
        "isFeatured": true,
        "isBestSeller": true,
        "ratings": 4.8,
        "numReviews": 124,
        "_id": "1"
    },
    {
        "name": "Black Pepper & Himalayan Salt Makhana",
        "slug": "black-pepper-makhana",
        "description": "Boldly seasoned with black pepper and Himalayan pink salt. Air-popped, never fried.",
        "shortDescription": "Spicy black pepper flavoured fox nuts.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563580/shuddheats/products/black-pepper-makhana.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563580/shuddheats/products/black-pepper-makhana.jpg"
        ],
        "stock": 120,
        "weight": "100g",
        "ingredients": [
            "Fox Nuts (Makhana)",
            "Black Pepper Seasoning",
            "Sunflower Oil",
            "Salt"
        ],
        "nutritionFacts": {
            "calories": 355,
            "protein": 9.5,
            "carbs": 74.2,
            "fat": 2.1,
            "fiber": 0.5
        },
        "tags": [
            "makhana",
            "spicy",
            "black-pepper"
        ],
        "isFeatured": false,
        "isBestSeller": false,
        "ratings": 4.6,
        "numReviews": 89,
        "_id": "2"
    },
    {
        "name": "Pudina Makhana",
        "slug": "pudina-makhana",
        "description": "Refreshing mint flavored makhana with aromatic pudina seasoning. Light, cooling, and perfect as an afternoon snack.",
        "shortDescription": "Refreshing mint flavored fox nuts.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563590/shuddheats/products/pudina-makhana.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563590/shuddheats/products/pudina-makhana.jpg"
        ],
        "stock": 100,
        "weight": "100g",
        "ingredients": [
            "Fox Nuts (Makhana)",
            "Pudina (Mint) Seasoning",
            "Salt",
            "Cold Pressed Oil"
        ],
        "nutritionFacts": {
            "calories": 347,
            "protein": 9.7,
            "carbs": 76.9,
            "fat": 0.13,
            "fiber": 0.5
        },
        "tags": [
            "makhana",
            "pudina",
            "mint"
        ],
        "isFeatured": false,
        "isBestSeller": false,
        "ratings": 4.5,
        "numReviews": 65,
        "_id": "3"
    },
    {
        "name": "Peri Peri Makhana",
        "slug": "peri-peri-makhana",
        "description": "Spicy and tangy peri peri flavoured makhana. Boldly seasoned with African spices for those who love a kick. Air-popped, never fried.",
        "shortDescription": "Spicy peri peri flavoured fox nuts.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563589/shuddheats/products/peri-peri-makhana.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563589/shuddheats/products/peri-peri-makhana.jpg"
        ],
        "stock": 110,
        "weight": "100g",
        "ingredients": [
            "Fox Nuts (Makhana)",
            "Peri Peri Seasoning",
            "Salt",
            "Sunflower Oil"
        ],
        "nutritionFacts": {
            "calories": 347,
            "protein": 10,
            "carbs": 76.9,
            "fat": 0.28,
            "fiber": 0.5
        },
        "tags": [
            "makhana",
            "peri-peri",
            "savory"
        ],
        "isFeatured": false,
        "isBestSeller": true,
        "ratings": 4.7,
        "numReviews": 92,
        "_id": "4"
    },
    {
        "name": "Cream & Onion Makhana",
        "slug": "cream-onion-makhana",
        "description": "Decadent cream and onion flavor meets light, crispy makhana. A sophisticated snack for those who prefer refined taste.",
        "shortDescription": "Rich cream and onion flavored fox nuts.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563584/shuddheats/products/cream-onion-makhana.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563584/shuddheats/products/cream-onion-makhana.jpg"
        ],
        "stock": 95,
        "weight": "100g",
        "ingredients": [
            "Fox Nuts (Makhana)",
            "Cream and Onion Flavoring",
            "Salt",
            "Sunflower Oil"
        ],
        "nutritionFacts": {
            "calories": 347,
            "protein": 9.7,
            "carbs": 76.9,
            "fat": 0.23,
            "fiber": 0.5
        },
        "tags": [
            "makhana",
            "cream-onion",
            "premium"
        ],
        "isFeatured": false,
        "isBestSeller": false,
        "ratings": 4.6,
        "numReviews": 75,
        "_id": "5"
    },
    {
        "name": "Beetroot Chips",
        "slug": "beetroot-chips",
        "description": "Crispy air-fried beetroot chips with just the right amount of salt. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
        "shortDescription": "Air fried beetroot chips with minimal oil.",
        "price": 129,
        "originalPrice": 169,
        "category": "Air Fried Chips",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563579/shuddheats/products/beetroot-chips.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563579/shuddheats/products/beetroot-chips.jpg"
        ],
        "stock": 145,
        "weight": "100g",
        "ingredients": [
            "Beetroot",
            "Salt",
            "Sunflower Oil (minimal)"
        ],
        "nutritionFacts": {
            "calories": 130,
            "protein": 2.1,
            "carbs": 27.8,
            "fat": 2.0,
            "fiber": 2.2
        },
        "tags": [
            "chips",
            "beetroot",
            "air-fried",
            "healthy",
            "low-fat"
        ],
        "isFeatured": true,
        "isBestSeller": true,
        "ratings": 4.7,
        "numReviews": 112,
        "_id": "6"
    },
    {
        "name": "Broccoli Chips",
        "slug": "broccoli-chips",
        "description": "Flavorful broccoli air-fried chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
        "shortDescription": "Broccoli air-fried chips with minimal oil.",
        "price": 129,
        "originalPrice": 169,
        "category": "Air Fried Chips",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563581/shuddheats/products/broccoli-chips.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563581/shuddheats/products/broccoli-chips.jpg"
        ],
        "stock": 135,
        "weight": "100g",
        "ingredients": [
            "Broccoli",
            "Spices",
            "Salt",
            "Sunflower Oil (minimal)"
        ],
        "nutritionFacts": {
            "calories": 140,
            "protein": 2.3,
            "carbs": 28.5,
            "fat": 2.2,
            "fiber": 2.4
        },
        "tags": [
            "chips",
            "broccoli",
            "air-fried",
            "healthy",
            "low-fat"
        ],
        "isFeatured": false,
        "isBestSeller": true,
        "ratings": 4.8,
        "numReviews": 98,
        "_id": "7"
    },
    {
        "name": "Ragi Chips",
        "slug": "ragi-chips",
        "description": "Perfectly salted and crispy air-fried ragi chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
        "shortDescription": "Salted air-fried ragi chips with minimal oil.",
        "price": 129,
        "originalPrice": 169,
        "category": "Air Fried Chips",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563591/shuddheats/products/ragi-chips.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563591/shuddheats/products/ragi-chips.jpg"
        ],
        "stock": 125,
        "weight": "100g",
        "ingredients": [
            "Ragi",
            "Sea Salt",
            "Sunflower Oil (minimal)"
        ],
        "nutritionFacts": {
            "calories": 130,
            "protein": 2.1,
            "carbs": 27.8,
            "fat": 2.0,
            "fiber": 2.2
        },
        "tags": [
            "chips",
            "ragi",
            "air-fried",
            "healthy",
            "low-fat"
        ],
        "isFeatured": false,
        "isBestSeller": false,
        "ratings": 4.6,
        "numReviews": 87,
        "_id": "8"
    },
    {
        "name": "Honey & Oats Cookies",
        "slug": "honey-oats-cookies",
        "description": "Delicious and nutritious honey and oats cookies with absolutely no added sugar or palm oil.",
        "shortDescription": "Nutritious honey oats cookies, zero sugar, no palm oil.",
        "price": 149,
        "originalPrice": 199,
        "category": "No Sugar No Palm Oil Millet Cookies",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563586/shuddheats/products/honey-oats-cookies.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563586/shuddheats/products/honey-oats-cookies.jpg"
        ],
        "stock": 120,
        "weight": "100g",
        "ingredients": [
            "Oats",
            "Honey",
            "Coconut Oil",
            "Sea Salt",
            "Baking Powder"
        ],
        "nutritionFacts": {
            "calories": 410,
            "protein": 8.2,
            "carbs": 62.3,
            "fat": 14.5,
            "fiber": 3.1
        },
        "tags": [
            "cookies",
            "oats",
            "honey",
            "no-sugar",
            "no-palm-oil",
            "healthy"
        ],
        "isFeatured": true,
        "isBestSeller": true,
        "ratings": 4.9,
        "numReviews": 134,
        "_id": "9"
    },
    {
        "name": "Jowar & Nuts Cookies",
        "slug": "jowar-nuts-cookies",
        "description": "Delicious and nutritious jowar and nuts cookies with absolutely no added sugar or palm oil.",
        "shortDescription": "Nutritious jowar and nuts cookies, zero sugar, no palm oil.",
        "price": 149,
        "originalPrice": 199,
        "category": "No Sugar No Palm Oil Millet Cookies",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563587/shuddheats/products/jowar-nuts-cookies.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563587/shuddheats/products/jowar-nuts-cookies.jpg"
        ],
        "stock": 115,
        "weight": "100g",
        "ingredients": [
            "Jowar Flour",
            "Nuts",
            "Natural Sweetener (Stevia)",
            "Coconut Oil",
            "Sea Salt",
            "Baking Powder"
        ],
        "nutritionFacts": {
            "calories": 410,
            "protein": 8.2,
            "carbs": 62.3,
            "fat": 14.5,
            "fiber": 3.1
        },
        "tags": [
            "cookies",
            "jowar",
            "nuts",
            "no-sugar",
            "no-palm-oil",
            "healthy"
        ],
        "isFeatured": false,
        "isBestSeller": true,
        "ratings": 4.8,
        "numReviews": 110,
        "_id": "10"
    },
    {
        "name": "Ragi & Elaichi Cookies",
        "slug": "ragi-elaichi-cookies",
        "description": "Delicious and nutritious ragi and elaichi cookies with absolutely no added sugar or palm oil.",
        "shortDescription": "Nutritious ragi and elaichi cookies, zero sugar, no palm oil.",
        "price": 149,
        "originalPrice": 199,
        "category": "No Sugar No Palm Oil Millet Cookies",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563592/shuddheats/products/ragi-elaichi-cookies.jpg",
        "images": [
            "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563592/shuddheats/products/ragi-elaichi-cookies.jpg"
        ],
        "stock": 125,
        "weight": "100g",
        "ingredients": [
            "Ragi Flour",
            "Elaichi",
            "Natural Sweetener (Stevia)",
            "Coconut Oil",
            "Sea Salt",
            "Baking Powder"
        ],
        "nutritionFacts": {
            "calories": 410,
            "protein": 8.2,
            "carbs": 62.3,
            "fat": 14.5,
            "fiber": 3.1
        },
        "tags": [
            "cookies",
            "ragi",
            "elaichi",
            "no-sugar",
            "no-palm-oil",
            "healthy"
        ],
        "isFeatured": false,
        "isBestSeller": true,
        "ratings": 4.7,
        "numReviews": 98,
        "_id": "11"
    }
];

    // Fetch products based on filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            let filtered = [];
            try {
                const { data } = await api.get('/products');
                filtered = data.products || data; // handle both array and paginated response
            } catch (err) {
                console.error("Failed to fetch products", err);
                filtered = [...mockProducts];
            }

            if (category && category !== 'All') {
                filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
            }
            if (search) {
                const query = search.toLowerCase().trim();
                filtered = filtered.filter(p =>
                    p.name?.toLowerCase().includes(query) ||
                    (p.shortDescription && p.shortDescription.toLowerCase().includes(query)) ||
                    p.category?.toLowerCase().includes(query)
                );
            }
            if (sort === 'price_asc') {
                filtered.sort((a, b) => a.price - b.price);
            } else if (sort === 'price_desc') {
                filtered.sort((a, b) => b.price - a.price);
            } else if (sort === 'rating') {
                filtered.sort((a, b) => b.ratings - a.ratings);
            }

            setProducts(filtered);
            setLoading(false);
        };

        fetchProducts();
    }, [category, search, sort]);

    const catUrl = searchParams.get('category');
    useEffect(() => {
        if (catUrl) setCategory(catUrl);
    }, [catUrl]);



    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#fafaf7' }}>
            <div className="page-container">
                {/* Header */}
                <div className="text-center mb-10 animate-fadeInUp">
                    <div className="badge badge-primary mb-3">Our Products</div>
                    <h1 className="section-title animate-fadeInUp delay-100">Shop ShuddhEats</h1>
                    <p className="section-subtitle mt-2 max-w-lg mx-auto animate-fadeInUp delay-200">Discover our range of clean, air-fried, and nutritious snacks</p>
                </div>

                {/* Search + Filter Bar */}
                <div className="mb-6 sm:mb-8 animate-slideInTop">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                                    className="input-field pl-9 sm:pl-12 w-full text-sm sm:text-base" />
                                {search && <button onClick={() => setSearch('')} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
                            </div>
                            <select value={sort} onChange={e => setSort(e.target.value)} className="input-field w-full sm:w-48 text-sm sm:text-base">
                                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        {/* View Toggle */}
                        <div className="flex gap-2 p-1 rounded-lg self-start sm:self-auto" style={{ background: '#f0f4ed' }}>
                            <button
                                onClick={() => setViewType('grid')}
                                className={`p-2 rounded transition-all text-xs sm:text-sm`}
                                title="Grid View"
                            >
                                <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: viewType === 'grid' ? '#475d2a' : '#999' }} />
                            </button>
                            <button
                                onClick={() => setViewType('list')}
                                className={`p-2 rounded transition-all text-xs sm:text-sm`}
                                title="List View"
                            >
                                <List className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: viewType === 'list' ? '#475d2a' : '#999' }} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {CATEGORIES.map((c, i) => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`px-3 sm:px-5 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all animate-fadeInUp`}
                            style={category === c ? { background: '#475d2a', color: 'white', boxShadow: '0 8px 16px rgba(46,82,52,0.3)', animationDelay: `${i * 0.05}s` } : { background: 'white', color: '#5a6a4a', animationDelay: `${i * 0.05}s` }}>
                            {c}
                        </button>
                    ))}
                </div>

                {/* Products Grid/List */}
                {loading ? (
                    <div className={viewType === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" : "space-y-3 sm:space-y-4"}>
                        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-80 sm:h-96" />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 sm:py-20 animate-fadeInUp">
                        <div className="text-5xl sm:text-6xl mb-4 animate-bounce-slow">🍃</div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-600">No products found</h3>
                        <p className="text-sm sm:text-base text-gray-400 mt-2">Try adjusting your filters</p>
                    </div>
                ) : viewType === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 animate-fadeInUp">
                        {products.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4 animate-fadeInUp">
                        {products.map((p) => (
                            <div key={p._id} className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 hover:shadow-lg transition-shadow">
                                <div className="w-full sm:w-24 h-32 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#f0f4ed] flex items-center justify-center">
                                    <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base hover:text-[#475d2a] transition-colors line-clamp-2">{p.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">{p.shortDescription}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-base sm:text-lg font-extrabold block" style={{ color: '#475d2a' }}>₹{p.price}</span>
                                            {p.originalPrice && (
                                                <span className="text-xs text-gray-400 line-through">₹{p.originalPrice}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-auto">
                                        <div className="flex gap-2 items-center">
                                            <span className="badge badge-primary text-xs">{p.category}</span>
                                            {p.isBestSeller && <span className="badge text-xs" style={{ background: 'rgb(223, 196, 172)', color: 'rgb(84, 82, 82)' }}>⭐ Best Seller</span>}
                                        </div>
                                        <button
                                            onClick={() => router.push(`/shop/${p.slug}`)}
                                            className="btn-primary text-xs py-2 px-3 sm:px-4 w-full sm:w-auto"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin">Loading...</div></div>}>
            <ShopContent />
        </Suspense>
    );
}
