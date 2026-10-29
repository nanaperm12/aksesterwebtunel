import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Filter } from 'lucide-react';

export const AdminAuditLogsTab: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.resourceType.toLowerCase().includes(search.toLowerCase()) ||
      l.metadataRedacted?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span>Audit Log Sistem & Keamanan Aksester</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Log tindakan administratif yang tidak dapat diubah (immutable), sanitasi data rahasia & IP
            sesuai PRD 10, 13, & 15
          </p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari audit log..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 font-sans">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Pelaku (Actor)</th>
                <th className="py-3 px-4">Aksi Sensitif</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Metadata Sanitasi</th>
                <th className="py-3 px-4">IP Redacted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((log) => (
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

                  <td className="py-3.5 px-4 font-sans font-medium text-slate-200">
                    {log.actorName}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-cyan-400 font-sans">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 uppercase text-[11px]">
                    {log.resourceType}: <span className="text-slate-500">{log.resourceId}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate text-[11px]">
                    {log.metadataRedacted || '-'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {log.ipRedacted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
