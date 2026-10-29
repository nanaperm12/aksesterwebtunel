import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Search, Shield, Filter } from 'lucide-react';

export const ActivityTab: React.FC = () => {
  const { currentUser, auditLogs } = useApp();
  const [filterAction, setFilterAction] = useState('all');

  const userLogs = auditLogs.filter((l) => l.actorUserId === currentUser.id);

  const filteredLogs = userLogs.filter((l) => {
    if (filterAction === 'all') return true;
    return l.action.toLowerCase().includes(filterAction.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Aktivitas & Log Audit Akun</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pencatatan riwayat perubahan tunnel, pendaftaran agent, verifikasi domain, dan pembayaran
            (PRD 13 & 18)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            aria-label="Filter Aktivitas"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Semua Aktivitas</option>
            <option value="tunnel">Operasi Tunnel</option>
            <option value="domain">Custom Domain</option>
            <option value="agent">Agent</option>
            <option value="payment">Pembayaran</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Waktu (WIB / UTC)</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Tipe Resource</th>
                <th className="py-3 px-4">Detail / Parameter</th>
                <th className="py-3 px-4">IP (Tersanitasi)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                    Belum ada log aktivitas yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-cyan-400 font-sans">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 uppercase text-[11px]">
                      {log.resourceType}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {log.metadataRedacted || log.resourceId}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {log.ipRedacted}
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
};
