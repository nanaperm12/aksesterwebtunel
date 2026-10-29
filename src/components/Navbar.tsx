import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, User as UserIcon, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    allUsers,
    isCustomerView,
    setIsCustomerView,
    activeCustomerTab,
    setActiveCustomerTab,
    activeAdminTab,
    setActiveAdminTab,
    resetDemoData,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (isCustomerView) setActiveCustomerTab('overview');
              else setActiveAdminTab('admin_overview');
            }}
            className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm font-bold">
              A
            </span>
            <span>Aksester</span>
          </a>
        </div>

        {/* Zone 2: Navigation Links (4-5 single-line clean text links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          {isCustomerView ? (
            <>
              <button
                onClick={() => setActiveCustomerTab('overview')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeCustomerTab === 'overview'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Ringkasan
              </button>
              <button
                onClick={() => setActiveCustomerTab('web_tunnels')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeCustomerTab === 'web_tunnels'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Web Tunnels
              </button>
              <button
                onClick={() => setActiveCustomerTab('port_tunnels')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeCustomerTab === 'port_tunnels'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Port Tunnels
              </button>
              <button
                onClick={() => setActiveCustomerTab('custom_domains')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeCustomerTab === 'custom_domains'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Custom Domain
              </button>
              <button
                onClick={() => setActiveCustomerTab('agents')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeCustomerTab === 'agents'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Agents
              </button>
              <button
                onClick={() => setActiveCustomerTab('plans')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeCustomerTab === 'plans'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Paket
              </button>
              <button
                onClick={() => setActiveCustomerTab('invoices')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeCustomerTab === 'invoices'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Tagihan
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveAdminTab('admin_overview')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeAdminTab === 'admin_overview'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveAdminTab('admin_users')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeAdminTab === 'admin_users'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Pengguna
              </button>
              <button
                onClick={() => setActiveAdminTab('admin_plans')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeAdminTab === 'admin_plans'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Kelola Paket
              </button>
              <button
                onClick={() => setActiveAdminTab('admin_jobs')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeAdminTab === 'admin_jobs'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Provisioning
              </button>
              <button
                onClick={() => setActiveAdminTab('admin_ports')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeAdminTab === 'admin_ports'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Alokasi Port
              </button>
              <button
                onClick={() => setActiveAdminTab('admin_audit')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
                  activeAdminTab === 'admin_audit'
                    ? 'text-white font-semibold underline underline-offset-8 decoration-cyan-400'
                    : ''
                }`}
              >
                Audit Log
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action / Mode Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* User selector dropdown */}
          <div className="relative">
            <select
              aria-label="Pilih akun pengguna"
              value={currentUser.id}
              onChange={(e) => {
                const target = allUsers.find((u) => u.id === e.target.value);
                if (target) {
                  setCurrentUser(target);
                  if (target.role === 'admin' && isCustomerView) {
                    setIsCustomerView(false);
                  } else if (target.role === 'customer' && !isCustomerView) {
                    setIsCustomerView(true);
                  }
                }
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'admin' ? 'Admin' : 'Customer'})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Role View Button */}
          <button
            onClick={() => setIsCustomerView(!isCustomerView)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 border ${
              isCustomerView
                ? 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-600'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/20'
            }`}
          >
            {isCustomerView ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Buka Panel Admin</span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Ke Portal Pelanggan</span>
              </>
            )}
          </button>

          {/* Quick Demo Reset */}
          <button
            onClick={resetDemoData}
            title="Reset Data Demo"
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-900"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
