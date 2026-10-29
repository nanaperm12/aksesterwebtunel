import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PrdModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const prdDownloadUrl = '/PRD.md';

  const handleCopyPrd = async () => {
    try {
      const res = await fetch(prdDownloadUrl);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Dokumen PRD: Aksester SaaS Web & Port Tunnel
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                PRD_Aksester_52770abc.md · Versi 1.0 (MVP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPrd}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks PRD</span>
                </>
              )}
            </button>

            <a
              href={prdDownloadUrl}
              download="PRD_Aksester_v1.0.md"
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File .MD</span>
            </a>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-sm font-bold text-white">Ringkasan Dokumen Produk</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Produk</span>
                <span className="text-cyan-400 font-bold">Aksester</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Versi</span>
                <span className="text-slate-200">1.0 (MVP)</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Arsitektur</span>
                <span className="text-slate-200">Linux + Caddy + FRP</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Database</span>
                <span className="text-slate-200">SQLite (WAL Mode)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <section className="space-y-1">
              <h4 className="text-sm font-bold text-white">1. Ringkasan Produk</h4>
              <p className="text-slate-400">
                Aksester adalah platform SaaS yang memungkinkan pelanggan mempublikasikan layanan yang berjalan
                pada komputer atau server milik mereka melalui internet, tanpa harus membuka port masuk (inbound)
                pada jaringan lokal pelanggan.
              </p>
              <p className="text-slate-400">
                Menyediakan 2 layanan utama: <strong>Web Tunnel</strong> (HTTP/HTTPS via <code>slug.aksester.us</code> atau custom domain)
                dan <strong>Port Tunnel</strong> (penerusan TCP/UDP via port teralokasi seperti <code>aksester.us:2006</code>).
              </p>
            </section>

            <section className="space-y-1">
              <h4 className="text-sm font-bold text-white">2. Ruang Lingkup & Fitur Utama</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong>Web Tunnel:</strong> Loopback targeting ketat ke <code>127.0.0.1</code>, auto-TLS Caddy, slug availability check real-time.</li>
                <li><strong>Port Tunnel:</strong> Alokasi port publik atomik pada rentang gateway 2000–2099 tanpa konflik, dukungan TCP utama & UDP terisolasi.</li>
                <li><strong>Custom Domain:</strong> Verifikasi kepemilikan via TXT record token acak dan CNAME ke <code>cname.aksester.us</code>.</li>
                <li><strong>Agent:</strong> Daemon Windows & Linux dengan token enrollment 1 kali pakai (expiry 15 menit), heartbeat berkala, dan penarikan izin (*revoke*).</li>
                <li><strong>Billing & Invoices:</strong> Nominal integer Rupiah, siklus langganan, webhook gateway idempotent dengan validasi signature HMAC SHA-256.</li>
                <li><strong>Admin Console:</strong> Kontrol suspend/resume tenant dengan audit log wajib, pengaturan kuota paket dinamis, dan peta alokasi port gateway.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-bold text-white">3. Struktur Model Data SQLite (PRD 13)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-cyan-400 font-bold block">users</span>
                  <span className="text-slate-500">id, email, password_hash, name, role, status</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-cyan-400 font-bold block">plans</span>
                  <span className="text-slate-500">id, code, price_amount, max_web_tunnels, max_port_tunnels...</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-cyan-400 font-bold block">tunnels</span>
                  <span className="text-slate-500">id, agent_id, type, local_host, local_port, subdomain, public_port</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-cyan-400 font-bold block">custom_domains</span>
                  <span className="text-slate-500">id, tunnel_id, hostname, verification_token, status</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-cyan-400 font-bold block">agents & tokens</span>
                  <span className="text-slate-500">id, platform, credential_hash, status, last_seen_at</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-cyan-400 font-bold block">provisioning_jobs</span>
                  <span className="text-slate-500">id, job_type, resource_id, payload_json, status, attempts</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>File sumber: <code>/public/assets/aistudio/PRD_Aksester_52770abc.md</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
