import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tunnel } from '../../types';
import {
  Globe,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Edit2,
  Lock,
  Search,
  Server,
  Play,
  X,
} from 'lucide-react';

interface Props {
  onOpenCreate: () => void;
}

export const WebTunnelsTab: React.FC<Props> = ({ onOpenCreate }) => {
  const {
    currentUser,
    tunnels,
    agents,
    quotaUsage,
    deleteWebTunnel,
    updateWebTunnel,
  } = useApp();

  const userWebTunnels = tunnels.filter(
    (t) => t.userId === currentUser.id && t.type === 'web'
  );

  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTunnel, setEditingTunnel] = useState<Tunnel | null>(null);
  const [editName, setEditName] = useState('');
  const [editPort, setEditPort] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [testUrlTunnel, setTestUrlTunnel] = useState<Tunnel | null>(null);

  const filtered = userWebTunnels.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subdomain?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (subdomain: string, id: string) => {
    navigator.clipboard.writeText(`https://${subdomain}.aksester.us`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (tunnel: Tunnel) => {
    setEditingTunnel(tunnel);
    setEditName(tunnel.name);
    setEditPort(tunnel.localPort.toString());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTunnel) return;
    const port = parseInt(editPort, 10);
    if (!isNaN(port) && port >= 1 && port <= 65535) {
      updateWebTunnel(editingTunnel.id, editName, port);
      setEditingTunnel(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteError(null);
    if (confirm(`Apakah Anda yakin ingin menghapus Web Tunnel "${name}"? Routing akan segera dicabut.`)) {
      const res = deleteWebTunnel(id);
      if (!res.success) {
        setDeleteError(res.error || 'Gagal menghapus web tunnel');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            <span>Web Tunnels (HTTP / HTTPS)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Publikasikan aplikasi web lokal via subdomain bawaan Aksester dengan terminasi TLS otomatis
            Caddy
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          disabled={!quotaUsage.canCreateWebTunnel}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Web Tunnel</span>
        </button>
      </div>

      {deleteError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
          {deleteError}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tunnel berdasarkan nama atau slug..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total: <span className="text-slate-200 font-bold">{userWebTunnels.length}</span> tunnel
        </div>
      </div>

      {/* Table view */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Tunnel</th>
                <th className="py-3 px-4">URL Publik Aksester</th>
                <th className="py-3 px-4">Target Lokal (Loopback)</th>
                <th className="py-3 px-4">Agent Terhubung</th>
                <th className="py-3 px-4">Status & TLS</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ada Web Tunnel yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const agent = agents.find((a) => a.id === t.agentId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100">
                        {t.name}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-cyan-400">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[200px]">
                            https://{t.subdomain}.aksester.us
                          </span>
                          <button
                            onClick={() => handleCopy(t.subdomain || '', t.id)}
                            title="Salin URL"
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
                          <span>{agent?.name || 'Unknown Agent'}</span>
                          <span
                            className={`text-[10px] uppercase font-mono ${
                              agent?.status === 'online' ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            ({agent?.status})
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              t.status === 'active'
                                ? 'bg-emerald-400'
                                : t.status === 'suspended'
                                ? 'bg-rose-400'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span className="capitalize font-medium text-slate-200">
                            {t.status}
                          </span>
                          <span className="text-[10px] text-slate-500">· Caddy TLS</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setTestUrlTunnel(t)}
                            title="Uji Respon Browser"
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartEdit(t)}
                            title="Ubah Port/Nama"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id, t.name)}
                            title="Hapus Tunnel"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test URL Simulation Modal */}
      {testUrlTunnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">
                  Simulasi HTTP Response Gateway
                </h3>
              </div>
              <button
                onClick={() => setTestUrlTunnel(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 space-y-1">
                <div className="text-emerald-400">GET / HTTP/2</div>
                <div>Host: {testUrlTunnel.subdomain}.aksester.us</div>
                <div>User-Agent: Mozilla/5.0 (Aksester-Gateway-Check)</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 space-y-2">
                <div className="text-emerald-400 font-semibold">HTTP/2 200 OK</div>
                <div className="text-slate-500">
                  server: Caddy + FRP Gateway Reverse Proxy
                  <br />
                  strict-transport-security: max-age=31536000; includeSubDomains
                  <br />
                  content-type: text/html; charset=utf-8
                  <br />
                  x-forwarded-for: 180.252.12.94
                </div>
                <div className="pt-2 border-t border-slate-800 text-slate-300">
                  &lt;!-- Respon berhasil diteruskan ke 127.0.0.1:{testUrlTunnel.localPort} pada mesin{' '}
                  {agents.find((a) => a.id === testUrlTunnel.agentId)?.name} --&gt;
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setTestUrlTunnel(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white rounded-lg"
              >
                Tutup Simulasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tunnel Modal */}
      {editingTunnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <h3 className="text-base font-semibold text-white mb-4">Edit Web Tunnel</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Tunnel
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Port Lokal (127.0.0.1)
                </label>
                <input
                  type="number"
                  value={editPort}
                  onChange={(e) => setEditPort(e.target.value)}
                  min="1"
                  max="65535"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTunnel(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
