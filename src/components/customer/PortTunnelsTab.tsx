import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Network,
  Plus,
  Copy,
  Check,
  Trash2,
  Terminal,
  Lock,
  Server,
  Search,
} from 'lucide-react';

interface Props {
  onOpenCreate: () => void;
}

export const PortTunnelsTab: React.FC<Props> = ({ onOpenCreate }) => {
  const { currentUser, tunnels, agents, quotaUsage, deletePortTunnel } = useApp();

  const userPortTunnels = tunnels.filter(
    (t) => t.userId === currentUser.id && t.type === 'port'
  );

  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = userPortTunnels.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.publicPort?.toString().includes(search) ||
      t.protocol.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyEndpoint = (endpoint: string, id: string) => {
    navigator.clipboard.writeText(endpoint);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Port Tunnel "${name}"? Alokasi port publik akan dibebaskan.`)) {
      deletePortTunnel(id);
    }
  };

  const getClientCommandHint = (protocol: string, publicPort: number, localPort: number) => {
    if (localPort === 22) {
      return `ssh -p ${publicPort} user@aksester.us`;
    }
    if (localPort === 5432) {
      return `psql -h aksester.us -p ${publicPort} -U postgres`;
    }
    if (localPort === 3306) {
      return `mysql -h aksester.us -P ${publicPort} -u root -p`;
    }
    if (protocol === 'udp') {
      return `nc -u aksester.us ${publicPort}`;
    }
    return `nc aksester.us ${publicPort}`;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-emerald-400" />
            <span>Port Tunnels (TCP / UDP)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Teruskan koneksi TCP/UDP mentah seperti SSH, PostgreSQL, MySQL, Redis, atau IoT via endpoint
            publik yang dialokasikan
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          disabled={!quotaUsage.canCreatePortTunnel}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Port Tunnel</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, port, atau protokol..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total: <span className="text-slate-200 font-bold">{userPortTunnels.length}</span> tunnel
        </div>
      </div>

      {/* Table view */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Tunnel</th>
                <th className="py-3 px-4">Endpoint Publik Aksester</th>
                <th className="py-3 px-4">Protokol</th>
                <th className="py-3 px-4">Target Loopback</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Perintah Klien Contoh</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ada Port Tunnel yang dibuat.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const agent = agents.find((a) => a.id === t.agentId);
                  const endpoint = `aksester.us:${t.publicPort}`;
                  const cmdHint = getClientCommandHint(
                    t.protocol,
                    t.publicPort || 2000,
                    t.localPort
                  );

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100">
                        {t.name}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-emerald-400">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">{endpoint}</span>
                          <button
                            onClick={() => handleCopyEndpoint(endpoint, t.id)}
                            title="Salin Endpoint"
                            className="text-slate-500 hover:text-slate-300 p-1"
                          >
                            {copiedId === t.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono uppercase font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            t.protocol === 'tcp'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {t.protocol}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Lock className="w-3 h-3 text-cyan-500" />
                          <span>
                            {t.localHost}:{t.localPort}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Server className="w-3.5 h-3.5 text-slate-400" />
                          <span>{agent?.name || 'Unknown'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800/60 text-[11px] max-w-[220px]">
                          <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{cmdHint}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          title="Hapus Port Tunnel"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
