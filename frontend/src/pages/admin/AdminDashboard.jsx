import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, IndianRupee, ShoppingBag, Users,
  ClipboardList, TrendingUp, Package, ArrowUpRight, Clock
} from 'lucide-react';
import API from '../../services/api';

const STATUS_COLORS = {
  Pending:    'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Shipped:    'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Delivered:  'bg-green-500/15 text-green-400 border-green-500/30',
  Cancelled:  'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/admin/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentOrders(res.data.recentOrders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { title: 'Total Revenue',    value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { title: 'Total Orders',     value: stats?.totalOrders  || 0, icon: ClipboardList, color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
    { title: 'Total Products',   value: stats?.totalProducts || 0, icon: ShoppingBag,   color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
    { title: 'Registered Users', value: stats?.totalUsers   || 0, icon: Users,          color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4 animate-pulse">
        <div className="h-7 bg-white/5 w-1/3 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/10" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-xl border border-white/10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white p-4 md:p-8 space-y-5 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={20} className="text-[#22C55E]" />
            Dashboard Overview
          </h1>
          <p className="text-white/40 text-xs mt-1">Welcome back — here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-2 rounded-lg self-start sm:self-auto">
          <Clock size={12} />
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`rounded-xl border p-4 md:p-5 ${card.bg} ${card.border}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/40 leading-tight">{card.title}</span>
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg ${card.bg} border ${card.border} flex items-center justify-center shrink-0`}>
                  <Icon size={13} className={card.color} />
                </div>
              </div>
              <span className={`text-xl md:text-2xl font-bold ${card.color}`}>{card.value}</span>
            </div>
          );
        })}
      </div>

      {/* Quick Links — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Orders',  path: '/admin/orders',     icon: ClipboardList, color: 'text-blue-400' },
          { label: 'Add Product',    path: '/admin/products',   icon: Package,       color: 'text-orange-400' },
          { label: 'View Customers', path: '/admin/users',      icon: Users,         color: 'text-violet-400' },
          { label: 'Coupons',        path: '/admin/coupons',    icon: TrendingUp,    color: 'text-emerald-400' },
        ].map((item) => (
          <Link
            key={item.path} to={item.path}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 transition-all group"
          >
            <item.icon size={14} className={item.color} />
            <span className="text-[11px] md:text-xs font-semibold text-white/70 group-hover:text-white transition-colors flex-1 leading-tight">{item.label}</span>
            <ArrowUpRight size={11} className="text-white/20 group-hover:text-white/60 shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent Orders — scrollable table on mobile */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
          <h2 className="font-bold text-sm text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-[#22C55E] text-xs font-semibold hover:underline flex items-center gap-1">
            View All <ArrowUpRight size={11} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[540px]">
            <thead>
              <tr className="border-b border-white/10 text-white/30 uppercase tracking-wider text-[10px] font-bold">
                <th className="px-4 md:px-6 py-3 text-left">Order</th>
                <th className="px-4 md:px-6 py-3 text-left">Customer</th>
                <th className="px-4 md:px-6 py-3 text-left">Amount</th>
                <th className="px-4 md:px-6 py-3 text-left">Payment</th>
                <th className="px-4 md:px-6 py-3 text-left">Status</th>
                <th className="px-4 md:px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-white/30 italic">No orders yet.</td></tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 md:px-6 py-3 font-mono text-[#22C55E] text-[10px]">#{ord._id.toString().slice(-8).toUpperCase()}</td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="font-semibold text-white/80">{ord.user?.name || 'Guest'}</div>
                      <div className="text-white/30 text-[10px] hidden sm:block">{ord.user?.email}</div>
                    </td>
                    <td className="px-4 md:px-6 py-3 text-emerald-400 font-bold">₹{ord.totalPrice?.toLocaleString('en-IN')}</td>
                    <td className="px-4 md:px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${ord.isPaid ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                        {ord.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_COLORS[ord.orderStatus] || STATUS_COLORS['Pending']}`}>
                        {ord.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 text-white/40 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
