import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDomain } from '../../types';
import {
  Globe2,
  Plus,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  onOpenAdd: () => void;
}

export const CustomDomainsTab: React.FC<Props> = ({ onOpenAdd }) => {
  const {
    currentUser,
    customDomains,
    tunnels,
    quotaUsage,
    currentPlan,
    verifyCustomDomainDns,
    deleteCustomDomain,
  } = useApp();

  const userDomains = customDomains.filter((d) => d.userId === currentUser.id);

  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(
    userDomains[0]?.id || null
  );
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [copiedCnameId, setCopiedCnameId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerify = async (domainId: string) => {
    setVerifyingId(domainId);
    await verifyCustomDomainDns(domainId);
    setVerifyingId(null);
  };

  const handleDelete = (domainId: string, hostname: string) => {
    if (confirm(`Hapus custom domain "${hostname}"? Konfigurasi routing akan segera dicabut dari gateway Caddy.`)) {
      deleteCustomDomain(domainId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-indigo-400" />
            <span>Custom Domains (Domain Sendiri)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gunakan domain atau subdomain milik Anda sendiri (contoh: <code>app.tokosaya.com</code>)
            dengan auto-TLS ACME (Let's Encrypt / ZeroSSL)
          </p>
        </div>

        <button
          onClick={onOpenAdd}
          disabled={!quotaUsage.canCreateCustomDomain}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Custom Domain</span>
        </button>
      </div>

      {/* Quota reminder if free plan */}
      {(!currentPlan || currentPlan.maxCustomDomains === 0) && (
        <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Paket <strong>{currentPlan?.name || 'Free Starter'}</strong> tidak menyertakan fitur Custom Domain.
              Upgrade ke paket Basic, Pro, atau Business untuk menautkan domain sendiri.
            </span>
          </div>
        </div>
      )}

      {/* Domains list */}
      <div className="space-y-4">
        {userDomains.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <Globe2 className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">Belum ada custom domain</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Anda dapat mengarahkan domain pelanggan ke Web Tunnel menggunakan verifikasi DNS TXT
              dan CNAME.
            </p>
            {quotaUsage.canCreateCustomDomain && (
              <button
                onClick={onOpenAdd}
                className="mt-2 px-4 py-2 text-xs font-semibold bg-indigo-500 text-slate-950 rounded-lg hover:bg-indigo-400"
              >
                Tambah Domain Sekarang
              </button>
            )}
          </div>
        ) : (
          userDomains.map((domain) => {
            const tunnel = tunnels.find((t) => t.id === domain.tunnelId);
            const isExpanded = expandedDomainId === domain.id;
            const isVerifying = verifyingId === domain.id;

            return (
              <div
                key={domain.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden"
              >
                {/* Main Domain Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold text-white font-mono">
                        {domain.hostname}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          domain.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : domain.status === 'pending_verification' || isVerifying
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isVerifying ? 'Memverifikasi DNS...' : domain.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Terhubung ke Web Tunnel:</span>
                      <span className="text-cyan-400 font-semibold font-mono">
                        {tunnel ? `${tunnel.name} (${tunnel.subdomain}.aksester.us)` : 'Tunnel Terhapus'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleVerify(domain.id)}
                      disabled={isVerifying}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-cyan-400' : ''}`} />
                      <span>Periksa DNS</span>
                    </button>

                    <button
                      onClick={() => setExpandedDomainId(isExpanded ? null : domain.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Instruksi DNS</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDelete(domain.id, domain.hostname)}
                      title="Hapus Domain"
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded DNS Instructions according to PRD Section 7.2 */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        Konfigurasi DNS Provider (Cloudflare, Niagahoster, Rumahweb, Route53, dll.)
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        PRD 7.2 Custom Domain Flow
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      {/* Step 1: TXT Verification Record */}
                      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span className="font-semibold text-cyan-400">
                            1. RECORD TXT (Verifikasi Kepemilikan)
                          </span>
                          <span>TTL: Auto / 300</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-200 text-xs">
                          <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                            <span className="text-[10px] text-slate-500 block uppercase">Name / Host</span>
                            <span className="text-slate-300">_aksester-verify.{domain.hostname}</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between">
                            <div className="truncate pr-2">
                              <span className="text-[10px] text-slate-500 block uppercase">Value / Content</span>
                              <span className="text-cyan-300">{domain.verificationToken}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(domain.verificationToken);
                                setCopiedTokenId(domain.id);
                                setTimeout(() => setCopiedTokenId(null), 2000);
                              }}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              {copiedTokenId === domain.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: CNAME Routing Record */}
                      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span className="font-semibold text-indigo-400">
                            2. RECORD CNAME (Mengarahkan Trafik ke Gateway)
                          </span>
                          <span>TTL: Auto / 300</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-200 text-xs">
                          <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                            <span className="text-[10px] text-slate-500 block uppercase">Name / Host</span>
                            <span className="text-slate-300">{domain.hostname}</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Target / Value</span>
                              <span className="text-indigo-300">cname.aksester.us</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText('cname.aksester.us');
                                setCopiedCnameId(domain.id);
                                setTimeout(() => setCopiedCnameId(null), 2000);
                              }}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              {copiedCnameId === domain.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Sertifikat TLS otomatis diterbitkan oleh Caddy setelah verifikasi TXT sukses.
                      </span>
                      <button
                        onClick={() => handleVerify(domain.id)}
                        disabled={isVerifying}
                        className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                      >
                        {isVerifying ? 'Sedang Memeriksa...' : 'Verifikasi DNS Sekarang'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
