import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Search, Eye, X,
  Package, Truck, CheckCircle2, Clock, XCircle, CreditCard, MapPin
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import API from '../../services/api';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_STYLE = {
  Pending:    { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: Clock },
  Processing: { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',       icon: Package },
  Shipped:    { cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: Truck },
  Delivered:  { cls: 'bg-green-500/15 text-green-400 border-green-500/30',    icon: CheckCircle2 },
  Cancelled:  { cls: 'bg-red-500/15 text-red-400 border-red-500/30',          icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE['Pending'];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.cls}`}>
      <Icon size={10} />{status || 'Pending'}
    </span>
  );
};

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/orders');
      if (res.data.success) setOrders(res.data.orders);
    } catch { showToast('Failed to load orders', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const res = await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Order marked as "${newStatus}"`);
        fetchOrders();
        if (selectedOrder?._id === orderId) setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch { showToast('Failed to update status', 'error'); }
    finally { setUpdating(false); }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === 'All' || (o.orderStatus || 'Pending') === filterStatus;
    const matchSearch = !search ||
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white p-4 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <ClipboardList size={20} className="text-[#22C55E]" /> Order Management
          </h1>
          <p className="text-white/40 text-xs mt-1">Track, accept and update all customer orders.</p>
        </div>
        <div className="text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-2 rounded-lg self-start">
          {orders.length} Total Orders
        </div>
      </div>

      {/* Status Filter chips — horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['All', ...STATUS_OPTIONS].map((s) => {
          const count = s === 'All' ? orders.length : orders.filter((o) => (o.orderStatus || 'Pending') === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                filterStatus === s
                  ? 'bg-[#22C55E]/20 border-[#22C55E]/40 text-[#22C55E]'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}>
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, name or email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#22C55E]/50" />
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/10" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30 italic text-sm">No orders found.</div>
      ) : (
        <>
          {/* ── Desktop table (hidden on mobile) ── */}
          <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/30 uppercase tracking-wider text-[10px] font-bold">
                    <th className="px-5 py-3 text-left">Order</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Items</th>
                    <th className="px-5 py-3 text-left">Amount</th>
                    <th className="px-5 py-3 text-left">Payment</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((ord) => (
                    <tr key={ord._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-mono text-[#22C55E] text-[10px]">#{ord._id.toString().slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-white/80 text-xs">{ord.user?.name || 'Guest'}</div>
                        <div className="text-white/30 text-[10px]">{ord.user?.email}</div>
                      </td>
                      <td className="px-5 py-3 text-white/60">{ord.orderItems?.length || 0} item(s)</td>
                      <td className="px-5 py-3 text-emerald-400 font-bold">₹{ord.totalPrice?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${ord.isPaid ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                          {ord.isPaid ? '✓ Paid' : '✗ Unpaid'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <select value={ord.orderStatus || 'Pending'} onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                          disabled={updating}
                          className="bg-[#1A2E20] border border-white/10 text-white/80 text-[10px] font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#22C55E]/50 cursor-pointer">
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-white/40 whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 bg-white/5 hover:bg-[#22C55E]/20 border border-white/10 hover:border-[#22C55E]/40 rounded-lg transition-all text-white/50 hover:text-[#22C55E]">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile cards (hidden on desktop) ── */}
          <div className="md:hidden space-y-3">
            {filtered.map((ord) => (
              <div key={ord._id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[#22C55E] text-[11px] font-bold">
                      #{ord._id.toString().slice(-8).toUpperCase()}
                    </span>
                    <p className="text-white/80 font-semibold text-sm mt-0.5">{ord.user?.name || 'Guest'}</p>
                    <p className="text-white/30 text-[11px]">{ord.user?.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-emerald-400 font-bold text-sm">₹{ord.totalPrice?.toLocaleString('en-IN')}</p>
                    <p className="text-white/30 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={ord.orderStatus || 'Pending'} />
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${ord.isPaid ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                    {ord.isPaid ? '✓ Paid' : '✗ Unpaid'}
                  </span>
                  <span className="text-white/30 text-[10px]">{ord.orderItems?.length || 0} item(s)</span>
                </div>

                <div className="flex gap-2">
                  <select value={ord.orderStatus || 'Pending'} onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                    disabled={updating}
                    className="flex-1 bg-[#1A2E20] border border-white/10 text-white/80 text-xs font-semibold rounded-lg px-2 py-2 focus:outline-none">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setSelectedOrder(ord)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-[#22C55E]/20 border border-white/10 hover:border-[#22C55E]/40 rounded-lg transition-all text-white/60 hover:text-[#22C55E] text-xs font-semibold">
                    <Eye size={13} /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-[#0F1A14] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto z-50 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0F1A14] z-10">
              <div>
                <h2 className="font-bold text-white text-sm">Order Details</h2>
                <p className="text-white/40 text-xs">#{selectedOrder._id.toString().slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer + Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2">Customer</p>
                  <p className="text-white font-semibold">{selectedOrder.user?.name || 'Guest'}</p>
                  <p className="text-white/50 text-xs break-all">{selectedOrder.user?.email}</p>
                </div>
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><CreditCard size={10} /> Payment</p>
                  <p className="text-white font-semibold">{selectedOrder.paymentMethod}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${selectedOrder.isPaid ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                    {selectedOrder.isPaid ? 'Paid' : 'Not Paid'}
                  </span>
                </div>
              </div>

              {/* Shipping */}
              {selectedOrder.shippingAddress && (
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin size={10} /> Shipping Address</p>
                  <p className="text-white/70 text-sm">
                    {selectedOrder.shippingAddress.streetAddress || selectedOrder.shippingAddress.street},{' '}
                    {selectedOrder.shippingAddress.city},{' '}
                    {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.pinCode || selectedOrder.shippingAddress.postalCode}
                  </p>
                  {selectedOrder.shippingAddress.phone && (
                    <p className="text-white/40 text-xs mt-1">📱 {selectedOrder.shippingAddress.phone}</p>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-3">Items Ordered</p>
                <div className="space-y-2">
                  {selectedOrder.orderItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 p-3">
                      <img src={item.image} alt={item.name} className="w-9 h-11 object-cover rounded-lg bg-white/5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 font-semibold text-xs truncate">{item.name}</p>
                        <p className="text-white/40 text-[10px]">Qty: {item.qty}</p>
                      </div>
                      <p className="text-emerald-400 font-bold text-xs shrink-0">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2 text-xs">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-3">Price Breakdown</p>
                {[
                  ['Subtotal',   `₹${selectedOrder.itemsPrice?.toLocaleString('en-IN')}`],
                  ['GST (18%)', `₹${selectedOrder.taxPrice?.toLocaleString('en-IN')}`],
                  ['Shipping',  selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice}`],
                  ...(selectedOrder.discountPrice > 0 ? [['Discount', `-₹${selectedOrder.discountPrice?.toLocaleString('en-IN')}`]] : []),
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between text-white/60"><span>{label}</span><span>{val}</span></div>
                ))}
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span className="text-emerald-400">₹{selectedOrder.totalPrice?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2">Update Order Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s} onClick={() => handleStatusChange(selectedOrder._id, s)}
                      disabled={updating || (selectedOrder.orderStatus || 'Pending') === s}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        (selectedOrder.orderStatus || 'Pending') === s
                          ? 'bg-[#22C55E]/20 border-[#22C55E]/40 text-[#22C55E]'
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-40'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
