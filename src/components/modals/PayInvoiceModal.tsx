import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, PaymentMethod } from '../../types';
import { X, QrCode, CreditCard, Building2, Check, Copy, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayInvoiceModal: React.FC<Props> = ({ invoice, isOpen, onClose }) => {
  const { payInvoice } = useApp();

  const [method, setMethod] = useState<PaymentMethod>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successEvent, setSuccessEvent] = useState<string | null>(null);
  const [copiedVA, setCopiedVA] = useState(false);

  if (!isOpen || !invoice) return null;

  const vaNumbers: Record<string, string> = {
    bca_va: '8219 0812 3991 2001',
    mandiri_va: '8890 8123 9912 001',
  };

  const handlePay = async () => {
    setIsProcessing(true);
    const res = await payInvoice(invoice.id, method);
    setIsProcessing(false);
    if (res.success) {
      setSuccessEvent(res.eventId);
      setTimeout(() => {
        onClose();
        setSuccessEvent(null);
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h3 className="text-base font-semibold text-white">Pembayaran Tagihan</h3>
            <p className="text-xs text-slate-400 font-mono">
              {invoice.invoiceNumber} · {invoice.planName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Box */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg mb-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total Tagihan (Integer Rupiah)</span>
            <span className="text-2xl font-bold text-white tabular-nums">
              Rp {invoice.amount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500 block">Jatuh Tempo</span>
            <span className="text-amber-400 font-medium">
              {new Date(invoice.dueAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Pilih Metode Pembayaran (Simulasi Gateway)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod('qris')}
              className={`p-3 rounded-lg border text-left transition-colors flex flex-col items-center justify-center gap-1.5 ${
                method === 'qris'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span className="text-xs font-semibold">QRIS</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('bca_va')}
              className={`p-3 rounded-lg border text-left transition-colors flex flex-col items-center justify-center gap-1.5 ${
                method === 'bca_va'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="text-xs font-semibold">BCA VA</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('mandiri_va')}
              className={`p-3 rounded-lg border text-left transition-colors flex flex-col items-center justify-center gap-1.5 ${
                method === 'mandiri_va'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-semibold">Mandiri VA</span>
            </button>
          </div>
        </div>

        {/* Content per method */}
        {method === 'qris' && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-3 mb-4">
            <div className="inline-block p-3 bg-white rounded-lg">
              {/* Clean simulated QR code pattern */}
              <div className="w-36 h-36 bg-slate-950 p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white" />
                  </div>
                  <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white" />
                  </div>
                </div>
                <div className="flex justify-center items-center text-[9px] text-white font-mono">
                  AKSESTER-QRIS
                </div>
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white" />
                  </div>
                  <div className="w-8 h-8 bg-cyan-400" />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Pindai QRIS menggunakan BCA Mobile, GoPay, OVO, Dana, atau Livin'
            </p>
          </div>
        )}

        {(method === 'bca_va' || method === 'mandiri_va') && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 mb-4">
            <span className="text-xs text-slate-400 block">Nomor Virtual Account</span>
            <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-sm text-cyan-400 font-bold">
              <span>{vaNumbers[method]}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(vaNumbers[method].replace(/\s/g, ''));
                  setCopiedVA(true);
                  setTimeout(() => setCopiedVA(false), 2000);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-sans font-normal"
              >
                {copiedVA ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin VA
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Transfer dapat dilakukan melalui ATM, m-Banking, atau Internet Banking.
            </p>
          </div>
        )}

        {successEvent && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2 mb-4">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>
              Webhook tervalidasi! Tagihan lunas & layanan aktif. Event ID: {successEvent}
            </span>
          </div>
        )}

        {/* Security & Webhook info */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-lg mb-4 text-[11px] text-slate-500 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <span>
            Sesuai PRD 11.2 & 11.3: Webhook payment gateway diverifikasi secara kriptografis (HMAC
            SHA-256), idempotent (anti duplikasi), dan mengaktifkan/meresume tunnel otomatis.
          </span>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing || successEvent !== null}
            className="px-4 py-2 text-xs font-medium bg-emerald-500 text-slate-950 font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Webhook...</span>
              </>
            ) : (
              <>
                <span>Simulasikan Bayar Lunas</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
