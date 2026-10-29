import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Network, Shield, AlertCircle, Info } from 'lucide-react';
import { TunnelProtocol } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePortTunnelModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    agents,
    quotaUsage,
    currentPlan,
    createPortTunnel,
    getNextAvailablePort,
  } = useApp();

  const userAgents = agents.filter(
    (a) => a.userId === currentUser.id && a.status !== 'revoked'
  );

  const nextPort = getNextAvailablePort();

  const [name, setName] = useState('');
  const [protocol, setProtocol] = useState<TunnelProtocol>('tcp');
  const [localPort, setLocalPort] = useState('22');
  const [agentId, setAgentId] = useState(userAgents[0]?.id || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const portNum = parseInt(localPort, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Port lokal harus di antara 1 dan 65535');
      return;
    }

    if (!agentId) {
      setError('Pilih minimal 1 agent');
      return;
    }

    const res = createPortTunnel(name, protocol, portNum, agentId);
    if (!res.success) {
      setError(res.error || 'Gagal mengalokasikan port tunnel');
    } else {
      onClose();
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Buat Port Tunnel Baru</h3>
              <p className="text-xs text-slate-400">
                Teruskan koneksi TCP/UDP publik ke service lokal mesin
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

        {!quotaUsage.canCreatePortTunnel && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
            Kuota Port Tunnel paket {currentPlan?.name} telah penuh ({quotaUsage.portTunnelsUsed}/
            {quotaUsage.maxPortTunnels}). Harap upgrade paket.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nama Port Tunnel
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: SSH Server Lokal, DB Postgres Dev"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Protokol
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setProtocol('tcp')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    protocol === 'tcp'
                      ? 'bg-slate-800 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  TCP (Utama)
                </button>
                <button
                  type="button"
                  onClick={() => setProtocol('udp')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    protocol === 'udp'
                      ? 'bg-slate-800 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  UDP (Beta)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alokasi Port Gateway
              </label>
              <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400 flex items-center justify-between">
                <span>aksester.us:{nextPort}</span>
                <span className="text-[10px] text-slate-500 uppercase">Auto</span>
              </div>
            </div>
          </div>

          {protocol === 'udp' && (
            <div className="p-2.5 bg-slate-950 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Catatan PRD 4.2: Dukungan UDP disediakan secara terbatas dengan alokasi terisolasi
                untuk mencegah abuse.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Host (Terkunci)
              </label>
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>127.0.0.1</span>
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
                placeholder="22"
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
                Belum ada agent terdaftar.
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
              disabled={!quotaUsage.canCreatePortTunnel || userAgents.length === 0}
              className="px-4 py-2 text-xs font-medium bg-cyan-500 text-slate-950 font-semibold rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Alokasikan Port Tunnel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
