import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Globe, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWebTunnelModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    agents,
    quotaUsage,
    currentPlan,
    createWebTunnel,
    checkSubdomainAvailable,
  } = useApp();

  const userAgents = agents.filter(
    (a) => a.userId === currentUser.id && a.status !== 'revoked'
  );

  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [localPort, setLocalPort] = useState('3000');
  const [agentId, setAgentId] = useState(userAgents[0]?.id || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const availability = checkSubdomainAvailable(subdomain);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const portNum = parseInt(localPort, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Port lokal harus di antara 1 dan 65535');
      return;
    }

    if (!agentId) {
      setError('Pilih minimal 1 agent yang terhubung');
      return;
    }

    const res = createWebTunnel(name, subdomain, portNum, agentId);
    if (!res.success) {
      setError(res.error || 'Gagal membuat web tunnel');
    } else {
      onClose();
      setName('');
      setSubdomain('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Buat Web Tunnel Baru</h3>
              <p className="text-xs text-slate-400">
                Publikasikan aplikasi HTTP lokal ke HTTPS Aksester
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {!quotaUsage.canCreateWebTunnel && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
            Kuota Web Tunnel paket {currentPlan?.name} telah penuh ({quotaUsage.webTunnelsUsed}/
            {quotaUsage.maxWebTunnels}). Harap upgrade paket untuk menambah tunnel.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nama Tunnel
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Web Katalog, Dashboard Admin"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Subdomain Aksester
              </label>
              {subdomain && (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    availability.available ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {availability.available ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Tersedia
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      {availability.reason}
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 overflow-hidden focus-within:border-cyan-500">
              <input
                type="text"
                value={subdomain}
                onChange={(e) =>
                  setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                }
                placeholder="slug-anda"
                required
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <span className="px-3 py-2 text-xs text-slate-400 bg-slate-900/60 border-l border-slate-800 whitespace-nowrap font-mono flex items-center">
                .aksester.us
              </span>
            </div>
            {subdomain && availability.available && (
              <p className="mt-1.5 text-xs text-slate-400 font-mono">
                URL Publik: <span className="text-cyan-400">https://{subdomain}.aksester.us</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Host (Terkunci)
              </label>
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>127.0.0.1 (Loopback)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Port Lokal
              </label>
              <input
                type="number"
                value={localPort}
                onChange={(e) => setLocalPort(e.target.value)}
                placeholder="3000"
                min="1"
                max="65535"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pilih Agent
            </label>
            {userAgents.length === 0 ? (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
                Belum ada agent aktif. Silakan daftarkan agent terlebih dahulu di tab 'Agents'.
              </div>
            ) : (
              <select
                aria-label="Pilih Agent"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {userAgents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.platform} - {a.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                !quotaUsage.canCreateWebTunnel ||
                !availability.available ||
                userAgents.length === 0
              }
              className="px-4 py-2 text-xs font-medium bg-cyan-500 text-slate-950 font-semibold rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Buat Web Tunnel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
