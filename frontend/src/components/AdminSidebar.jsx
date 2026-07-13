import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, FolderTree, ClipboardList,
  Users, Tag, ArrowLeft, ChevronRight, Leaf, Menu, X
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard',  path: '/admin',            icon: LayoutDashboard, desc: 'Overview & stats' },
  { name: 'Products',   path: '/admin/products',   icon: ShoppingBag,     desc: 'Catalog management' },
  { name: 'Categories', path: '/admin/categories', icon: FolderTree,      desc: 'Organise catalog' },
  { name: 'Orders',     path: '/admin/orders',     icon: ClipboardList,   desc: 'Fulfillment & tracking' },
  { name: 'Customers',  path: '/admin/users',      icon: Users,           desc: 'User management' },
  { name: 'Coupons',    path: '/admin/coupons',    icon: Tag,             desc: 'Discount codes' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#22C55E]/20 flex items-center justify-center shrink-0">
            <Leaf size={15} className="text-[#22C55E]" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">Botanicals</h2>
            <span className="text-[10px] text-white/40 font-medium">Admin Console</span>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-3 pb-2 pt-1">Main Menu</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? 'bg-[#22C55E]/15 text-[#22C55E]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-[#22C55E]' : 'text-white/40 group-hover:text-white/70'} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold block leading-tight">{item.name}</span>
                <span className={`text-[10px] truncate ${isActive ? 'text-[#22C55E]/60 block' : 'hidden group-hover:block text-white/30'}`}>
                  {item.desc}
                </span>
              </div>
              {isActive && <ChevronRight size={13} className="text-[#22C55E]/60 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
        >
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0A1209] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
            <Leaf size={13} className="text-[#22C55E]" />
          </div>
          <span className="text-white font-bold text-sm">Admin Console</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile slide-in drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 bg-[#0A1209] border-r border-white/10 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Desktop permanent sidebar ── */}
      <aside className="hidden md:flex w-64 bg-[#0A1209] border-r border-white/10 flex-col min-h-screen shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
