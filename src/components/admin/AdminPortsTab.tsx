import React from 'react';
import { useApp } from '../../context/AppContext';
import { Network, ShieldCheck, Lock, Server } from 'lucide-react';

export const AdminPortsTab: React.FC = () => {
  const { tunnels, allUsers } = useApp();

  const portTunnels = tunnels.filter((t) => t.type === 'port' && t.publicPort);

  // Generate visual slots from port 2000 to 2049
  const portSlots = Array.from({ length: 50 }, (_, i) => 2000 + i);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-emerald-400" />
            <span>Peta Alokasi Port Publik Gateway</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualisasi alokasi port TCP/UDP gateway Aksester (rentang 2000–2099) dan proteksi bentrok
            port antar tenant (PRD 4.2 & 6.3)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
            <span className="text-slate-300">Teralokasi ({portTunnels.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
            <span className="text-slate-500">Tersedia</span>
          </div>
        </div>
      </div>

      {/* Visual Port Matrix (50 slots) */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Blok Port Publik Gateway: 2000 – 2049
        </h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {portSlots.map((port) => {
            const assigned = portTunnels.find((t) => t.publicPort === port);
            const user = assigned ? allUsers.find((u) => u.id === assigned.userId) : null;

            return (
              <div
                key={port}
                className={`p-2 rounded-lg border text-center transition-all ${
                  assigned
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950 border-slate-800/80 text-slate-500 hover:border-slate-700'
                }`}
                title={
                  assigned
                    ? `Port ${port} (${assigned.protocol.toUpperCase()}): ${assigned.name} · Tenant: ${user?.name}`
                    : `Port ${port}: Tersedia`
                }
              >
                <div className="font-mono text-xs font-bold tabular-nums">{port}</div>
                <div className="text-[9px] uppercase truncate">
                  {assigned ? assigned.protocol : 'Free'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Port Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 font-sans">
              <tr>
                <th className="py-3 px-4">Port Publik</th>
                <th className="py-3 px-4">Protokol</th>
                <th className="py-3 px-4">Tenant Pelanggan</th>
                <th className="py-3 px-4">Nama Tunnel</th>
                <th className="py-3 px-4">Target Loopback Mesin</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {portTunnels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    Belum ada port yang teralokasi.
                  </td>
                </tr>
              ) : (
                portTunnels.map((t) => {
                  const user = allUsers.find((u) => u.id === t.userId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-emerald-400 tabular-nums">
                        :{t.publicPort}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-300 uppercase">
                        {t.protocol}
                      </td>

                      <td className="py-3.5 px-4 font-sans text-slate-200 font-medium">
                        {user?.name || 'Unknown'}
                      </td>

                      <td className="py-3.5 px-4 font-sans text-slate-300">
                        {t.name}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {t.localHost}:{t.localPort}
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <span className="text-emerald-400 font-semibold uppercase text-[11px]">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
