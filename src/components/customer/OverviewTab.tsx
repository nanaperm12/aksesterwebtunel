import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Network,
  Server,
  Globe2,
  ArrowUpRight,
  Plus,
  Receipt,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  onOpenCreateWeb: () => void;
  onOpenCreatePort: () => void;
  onOpenAddAgent: () => void;
}

export const OverviewTab: React.FC<Props> = ({
  onOpenCreateWeb,
  onOpenCreatePort,
  onOpenAddAgent,
}) => {
  const {
    currentUser,
    currentPlan,
    currentSubscription,
    quotaUsage,
    tunnels,
    agents,
    invoices,
    auditLogs,
    setActiveCustomerTab,
  } = useApp();

  const userTunnels = tunnels.filter((t) => t.userId === currentUser.id);
  const activeTunnels = userTunnels.filter((t) => t.status === 'active').length;
  const userAgents = agents.filter(
    (a) => a.userId === currentUser.id && a.status !== 'revoked'
  );
  const onlineAgents = userAgents.filter((a) => a.status === 'online').length;
  const unpaidInvoices = invoices.filter(
    (i) => i.userId === currentUser.id && i.status === 'unpaid'
  );

  const userActivities = auditLogs
    .filter((log) => log.actorUserId === currentUser.id)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome & Plan Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Selamat datang, {currentUser.name}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {currentUser.companyName || 'Organisasi'} · Paket Aktif:{' '}
            <span className="font-semibold text-cyan-400">{currentPlan?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveCustomerTab('plans')}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Ubah Paket</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={onOpenCreateWeb}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Web Tunnel Baru</span>
          </button>
        </div>
      </div>

      {/* Unpaid Invoice Alert Banner (if any) */}
      {unpaidInvoices.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-sm text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold">Ada tagihan menunggu pembayaran: </span>
              <span>
                {unpaidInvoices[0].invoiceNumber} (Rp{' '}
                {unpaidInvoices[0].amount.toLocaleString('id-ID')}) jatuh tempo{' '}
                {new Date(unpaidInvoices[0].dueAt).toLocaleDateString('id-ID')}.
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveCustomerTab('invoices')}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Bayar Sekarang
          </button>
        </div>
      )}

      {/* 4 Quota Usage Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Web Tunnels Quota */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="w-4 h-4 text-cyan-400" />
              Web Tunnels (HTTPS)
            </span>
            <span className="font-mono text-slate-200 tabular-nums">
              {quotaUsage.webTunnelsUsed} / {quotaUsage.maxWebTunnels}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaUsage.webTunnelsUsed >= quotaUsage.maxWebTunnels
                  ? 'bg-amber-400'
                  : 'bg-cyan-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (quotaUsage.webTunnelsUsed / Math.max(1, quotaUsage.maxWebTunnels)) * 100
                )}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {quotaUsage.canCreateWebTunnel
              ? `Tersisa ${quotaUsage.maxWebTunnels - quotaUsage.webTunnelsUsed} slot tunnel`
              : 'Batas kuota tercapai'}
          </p>
        </div>

        {/* Port Tunnels Quota */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Network className="w-4 h-4 text-emerald-400" />
              Port Tunnels (TCP/UDP)
            </span>
            <span className="font-mono text-slate-200 tabular-nums">
              {quotaUsage.portTunnelsUsed} / {quotaUsage.maxPortTunnels}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaUsage.portTunnelsUsed >= quotaUsage.maxPortTunnels
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (quotaUsage.portTunnelsUsed / Math.max(1, quotaUsage.maxPortTunnels)) * 100
                )}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {quotaUsage.canCreatePortTunnel
              ? `Tersisa ${quotaUsage.maxPortTunnels - quotaUsage.portTunnelsUsed} port publik`
              : 'Batas kuota tercapai'}
          </p>
        </div>

        {/* Agents Quota */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Server className="w-4 h-4 text-blue-400" />
              Agents Terdaftar
            </span>
            <span className="font-mono text-slate-200 tabular-nums">
              {quotaUsage.agentsUsed} / {quotaUsage.maxAgents}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaUsage.agentsUsed >= quotaUsage.maxAgents ? 'bg-amber-400' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (quotaUsage.agentsUsed / Math.max(1, quotaUsage.maxAgents)) * 100
                )}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {onlineAgents} online dari {userAgents.length} agent
          </p>
        </div>

        {/* Custom Domains Quota */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe2 className="w-4 h-4 text-indigo-400" />
              Custom Domains
            </span>
            <span className="font-mono text-slate-200 tabular-nums">
              {quotaUsage.customDomainsUsed} / {quotaUsage.maxCustomDomains}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaUsage.customDomainsUsed >= quotaUsage.maxCustomDomains &&
                quotaUsage.maxCustomDomains > 0
                  ? 'bg-amber-400'
                  : 'bg-indigo-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (quotaUsage.customDomainsUsed / Math.max(1, quotaUsage.maxCustomDomains)) * 100
                )}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {quotaUsage.maxCustomDomains > 0
              ? `Tersisa ${quotaUsage.maxCustomDomains - quotaUsage.customDomainsUsed} domain`
              : 'Perlu paket Basic ke atas'}
          </p>
        </div>
      </div>

      {/* Main Grid: Status Summary & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tunnels Quick Glance */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Tunnel yang Sedang Berjalan</h2>
            <button
              onClick={() => setActiveCustomerTab('web_tunnels')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Lihat Semua ({userTunnels.length})
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
            {userTunnels.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Belum ada tunnel yang dibuat.{' '}
                <button
                  onClick={onOpenCreateWeb}
                  className="text-cyan-400 hover:underline font-medium"
                >
                  Buat Web Tunnel pertama Anda
                </button>
                .
              </div>
            ) : (
              userTunnels.slice(0, 4).map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-900/80 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">{t.name}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {t.type === 'web' ? 'Web (HTTP/S)' : `Port (${t.protocol.toUpperCase()})`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                      {t.type === 'web' ? (
                        <span>https://{t.subdomain}.aksester.us</span>
                      ) : (
                        <span>aksester.us:{t.publicPort}</span>
                      )}
                      <span className="text-slate-600">➔</span>
                      <span className="text-slate-400">
                        {t.localHost}:{t.localPort}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium flex items-center gap-1.5 ${
                        t.status === 'active'
                          ? 'text-emerald-400'
                          : t.status === 'suspended'
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          t.status === 'active'
                            ? 'bg-emerald-400'
                            : t.status === 'suspended'
                            ? 'bg-rose-400'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="capitalize">{t.status}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Architecture Reminder banner from PRD Section 6 */}
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-start gap-3 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">
                Arsitektur Gateway & Keamanan Aksester (PRD 6.2 & 6.3):
              </span>
              <p className="mt-0.5 text-slate-400 leading-relaxed">
                Agent membuat koneksi keluar (outbound) ke FRP Gateway. Anda tidak perlu membuka port
                masuk (inbound) pada router pelanggan. Target tunnel dibatasi secara ketat ke{' '}
                <code className="text-cyan-300">127.0.0.1 (Loopback)</code> untuk mencegah SSRF.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Recent Activities */}
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-white">Aksi Cepat</h3>
            <div className="space-y-2">
              <button
                onClick={onOpenCreateWeb}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Buat Web Tunnel Baru
                </span>
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenCreatePort}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-400" />
                  Buat Port Tunnel TCP/UDP
                </span>
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenAddAgent}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  Daftarkan Agent Baru
                </span>
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveCustomerTab('invoices')}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-400" />
                  Riwayat Tagihan & Invoice
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Recent Audit Log */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Aktivitas Terakhir</h3>
              <button
                onClick={() => setActiveCustomerTab('activity')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Lihat Log
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {userActivities.map((act) => (
                <div key={act.id} className="space-y-0.5 border-b border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{act.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {act.metadataRedacted || act.resourceId}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
