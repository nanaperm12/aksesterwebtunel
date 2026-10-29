import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Server,
  Plus,
  Activity,
  Power,
  RotateCcw,
  ShieldAlert,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  onOpenAdd: () => void;
}

export const AgentsTab: React.FC<Props> = ({ onOpenAdd }) => {
  const {
    currentUser,
    agents,
    quotaUsage,
    simulateHeartbeat,
    toggleAgentOnlineOffline,
    revokeAgent,
  } = useApp();

  const userAgents = agents.filter((a) => a.userId === currentUser.id);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  const formatLastSeen = (isoString: string) => {
    const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
    if (diffSeconds < 60) return `${diffSeconds} detik yang lalu`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} jam yang lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-400" />
            <span>Agent Pelanggan (Windows & Linux)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daemon agent Aksester menjaga koneksi keluar (outbound tunnel) ke gateway tanpa membuka port
            masuk di firewall lokal
          </p>
        </div>

        <button
          onClick={onOpenAdd}
          disabled={!quotaUsage.canCreateAgent}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Daftarkan Agent Baru</span>
        </button>
      </div>

      {/* Agents List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userAgents.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <Server className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">Belum ada agent terdaftar</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Daftarkan komputer atau server lokal Anda dengan membuat token enrollment satu kali pakai.
            </p>
            <button
              onClick={onOpenAdd}
              className="mt-2 px-4 py-2 text-xs font-semibold bg-blue-500 text-slate-950 rounded-lg hover:bg-blue-400"
            >
              Daftarkan Agent Sekarang
            </button>
          </div>
        ) : (
          userAgents.map((agent) => {
            const isOnline = agent.status === 'online';
            const isRevoked = agent.status === 'revoked';

            return (
              <div
                key={agent.id}
                className={`p-5 rounded-xl border transition-all ${
                  isRevoked
                    ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {agent.platform === 'windows' ? '🪟 Windows' : '🐧 Linux'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {agent.hostname || 'localhost'} · {agent.ipAddress || '127.0.0.1'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-emerald-400' : isRevoked ? 'bg-rose-500' : 'bg-slate-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-medium uppercase font-mono ${
                        isOnline
                          ? 'text-emerald-400'
                          : isRevoked
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                </div>

                {/* Metadata info */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-lg text-xs font-mono mb-4 text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Versi Agent</span>
                    <span className="text-slate-200">{agent.agentVersion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      Heartbeat Terakhir
                    </span>
                    <span className="text-cyan-300">{formatLastSeen(agent.lastSeenAt)}</span>
                  </div>
                </div>

                {/* Action Buttons for Interactive Testing */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => simulateHeartbeat(agent.id)}
                      disabled={isRevoked}
                      title="Kirim Sinyal Heartbeat"
                      className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition-colors disabled:opacity-40"
                    >
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span>Ping Heartbeat</span>
                    </button>

                    <button
                      onClick={() => toggleAgentOnlineOffline(agent.id)}
                      disabled={isRevoked}
                      title="Uji Putus / Sambung Jaringan"
                      className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 transition-colors disabled:opacity-40"
                    >
                      <Power className="w-3 h-3 text-amber-400" />
                      <span>{isOnline ? 'Set Offline' : 'Set Online'}</span>
                    </button>
                  </div>

                  {!isRevoked && (
                    <button
                      onClick={() => {
                        if (confirm(`Cabut izin kredensial untuk agent "${agent.name}"? Semua tunnel terkait akan diputus.`)) {
                          revokeAgent(agent.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                      title="Cabut Kredensial Agent (Revoke)"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FRP Configuration Guide Accordion */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowConfigDrawer(!showConfigDrawer)}
          className="w-full p-4 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Format Konfigurasi FRP Client (frpc.toml) Spesifikasi Aksester</span>
          </span>
          {showConfigDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showConfigDrawer && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <p className="text-slate-400 font-sans text-xs mb-2">
              Agent Aksester secara otomatis menghasilkan dan mengawasi file konfigurasi FRP Client
              berikut secara aman:
            </p>
            <pre className="p-3 bg-slate-900 rounded-lg overflow-x-auto text-[11px] text-cyan-300 border border-slate-800">
{`# Aksester FRP Client Configuration (Auto-managed)
serverAddr = "gateway.aksester.us"
serverPort = 7000

# Kredensial unik per agent (Hash Token)
auth.method = "token"
auth.token = "akst_agent_auth_secret_hash..."

transport.tls.enable = true
transport.heartbeatInterval = 30
transport.heartbeatTimeout = 90

# Enforce Loopback Strict (PRD 6.3)
# Semua proxy diarahkan ke loopback mesin agent
[[proxies]]
name = "web_tokosaya"
type = "http"
localIP = "127.0.0.1"
localPort = 3000
customDomains = ["tokosaya.aksester.us"]`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
