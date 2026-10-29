import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Globe,
  Network,
  Server,
  Globe2,
  Receipt,
  LayoutDashboard,
  Shield,
  Activity,
  Sliders,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    isCustomerView,
    activeCustomerTab,
    setActiveCustomerTab,
    activeAdminTab,
    setActiveAdminTab,
    quotaUsage,
    currentPlan,
    invoices,
    currentUser,
  } = useApp();

  const unpaidCount = invoices.filter(
    (i) => i.userId === currentUser.id && i.status === 'unpaid'
  ).length;

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 p-4 hidden md:flex flex-col justify-between min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        {/* Portal Role Indicator */}
        <div className="px-3 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold font-mono">
            {isCustomerView ? 'Tenant Portal' : 'Admin Operations'}
          </span>
          <span className="font-bold text-slate-200 truncate block mt-0.5">
            {isCustomerView ? currentUser.companyName || currentUser.name : 'System Administrator'}
          </span>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          {isCustomerView ? (
            <>
              <button
                onClick={() => setActiveCustomerTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeCustomerTab === 'overview'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Ringkasan</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('web_tunnels')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeCustomerTab === 'web_tunnels'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Globe className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>Web Tunnels</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {quotaUsage.webTunnelsUsed}/{quotaUsage.maxWebTunnels}
                </span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('port_tunnels')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeCustomerTab === 'port_tunnels'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Network className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Port Tunnels</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {quotaUsage.portTunnelsUsed}/{quotaUsage.maxPortTunnels}
                </span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('custom_domains')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeCustomerTab === 'custom_domains'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Globe2 className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Custom Domain</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {quotaUsage.customDomainsUsed}/{quotaUsage.maxCustomDomains}
                </span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('agents')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeCustomerTab === 'agents'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Server className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>Agents Mesin</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {quotaUsage.agentsUsed}/{quotaUsage.maxAgents}
                </span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('plans')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeCustomerTab === 'plans'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Paket & Langganan</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab('invoices')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeCustomerTab === 'invoices'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Receipt className="w-4 h-4 shrink-0 text-purple-400" />
                  <span>Tagihan & Invoice</span>
                </span>
                {unpaidCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 font-mono">
                    {unpaidCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveCustomerTab('activity')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeCustomerTab === 'activity'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Activity className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Log Aktivitas</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveAdminTab('admin_overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeAdminTab === 'admin_overview'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Overview Sistem</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('admin_users')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeAdminTab === 'admin_users'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Manajemen Pengguna</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('admin_plans')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeAdminTab === 'admin_plans'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Kelola Paket</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('admin_jobs')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeAdminTab === 'admin_jobs'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Activity className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Worker Provisioning</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('admin_ports')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeAdminTab === 'admin_ports'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Network className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>Peta Alokasi Port</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('admin_audit')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  activeAdminTab === 'admin_audit'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Audit Log Sistem</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer System Info */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between font-mono">
          <span>Gateway:</span>
          <span className="text-emerald-400 font-bold">caddy+frps v0.58</span>
        </div>
        <div className="flex items-center justify-between font-mono">
          <span>Target Host:</span>
          <span className="text-cyan-400">127.0.0.1 (Strict)</span>
        </div>
      </div>
    </aside>
  );
};
