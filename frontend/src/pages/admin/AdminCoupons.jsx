import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import API from '../../services/api';

export default function AdminCoupons() {
  const { showToast } = useToast();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('500');
  const [maxDiscount, setMaxDiscount] = useState('300');
  const [expiryDays, setExpiryDays] = useState('30'); // Expiry in X days
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) {
      showToast('Please specify coupon code and value', 'error');
      return;
    }

    setSaving(true);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(expiryDays));

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase),
      maxDiscount: Number(maxDiscount),
      expiryDate,
    };

    try {
      const res = await API.post('/admin/coupons', payload);
      if (res.data.success) {
        showToast(`Coupon "${code}" generated successfully!`);
        setModalOpen(false);
        setCode('');
        setDiscountValue('');
        fetchCoupons();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await API.delete(`/admin/coupons/${id}`);
      if (res.data.success) {
        showToast('Coupon removed');
        fetchCoupons();
      }
    } catch (err) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white p-4 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Tag size={20} className="text-[#22C55E]" /> Coupon Manager
          </h1>
          <p className="text-white/40 text-xs mt-1">Configure active flat-rate discounts and percentage coupons.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {/* Coupons Content */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/10" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-24 text-white/30 italic text-sm">
          No coupons generated. Tap "Create Coupon" to initiate discounts.
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/30 uppercase tracking-wider text-[10px] font-bold">
                    <th className="px-5 py-3 text-left">Coupon Code</th>
                    <th className="px-5 py-3 text-left">Discount Rate</th>
                    <th className="px-5 py-3 text-left">Min Purchase</th>
                    <th className="px-5 py-3 text-left">Max Cap</th>
                    <th className="px-5 py-3 text-left">Expiry Date</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-mono text-[#22C55E] font-bold text-sm tracking-wider uppercase">{c.code}</td>
                      <td className="px-5 py-4 font-bold text-white/80">
                        {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                      </td>
                      <td className="px-5 py-4 text-white/50">₹{c.minPurchase}</td>
                      <td className="px-5 py-4 text-white/50">₹{c.maxDiscount}</td>
                      <td className="px-5 py-4 text-white/40">
                        {new Date(c.expiryDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="p-1.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg transition-all text-white/50 hover:text-red-400"
                          title="Delete Coupon"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden space-y-3">
            {coupons.map((c) => (
              <div key={c._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[#22C55E] font-bold text-sm tracking-wider uppercase">{c.code}</span>
                    <p className="font-bold text-white/80 mt-1">
                      {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCoupon(c._id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all text-red-400 shrink-0"
                    title="Delete"
                  >
                    <Trash size={12} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px] text-white/50 bg-white/5 p-3 rounded-lg border border-white/10">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Min Order</span>
                    ₹{c.minPurchase}
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Max Discount</span>
                    ₹{c.maxDiscount}
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="block text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Expires</span>
                    {new Date(c.expiryDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Coupon Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative bg-[#0F1A14] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl z-50 overflow-hidden">
            <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0F1A14] z-10">
              <h2 className="text-sm sm:text-base font-bold text-white">➕ Create Promotional Coupon</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Promo Code *</label>
                <input
                  type="text" value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. BOTANICAL15" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={discountType} onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-[#1A2E20] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#22C55E]/50"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Value *</label>
                  <input
                    type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="e.g. 15" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Min Purchase (₹)</label>
                  <input
                    type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Max Cap (₹)</label>
                  <input
                    type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Valid Duration (Days)</label>
                <input
                  type="number" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-colors"
                />
              </div>

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
                  {saving ? 'Generating...' : 'Generate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
