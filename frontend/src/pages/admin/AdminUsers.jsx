import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle, Mail, Phone, Calendar } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import API from '../../services/api';

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) setUsers(res.data.users);
    } catch { showToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBlock = async (id, isBlocked) => {
    try {
      const res = await API.put(`/admin/users/${id}/block`);
      if (res.data.success) {
        showToast(isBlocked ? 'User unblocked' : 'User blocked');
        fetchUsers();
      }
    } catch { showToast('Failed to update user', 'error'); }
  };

  const filtered = users.filter((u) =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white p-4 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Users size={20} className="text-[#22C55E]" /> Customer Management
          </h1>
          <p className="text-white/40 text-xs mt-1">View, block or unblock registered customers.</p>
        </div>
        <div className="text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-2 rounded-lg self-start">
          {users.length} Customers
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#22C55E]/50" />
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/10" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30 italic">No customers found.</div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/30 uppercase tracking-wider text-[10px] font-bold">
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Phone</th>
                    <th className="px-5 py-3 text-left">Joined</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((u) => (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center font-bold text-[#22C55E] text-xs shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white/80">{u.name}</p>
                            <p className="text-white/30 text-[10px] flex items-center gap-1"><Mail size={9} />{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/50">
                        <span className="flex items-center gap-1"><Phone size={10} />{u.phone || '—'}</span>
                      </td>
                      <td className="px-5 py-4 text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${u.isBlocked ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-green-500/15 text-green-400 border-green-500/30'}`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleBlock(u._id, u.isBlocked)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${u.isBlocked ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'}`}>
                          {u.isBlocked ? <><CheckCircle size={11} /> Unblock</> : <><Ban size={11} /> Block</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile cards ── */}
          <div className="md:hidden space-y-3">
            {filtered.map((u) => (
              <div key={u._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center font-bold text-[#22C55E] text-sm shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white/90 text-sm truncate">{u.name}</p>
                  <p className="text-white/40 text-[11px] truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${u.isBlocked ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-green-500/15 text-green-400 border-green-500/30'}`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                    <span className="text-white/30 text-[10px]">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleBlock(u._id, u.isBlocked)}
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-lg text-[10px] font-semibold border transition-all ${u.isBlocked ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  {u.isBlocked ? <><CheckCircle size={12} /></> : <><Ban size={12} /></>}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
