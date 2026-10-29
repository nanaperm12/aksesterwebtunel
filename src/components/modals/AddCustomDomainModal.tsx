import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Globe2, AlertCircle, Copy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomDomainModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    tunnels,
    quotaUsage,
    currentPlan,
    addCustomDomain,
    setActiveCustomerTab,
  } = useApp();

  const userWebTunnels = tunnels.filter(
    (t) => t.userId === currentUser.id && t.type === 'web'
  );

  const [hostname, setHostname] = useState('');
  const [tunnelId, setTunnelId] = useState(userWebTunnels[0]?.id || '');
  const [error, setError] = useState<string | null>(null);
  const [copiedTxt, setCopiedTxt] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tunnelId) {
      setError('Pilih Web Tunnel yang ingin dihubungkan');
      return;
    }

    const res = addCustomDomain(hostname, tunnelId);
    if (!res.success) {
      setError(res.error || 'Gagal menambahkan custom domain');
    } else {
      onClose();
      setHostname('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Tambah Custom Domain</h3>
              <p className="text-xs text-slate-400">
                Arahkan domain sendiri ke Web Tunnel Aksester dengan auto-TLS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {!quotaUsage.canCreateCustomDomain ? (
          <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-lg space-y-3 mb-4">
            <p className="text-xs text-amber-300">
              Paket <strong>{currentPlan?.name}</strong> saat ini mengizinkan{' '}
              {currentPlan?.maxCustomDomains} custom domain (terpakai:{' '}
              {quotaUsage.customDomainsUsed}).
            </p>
            <p className="text-xs text-slate-400">
              Dukungan Custom Domain dengan Auto-TLS ACME tersedia pada paket Basic, Pro, dan
              Business.
            </p>
            <button
              onClick={() => {
                onClose();
                setActiveCustomerTab('plans');
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Lihat Pilihan Upgrade Paket
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hostname Domain Anda
              </label>
              <input
                type="text"
                value={hostname}
                onChange={(e) => setHostname(e.target.value.toLowerCase())}
                placeholder="app.tokosaya.com atau pos.warungkita.id"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Disarankan menggunakan subdomain (contoh: <code>app.domain.com</code>) untuk CNAME
                yang lebih mudah.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hubungkan ke Web Tunnel
              </label>
              {userWebTunnels.length === 0 ? (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
                  Anda belum memiliki Web Tunnel. Buat Web Tunnel terlebih dahulu.
                </div>
              ) : (
                <select
                  aria-label="Pilih Web Tunnel"
                  value={tunnelId}
                  onChange={(e) => setTunnelId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {userWebTunnels.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subdomain}.aksester.us ➔ 127.0.0.1:{t.localPort})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* DNS Instructions preview */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block">
                Record DNS yang diperlukan nantinya:
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400">
                    CNAME {hostname || 'app.domain.com'} ➔ cname.aksester.us
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400">
                    TXT _aksester-verify.{hostname || 'app.domain.com'} ➔ [Token Unik]
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('cname.aksester.us');
                      setCopiedTxt(true);
                      setTimeout(() => setCopiedTxt(false), 2000);
                    }}
                    className="text-slate-400 hover:text-cyan-400 p-1"
                  >
                    {copiedTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={userWebTunnels.length === 0}
                className="px-4 py-2 text-xs font-medium bg-cyan-500 text-slate-950 font-semibold rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors"
              >
                Simpan & Dapatkan Token TXT
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
