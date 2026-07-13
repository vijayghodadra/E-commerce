import React, { useState, useEffect, useRef } from 'react';
import { FolderTree, Plus, Edit, Trash, X, Upload, ImageIcon } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import API from '../../services/api';

function ImageUploader({ value, onChange, label = 'Category Image' }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
        {label}
      </label>

      {/* Preview box / upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-32 sm:h-40 rounded-xl border-2 border-dashed border-white/20 hover:border-[#22C55E]/50 bg-white/5 hover:bg-[#22C55E]/5 cursor-pointer flex flex-col items-center justify-center transition-all group overflow-hidden"
      >
        {value ? (
          <>
            <img
              src={value}
              alt="preview"
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-xl">
              <Upload size={20} className="text-white mb-1" />
              <span className="text-white text-xs font-semibold">Change Image</span>
            </div>
          </>
        ) : (
          <>
            <ImageIcon size={24} className="text-white/20 mb-2 group-hover:text-[#22C55E]/50 transition-colors" />
            <p className="text-white/40 text-[10px] sm:text-xs font-medium group-hover:text-white/60 transition-colors text-center px-2">
              Click to choose from gallery
            </p>
            <p className="text-white/20 text-[9px] sm:text-[10px] mt-1">JPG, PNG, WEBP</p>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Remove button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="mt-2 text-red-400 text-[10px] font-semibold hover:text-red-300 flex items-center gap-1"
        >
          <X size={10} /> Remove image
        </button>
      )}
    </div>
  );
}

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageData, setImageData] = useState(''); // base64 or existing URL
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      if (res.data.success) setCategories(res.data.categories);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Auto-generate slug from name
  const handleNameChange = (val) => {
    setName(val);
    if (!editingCategoryId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const openCreate = () => {
    setEditingCategoryId(null);
    setName(''); setSlug(''); setDescription(''); setImageData('');
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCategoryId(cat._id);
    setName(cat.name); setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageData(cat.image || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug) { showToast('Name and Slug are required', 'error'); return; }
    setSaving(true);
    const payload = { name, slug, description, image: imageData };
    try {
      const res = editingCategoryId
        ? await API.put(`/admin/categories/${editingCategoryId}`, payload)
        : await API.post('/admin/categories', payload);
      if (res.data.success) {
        showToast(editingCategoryId ? 'Category updated!' : 'Category created!');
        setModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deleting this category will unassign associated products. Continue?')) return;
    try {
      const res = await API.delete(`/admin/categories/${id}`);
      if (res.data.success) { showToast('Category removed'); fetchCategories(); }
    } catch { showToast('Failed to delete', 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white p-4 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <FolderTree size={20} className="text-[#22C55E]" /> Category Manager
          </h1>
          <p className="text-white/40 text-xs mt-1">Organise your products into distinct ritual collections.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/10" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-24 text-white/30 italic text-sm">
          No categories yet. Click "Add Category" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 hover:bg-white/8 transition-colors">
              <div className="w-full sm:w-16 h-32 sm:h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                {cat.image
                  ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-white/20" /></div>
                }
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                    <span className="text-[10px] text-[#22C55E] font-mono font-medium block mt-0.5">{cat.slug}</span>
                  </div>
                  <div className="flex sm:hidden gap-2">
                    <button onClick={() => openEdit(cat)} className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white/50"><Edit size={12}/></button>
                    <button onClick={() => handleDelete(cat._id)} className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white/50"><Trash size={12}/></button>
                  </div>
                </div>
                <p className="text-white/40 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">{cat.description || 'No description.'}</p>
              </div>
              <div className="hidden sm:flex flex-col gap-2 shrink-0">
                <button onClick={() => openEdit(cat)}
                  className="p-2 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-lg transition-all text-white/50 hover:text-blue-400"
                  title="Edit">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(cat._id)}
                  className="p-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg transition-all text-white/50 hover:text-red-400"
                  title="Delete">
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#0F1A14] border border-white/10 rounded-2xl w-full max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto z-50 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0F1A14] z-10">
              <h2 className="font-bold text-white text-sm sm:text-base">{editingCategoryId ? '✏️ Modify Category' : '➕ Create Category'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Category Name *</label>
                <input
                  type="text" value={name} onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Skin Care" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
                />
              </div>

              {/* Slug (auto-generated, editable) */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">URL Slug *</label>
                <input
                  type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. skin-care" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors font-mono"
                />
              </div>

              {/* Gallery image uploader */}
              <ImageUploader value={imageData} onChange={setImageData} label="Category Image" />

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this category's formulations..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="w-full sm:w-auto px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-semibold text-xs py-3 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="w-full sm:flex-1 bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-colors">
                  {saving ? 'Saving...' : editingCategoryId ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
