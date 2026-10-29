import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { Receipt, CreditCard, CheckCircle2, Clock, FileText, ArrowRight, X } from 'lucide-react';
import { PayInvoiceModal } from '../modals/PayInvoiceModal';

export const InvoicesTab: React.FC = () => {
  const { currentUser, invoices } = useApp();
  const userInvoices = invoices.filter((i) => i.userId === currentUser.id);

  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-400" />
            <span>Tagihan & Invoice Pelanggan</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Riwayat tagihan langganan paket Aksester, status pembayaran, dan kwitansi resmi
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Deskripsi Layanan</th>
                <th className="py-3 px-4">Nominal (IDR)</th>
                <th className="py-3 px-4">Tanggal Jatuh Tempo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {userInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Belum ada riwayat invoice.
                  </td>
                </tr>
              ) : (
                userInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {inv.planName}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100 tabular-nums">
                      Rp {inv.amount.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(inv.dueAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      {inv.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lunas</span>
                        </span>
                      ) : inv.status === 'unpaid' ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Belum Bayar</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-medium">{inv.status}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {inv.status === 'unpaid' ? (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 text-xs transition-colors"
                        >
                          Bayar Sekarang
                        </button>
                      ) : (
                        <button
                          onClick={() => setReceiptInvoice(inv)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Kwitansi</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      <PayInvoiceModal
        invoice={payingInvoice}
        isOpen={payingInvoice !== null}
        onClose={() => setPayingInvoice(null)}
      />

      {/* Official Receipt Preview Modal */}
      {receiptInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Kwitansi Pembayaran Resmi</h3>
              </div>
              <button
                onClick={() => setReceiptInvoice(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Nomor Invoice</span>
                <span className="font-mono font-bold text-slate-200">{receiptInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Pelanggan</span>
                <span className="text-slate-200">{currentUser.name} ({currentUser.companyName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Deskripsi Paket</span>
                <span className="text-slate-200">{receiptInvoice.planName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Jumlah Dibayar</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  Rp {receiptInvoice.amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Status Gateway</span>
                <span className="text-emerald-400 font-semibold uppercase">Lunas (Settlement)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Waktu Pembayaran</span>
                <span className="font-mono text-slate-300">
                  {receiptInvoice.paidAt
                    ? new Date(receiptInvoice.paidAt).toLocaleString('id-ID')
                    : '-'}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setReceiptInvoice(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
