import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Plus, Edit, Trash, X, Search, ImageIcon, Star, Upload } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import API from '../../services/api';

// Reusable image compression helper
const compressImage = (base64Str, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

// Reusable gallery image uploader
function ImageUploader({ value, onChange, label = 'Image' }) {
  const inputRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target.result);
      onChange(compressed);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      {label && <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-32 sm:h-36 rounded-xl border-2 border-dashed border-white/20 hover:border-[#22C55E]/50 bg-white/5 hover:bg-[#22C55E]/5 cursor-pointer flex flex-col items-center justify-center transition-all group overflow-hidden"
      >
        {value ? (
          <>
            <img src={value} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-xl">
              <Upload size={18} className="text-white mb-1" />
              <span className="text-white text-xs font-semibold">Change Photo</span>
            </div>
          </>
        ) : (
          <>
            <ImageIcon size={24} className="text-white/20 mb-2 group-hover:text-[#22C55E]/50 transition-colors" />
            <p className="text-white/40 text-[10px] sm:text-xs font-medium px-2 text-center">Click to choose</p>
            <p className="text-white/20 text-[9px] sm:text-[10px] mt-0.5">JPG, PNG, WEBP</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value && (
        <button type="button" onClick={() => onChange('')} className="mt-1.5 text-red-400 text-[10px] font-semibold hover:text-red-300 flex items-center gap-1">
          <X size={9} /> Remove
        </button>
      )}
    </div>
  );
}

const emptyForm = {
  name: '', sku: '', price: '', discountPrice: '', inventoryCount: '10',
  brand: 'Pure Botanical', description: '', shortDescription: '',
  category: '', stockStatus: 'in_stock', isNewArrival: false,
  images: [''],
};

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products', { params: { limit: 200 } });
      if (res.data.success) setProducts(res.data.products);
    } catch { showToast('Failed to load products', 'error'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.data.success) setCategories(res.data.categories);
    } catch {}
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0]?._id || '' });
    setModalOpen(true);
  };

  const openEdit = (prod) => {
    setEditingId(prod._id);
    setForm({
      name: prod.name, sku: prod.sku, price: prod.price, discountPrice: prod.discountPrice || '',
      inventoryCount: prod.inventoryCount, brand: prod.brand || 'Pure Botanical',
      description: prod.description, shortDescription: prod.shortDescription,
      category: prod.category?._id || prod.category || '',
      stockStatus: prod.stockStatus, isNewArrival: prod.isNewArrival || false,
      images: prod.images?.length ? prod.images : [''],
    });
    setModalOpen(true);
  };

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleImageGallery = (idx, dataUrl) => {
    const imgs = [...form.images];
    imgs[idx] = dataUrl;
    setForm((f) => ({ ...f, images: imgs }));
  };

  const addImageSlot = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImageSlot = (idx) => {
    const imgs = form.images.filter((_, i) => i !== idx);
    setForm((f) => ({ ...f, images: imgs.length ? imgs : [''] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      showToast('Name, price and category are required', 'error'); return;
    }
    const validImages = form.images.filter((u) => u.trim() !== '');
    if (!validImages.length) { showToast('Add at least one image', 'error'); return; }

    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
      inventoryCount: Number(form.inventoryCount),
      images: validImages,
    };

    try {
      const res = editingId
        ? await API.put(`/admin/products/${editingId}`, payload)
        : await API.post('/admin/products', payload);
      if (res.data.success) {
        showToast(editingId ? 'Product updated!' : 'Product added!');
        setModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      const res = await API.delete(`/admin/products/${id}`);
      if (res.data.success) { showToast('Product deleted'); fetchProducts(); }
    } catch { showToast('Failed to delete', 'error'); }
  };

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white p-4 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#22C55E]" />
            Product Catalog
          </h1>
          <p className="text-white/40 text-xs mt-1">Add, edit and manage your product inventory.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus size={15} /> Add New Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name or SKU..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
        />
      </div>

      {/* Products Content */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/10" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-white/30 italic text-sm">
          {search ? 'No products match your search.' : 'No products yet. Click "Add New Product" to start.'}
        </div>
      ) : (
        <>
          {/* ── Desktop Table (hidden on mobile) ── */}
          <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 text-[10px] text-white/30 font-bold uppercase tracking-wider">
              {filtered.length} Products
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/30 uppercase tracking-wider text-[10px] font-bold">
                    <th className="px-5 py-3 text-left">Product</th>
                    <th className="px-5 py-3 text-left">Category</th>
                    <th className="px-5 py-3 text-left">Price</th>
                    <th className="px-5 py-3 text-left">Stock</th>
                    <th className="px-5 py-3 text-left">Rating</th>
                    <th className="px-5 py-3 text-left">Tags</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((prod) => (
                    <tr key={prod._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0]} alt={prod.name}
                            className="w-10 h-12 object-cover rounded-lg bg-white/5 border border-white/10"
                            onError={(e) => { e.target.src = ''; }}
                          />
                          <div>
                            <p className="font-semibold text-white/80 leading-tight">{prod.name}</p>
                            <p className="text-white/30 text-[10px] mt-0.5">{prod.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-white/50">{prod.category?.name || 'Uncategorised'}</td>
                      <td className="px-5 py-3">
                        <p className="text-emerald-400 font-bold">₹{prod.price?.toLocaleString('en-IN')}</p>
                        {prod.discountPrice > 0 && (
                          <p className="text-white/30 text-[10px] line-through">₹{prod.price?.toLocaleString('en-IN')}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          prod.stockStatus === 'out_of_stock'
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : prod.inventoryCount <= 5
                            ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                            : 'bg-green-500/15 text-green-400 border-green-500/30'
                        }`}>
                          {prod.stockStatus === 'out_of_stock' ? 'Out of Stock' : `${prod.inventoryCount} units`}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star size={11} className="fill-yellow-400" />
                          <span className="text-white/60">{prod.rating?.toFixed(1) || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {prod.isNewArrival && (
                            <span className="px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[9px] font-bold rounded-full">New</span>
                          )}
                          {prod.isFeatured && (
                            <span className="px-1.5 py-0.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[9px] font-bold rounded-full">Featured</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(prod)}
                            className="p-1.5 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-lg transition-all text-white/50 hover:text-blue-400"
                            title="Edit">
                            <Edit size={13} />
                          </button>
                          <button onClick={() => handleDelete(prod._id)}
                            className="p-1.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg transition-all text-white/50 hover:text-red-400"
                            title="Delete">
                            <Trash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Cards (hidden on desktop) ── */}
          <div className="md:hidden space-y-3">
            <div className="px-1 text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2">
              {filtered.length} Products
            </div>
            {filtered.map((prod) => (
              <div key={prod._id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3">
                <img
                  src={prod.images?.[0]} alt={prod.name}
                  className="w-16 h-20 object-cover rounded-lg bg-white/5 border border-white/10 shrink-0"
                  onError={(e) => { e.target.src = ''; }}
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white/90 text-sm truncate">{prod.name}</h3>
                    <p className="text-white/40 text-[10px] truncate">{prod.category?.name || 'Uncategorised'} • {prod.sku}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-emerald-400 font-bold text-sm leading-none">₹{prod.price?.toLocaleString('en-IN')}</p>
                      {prod.discountPrice > 0 && (
                        <p className="text-white/30 text-[10px] line-through">₹{prod.discountPrice?.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      prod.stockStatus === 'out_of_stock'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : prod.inventoryCount <= 5
                        ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        : 'bg-green-500/15 text-green-400 border-green-500/30'
                    }`}>
                      {prod.stockStatus === 'out_of_stock' ? 'Out of Stock' : `${prod.inventoryCount} left`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 justify-end">
                    <button onClick={() => openEdit(prod)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all text-blue-400 text-xs font-semibold">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(prod._id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all text-red-400">
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#0F1A14] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto z-50 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 sticky top-0 bg-[#0F1A14] z-10">
              <h2 className="font-bold text-white text-sm sm:text-base">{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Gallery Image Uploaders */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                  Product Images — Click to choose from gallery
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <ImageUploader
                        value={img}
                        onChange={(dataUrl) => handleImageGallery(idx, dataUrl)}
                        label={`Slot ${idx + 1}`}
                      />
                      {form.images.length > 1 && (
                        <button type="button" onClick={() => removeImageSlot(idx)}
                          className="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 z-10">
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {form.images.length < 4 && (
                  <button type="button" onClick={addImageSlot}
                    className="mt-2 text-[#22C55E] text-xs font-semibold hover:underline flex items-center gap-1">
                    <Plus size={12} /> Add another image slot
                  </button>
                )}
              </div>

              {/* Responsive Grid: 1 col mobile, 2 cols tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: 'Product Name *', field: 'name', placeholder: 'e.g. Kumkumadi Night Serum' },
                  { label: 'SKU', field: 'sku', placeholder: 'e.g. SK-KUM-01' },
                  { label: 'Regular Price (₹) *', field: 'price', type: 'number', placeholder: '1299' },
                  { label: 'Discount Price (₹)', field: 'discountPrice', type: 'number', placeholder: '999' },
                  { label: 'Inventory Count *', field: 'inventoryCount', type: 'number', placeholder: '50' },
                  { label: 'Brand', field: 'brand', placeholder: 'Pure Botanical' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
                    <input
                      type={type || 'text'} value={form[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full bg-[#1A2E20] border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white focus:outline-none focus:border-[#22C55E]/50"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Stock Status</label>
                  <select
                    value={form.stockStatus}
                    onChange={(e) => handleChange('stockStatus', e.target.value)}
                    className="w-full bg-[#1A2E20] border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white focus:outline-none focus:border-[#22C55E]/50"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Short Description *</label>
                  <input
                    type="text" value={form.shortDescription}
                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                    placeholder="One-line product summary..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Full Description</label>
                  <textarea
                    rows={4} value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Detailed ingredients, benefits, and usage instructions..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Toggle flags */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => handleChange('isNewArrival', !form.isNewArrival)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${form.isNewArrival ? 'bg-[#22C55E]' : 'bg-white/20'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isNewArrival ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs text-white/60 font-medium">Mark as New Arrival</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="button" onClick={() => setModalOpen(false)}
                  className="w-full sm:w-auto px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-semibold text-xs py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saving}
                  className="w-full sm:flex-1 bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-colors"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
