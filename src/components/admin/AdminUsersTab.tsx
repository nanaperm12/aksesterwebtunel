import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const { allUsers, subscriptions, plans, tunnels, suspendUser, resumeUser } = useApp();

  const [search, setSearch] = useState('');
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmSuspend = () => {
    if (!selectedUserForSuspend || !suspendReason.trim()) return;
    suspendUser(selectedUserForSuspend.id, suspendReason.trim());
    setSelectedUserForSuspend(null);
    setSuspendReason('');
  };

  const handleResume = (u: User) => {
    if (confirm(`Aktifkan kembali akun "${u.name}"? Semua tunnel tenant akan diaktifkan ulang.`)) {
      resumeUser(u.id, 'Penyelesaian masalah / verifikasi admin');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Manajemen Pengguna & Akun Tenant</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daftar tenant terdaftar, status langganan, dan kontrol penangguhan akun (Suspend / Resume)
            sesuai PRD 10 & 15
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari user berdasarkan nama, email, perusahaan..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total: <span className="text-slate-200 font-bold">{allUsers.length}</span> akun
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Paket Aktif</th>
                <th className="py-3 px-4">Total Tunnel</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const sub = subscriptions.find((s) => s.userId === u.id);
                const plan = plans.find((p) => p.id === sub?.planId);
                const userTunnels = tunnels.filter((t) => t.userId === u.id);
                const isSuspended = u.status === 'suspended';

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      <div>{u.name}</div>
                      {u.companyName && (
                        <span className="text-[11px] text-slate-500 font-normal">
                          {u.companyName}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                          u.role === 'admin'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {plan?.name || 'Free Starter'}
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-300">
                      {userTunnels.length} tunnel
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium ${
                          isSuspended ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSuspended ? 'bg-rose-400' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="capitalize">{u.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <>
                          {isSuspended ? (
                            <button
                              onClick={() => handleResume(u)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded transition-colors"
                            >
                              Resume Akun
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedUserForSuspend(u)}
                              className="px-2.5 py-1 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 rounded transition-colors"
                            >
                              Suspend Akun
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend User Modal */}
      {selectedUserForSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Suspend Akun Tenant</h3>
              </div>
              <button
                onClick={() => setSelectedUserForSuspend(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
              Peringatan PRD 10 & 15: Menangguhkan akun <strong>{selectedUserForSuspend.name}</strong>{' '}
              akan secara otomatis menonaktifkan seluruh Web Tunnel dan Port Tunnel yang aktif milik
              tenant ini.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alasan Penangguhan (Wajib untuk Audit Log)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Contoh: Laporan penyalahgunaan abuse/phishing, keterlambatan pembayaran grace period, dll."
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedUserForSuspend(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                disabled={!suspendReason.trim()}
                className="px-4 py-2 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50"
              >
                Konfirmasi Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
