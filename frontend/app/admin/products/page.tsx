'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Edit, Trash2, X, Save, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const CATEGORIES = ['Makhana', 'Air Fried Chips', 'Diet Mix'];
const emptyProduct = { name: '', slug: '', description: '', shortDescription: '', price: '', originalPrice: '', category: 'Makhana', thumbnail: '', stock: '', weight: '', isFeatured: false, isBestSeller: false };

export default function AdminProductsPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(emptyProduct);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (!loading && (!user || !isAdmin)) router.push('/auth/login'); }, [user, isAdmin, loading]);

    const loadProducts = () => {
        api.get('/products').then(r => setProducts(r.data)).catch(() => setProducts([])).finally(() => setFetching(false));
    };
    useEffect(() => { if (isAdmin) loadProducts(); }, [isAdmin]);

    const openAdd = () => { setEditing(null); setForm(emptyProduct); setModal(true); };
    const openEdit = (p: any) => { setEditing(p); setForm({ ...p, price: p.price?.toString(), originalPrice: p.originalPrice?.toString(), stock: p.stock?.toString() }); setModal(true); };

    const handleImageUpload = async (file: File) => {
        if (!file) return;
        setUploading(true);
        const toastId = toast.loading('Uploading image...');
        try {
            const formData = new FormData();
            formData.append('image', file);
            const token = localStorage.getItem('shuddheats_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/product-image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Upload failed');
            setForm((f: any) => ({ ...f, thumbnail: data.url }));
            toast.success('Image uploaded!', { id: toastId });
        } catch (err: any) {
            toast.error(err.message || 'Upload failed', { id: toastId });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const payload = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) || 0, stock: Number(form.stock) };
        if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
            if (editing) await api.put(`/products/${editing._id}`, payload);
            else await api.post('/products', payload);
            toast.success(editing ? 'Product updated!' : 'Product created!');
            setModal(false); loadProducts();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Error saving product'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try { await api.delete(`/products/${id}`); toast.success('Product deleted'); loadProducts(); }
        catch { toast.error('Error deleting product'); }
    };

    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#fafaf7' }}>
            <div className="page-container">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 rounded-xl hover:bg-[#f0f4ed] transition-colors"><ArrowLeft className="w-5 h-5" style={{ color: '#475d2a' }} /></Link>
                        <h1 className="section-title">Products ({products.length})</h1>
                    </div>
                    <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Product</button>
                </div>

                {fetching ? (
                    <div className="grid grid-cols-1 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20" />)}</div>
                ) : (
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead style={{ background: '#f8faf7' }}>
                                <tr>{['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map(p => (
                                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 flex items-center gap-3">
                                            <img src={p.thumbnail} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                                            <div>
                                                <p className="font-medium text-sm">{p.name}</p>
                                                <p className="text-xs text-gray-400">{p.isFeatured && '⭐ Featured'} {p.isBestSeller && '🔥 Best Seller'}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4"><span className="badge badge-primary">{p.category}</span></td>
                                        <td className="px-4 py-4 font-bold" style={{ color: '#475d2a' }}>₹{p.price}</td>
                                        <td className="px-4 py-4"><span className={`font-semibold ${p.stock < 20 ? 'text-red-500' : 'text-green-600'}`}>{p.stock}</span></td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-[#f0f4ed] transition-colors"><Edit className="w-4 h-4" style={{ color: '#475d2a' }} /></button>
                                                <button onClick={() => handleDelete(p._id, p.name)} className="p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {modal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="font-bold text-xl" style={{ color: '#475d2a' }}>{editing ? 'Edit Product' : 'Add New Product'}</h2>
                                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {[{ n: 'name', l: 'Product Name' }, { n: 'slug', l: 'Slug (auto-generated)' }, { n: 'shortDescription', l: 'Short Description' }, { n: 'price', l: 'Price (₹)', t: 'number' }, { n: 'originalPrice', l: 'Original Price (₹)', t: 'number' }, { n: 'stock', l: 'Stock', t: 'number' }, { n: 'weight', l: 'Weight (e.g. 100g)' }].map(({ n, l, t = 'text' }) => (
                                        <div key={n} className={n === 'shortDescription' ? 'col-span-2' : ''}>
                                            <label className="block text-sm font-semibold mb-1" style={{ color: '#475d2a' }}>{l}</label>
                                            <input type={t} value={form[n]} onChange={e => setForm((f: any) => ({ ...f, [n]: e.target.value }))}
                                                className="input-field" placeholder={l} />
                                        </div>
                                    ))}

                                    {/* Thumbnail — URL field + Upload button */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold mb-1" style={{ color: '#475d2a' }}>Product Image</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={form.thumbnail}
                                                onChange={e => setForm((f: any) => ({ ...f, thumbnail: e.target.value }))}
                                                className="input-field flex-1"
                                                placeholder="Paste image URL or upload below"
                                            />
                                            <button
                                                type="button"
                                                disabled={uploading}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:opacity-90 whitespace-nowrap disabled:opacity-60"
                                                style={{ borderColor: '#475d2a', color: '#475d2a', background: '#f0f4ed' }}
                                            >
                                                <Upload className="w-4 h-4" />
                                                {uploading ? 'Uploading...' : 'Upload Image'}
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                className="hidden"
                                                onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
                                            />
                                        </div>
                                        {/* Preview */}
                                        {form.thumbnail && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <img src={form.thumbnail} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" onError={e => (e.currentTarget.style.display = 'none')} />
                                                <span className="text-xs text-gray-400">Preview</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold mb-1" style={{ color: '#475d2a' }}>Description</label>
                                        <textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
                                            rows={3} className="input-field resize-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1" style={{ color: '#475d2a' }}>Category</label>
                                        <select value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))} className="input-field">
                                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex gap-6 items-center pt-6">
                                        {[{ n: 'isFeatured', l: 'Featured' }, { n: 'isBestSeller', l: 'Best Seller' }].map(({ n, l }) => (
                                            <label key={n} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form[n]} onChange={e => setForm((f: any) => ({ ...f, [n]: e.target.checked }))} className="w-4 h-4 accent-[#475d2a]" />
                                                <span className="text-sm font-medium">{l}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" disabled={saving || uploading} className="btn-primary flex-1 justify-center py-3">
                                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
                                    </button>
                                    <button type="button" onClick={() => setModal(false)} className="btn-outline px-6">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
