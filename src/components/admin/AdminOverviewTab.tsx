import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CreditCard,
  Globe,
  Network,
  Cpu,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export const AdminOverviewTab: React.FC = () => {
  const { allUsers, subscriptions, plans, tunnels, jobs, setActiveAdminTab } = useApp();

  const totalUsers = allUsers.length;
  const activeSubs = subscriptions.filter((s) => s.status === 'active').length;

  // Calculate MRR
  const mrr = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, sub) => {
      const plan = plans.find((p) => p.id === sub.planId);
      return sum + (plan?.priceAmount || 0);
    }, 0);

  const webTunnelsCount = tunnels.filter((t) => t.type === 'web' && t.status === 'active').length;
  const portTunnelsCount = tunnels.filter((t) => t.type === 'port' && t.status === 'active').length;
  const failedJobsCount = jobs.filter((j) => j.status === 'failed').length;

  // Gateway port utilization: range 2000 - 2099 (100 ports)
  const portUtilization = Math.round((portTunnelsCount / 100) * 100);

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded uppercase">
              Control Plane
            </span>
            <span className="text-xs text-slate-400">PRD Seksi 10 Dashboard Admin</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Overview Sistem & Gateway Aksester
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pusat pemantauan infrastruktur, gateway multi-tenant, billing subscription, dan alokasi port
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveAdminTab('admin_jobs')}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Worker Queue ({jobs.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-cyan-400" />
              Total Pelanggan
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Tenant</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{totalUsers}</div>
          <p className="text-[11px] text-slate-500">{activeSubs} langganan aktif</p>
        </div>

        {/* MRR */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              MRR (Monthly Recurring)
            </span>
            <span className="text-slate-500 font-mono text-[11px]">IDR</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums">
            Rp {mrr.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500">Dari langganan bulanan</p>
        </div>

        {/* Active Web & Port Tunnels */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="w-4 h-4 text-cyan-400" />
              Tunnel Berjalan
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Live</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {webTunnelsCount + portTunnelsCount}
          </div>
          <p className="text-[11px] text-slate-500">
            {webTunnelsCount} Web (HTTP) · {portTunnelsCount} Port (TCP/UDP)
          </p>
        </div>

        {/* Port Capacity */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Network className="w-4 h-4 text-indigo-400" />
              Kapasitas Port Gateway
            </span>
            <span className="text-slate-500 font-mono text-[11px]">2000-2099</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {portTunnelsCount} / 100
          </div>
          <p className="text-[11px] text-slate-500">{portUtilization}% teralokasi</p>
        </div>
      </div>

      {/* Gateway Infrastructure Health Matrix */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">Status Komponen Infrastruktur MVP (PRD 6 & 17)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Caddy Reverse Proxy</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Nominal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Port 80/443 · ACME TLS Auto · SNI Host Routing Aktif
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">FRP Server (frps)</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Nominal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Port 7000 (TLS Auth) · Internal Loopback Enforced
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">SQLite Database</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Nominal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              WAL Mode ON · Foreign Keys = ON · Busy Timeout 5000ms
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Provisioning Worker</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Idle / Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Queue: {jobs.length} jobs · {failedJobsCount} failed
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation to Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveAdminTab('admin_users')}
          className="p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between text-white font-semibold text-sm">
            <span>Manajemen Pengguna</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400">
            Lihat daftar tenant, kelola role, dan lakukan suspend/resume akun dengan audit trail.
          </p>
        </div>

        <div
          onClick={() => setActiveAdminTab('admin_plans')}
          className="p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between text-white font-semibold text-sm">
            <span>Konfigurasi Paket & Kuota</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400">
            Ubah harga IDR, batas Web Tunnel, Port Tunnel, dan kuota agent langsung dari database.
          </p>
        </div>

        <div
          onClick={() => setActiveAdminTab('admin_ports')}
          className="p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between text-white font-semibold text-sm">
            <span>Peta Alokasi Port Gateway</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400">
            Pantau slot port publik 2000-2099 dan cegah benturan port antar-tenant secara atomik.
          </p>
        </div>
      </div>
    </div>
  );
};
