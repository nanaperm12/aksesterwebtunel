import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, ShieldCheck, Zap, ArrowRight, Star } from 'lucide-react';
import { PayInvoiceModal } from '../modals/PayInvoiceModal';
import { Invoice } from '../../types';

export const PlansTab: React.FC = () => {
  const { plans, currentPlan, changePlan } = useApp();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlan?.id) return;
    const inv = changePlan(planId);
    if (inv.amount > 0) {
      setSelectedInvoice(inv);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Paket Berlangganan Aksester
        </h1>
        <p className="text-sm text-slate-400">
          Pilih paket tunnel yang sesuai dengan skala aplikasi dan kebutuhan publikasi lokal Anda.
          Bisa di-upgrade atau di-downgrade kapan saja.
        </p>
      </div>

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.id === plan.id;
          const isPro = plan.code === 'pro';

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'bg-slate-900 border-2 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : isPro
                  ? 'bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {isPro && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Paling Populer
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Paket Anda Saat Ini
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                    {plan.targetAudience}
                  </p>
                </div>

                <div className="py-2 border-y border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white tabular-nums">
                      Rp {plan.priceAmount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-slate-500">/bulan</span>
                  </div>
                </div>

                {/* Quota Limits Highlights */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Web Tunnels (HTTPS)</span>
                    <span className="font-bold text-cyan-400 font-mono tabular-nums">
                      {plan.maxWebTunnels}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Port Tunnels (TCP/UDP)</span>
                    <span className="font-bold text-emerald-400 font-mono tabular-nums">
                      {plan.maxPortTunnels}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Agent Aktif</span>
                    <span className="font-bold text-blue-400 font-mono tabular-nums">
                      {plan.maxAgents}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Custom Domain</span>
                    <span className="font-bold text-indigo-400 font-mono tabular-nums">
                      {plan.maxCustomDomains > 0 ? plan.maxCustomDomains : 'Tidak ada'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Batas Bandwidth</span>
                    <span className="font-mono text-slate-300">
                      {plan.bandwidthLimitMbps} Mbps
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Fitur Paket
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : isPro
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isCurrent ? (
                    'Sedang Digunakan'
                  ) : (
                    <>
                      <span>Pilih Paket {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Invoice Modal if user changed plan */}
      <PayInvoiceModal
        invoice={selectedInvoice}
        isOpen={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
};
