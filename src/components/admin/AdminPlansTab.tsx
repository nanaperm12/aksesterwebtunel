import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plan } from '../../types';
import { Sliders, Edit2, Check, X, ShieldCheck } from 'lucide-react';

export const AdminPlansTab: React.FC = () => {
  const { plans, updatePlanAdmin } = useApp();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [maxWeb, setMaxWeb] = useState('1');
  const [maxPort, setMaxPort] = useState('1');
  const [maxAgents, setMaxAgents] = useState('1');
  const [maxCustomDomains, setMaxCustomDomains] = useState('0');
  const [bandwidthMbps, setBandwidthMbps] = useState('10');
  const [isActive, setIsActive] = useState(true);

  const handleStartEdit = (p: Plan) => {
    setEditingPlan(p);
    setName(p.name);
    setPrice(p.priceAmount.toString());
    setMaxWeb(p.maxWebTunnels.toString());
    setMaxPort(p.maxPortTunnels.toString());
    setMaxAgents(p.maxAgents.toString());
    setMaxCustomDomains(p.maxCustomDomains.toString());
    setBandwidthMbps((p.bandwidthLimitMbps || 10).toString());
    setIsActive(p.isActive);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const updated: Plan = {
      ...editingPlan,
      name: name.trim() || editingPlan.name,
      priceAmount: Math.max(0, parseInt(price, 10) || 0),
      maxWebTunnels: Math.max(1, parseInt(maxWeb, 10) || 1),
      maxPortTunnels: Math.max(0, parseInt(maxPort, 10) || 0),
      maxAgents: Math.max(1, parseInt(maxAgents, 10) || 1),
      maxCustomDomains: Math.max(0, parseInt(maxCustomDomains, 10) || 0),
      bandwidthLimitMbps: Math.max(1, parseInt(bandwidthMbps, 10) || 10),
      isActive,
    };

    updatePlanAdmin(updated);
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <span>Konfigurasi Paket & Kuota Sistem</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Konfigurasi database paket langganan secara dinamis tanpa hardcode pada frontend sesuai PRD
            5.2
          </p>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Paket & Kode</th>
                <th className="py-3 px-4">Harga Bulanan (IDR)</th>
                <th className="py-3 px-4">Web Tunnels</th>
                <th className="py-3 px-4">Port Tunnels</th>
                <th className="py-3 px-4">Max Agents</th>
                <th className="py-3 px-4">Custom Domains</th>
                <th className="py-3 px-4">Bandwidth</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{p.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">{p.code}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100 tabular-nums">
                    Rp {p.priceAmount.toLocaleString('id-ID')}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold tabular-nums">
                    {p.maxWebTunnels}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold tabular-nums">
                    {p.maxPortTunnels}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-blue-400 font-bold tabular-nums">
                    {p.maxAgents}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-indigo-400 font-bold tabular-nums">
                    {p.maxCustomDomains}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {p.bandwidthLimitMbps} Mbps
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-mono ${
                        p.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {p.isActive ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors inline-flex items-center gap-1 font-medium"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Ubah Kuota</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">
                Edit Konfigurasi Paket: {editingPlan.name}
              </h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nama Paket</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Harga Bulanan (Integer Rupiah)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Web Tunnels</label>
                  <input
                    type="number"
                    value={maxWeb}
                    onChange={(e) => setMaxWeb(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Port Tunnels</label>
                  <input
                    type="number"
                    value={maxPort}
                    onChange={(e) => setMaxPort(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Agents</label>
                  <input
                    type="number"
                    value={maxAgents}
                    onChange={(e) => setMaxAgents(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Custom Domains</label>
                  <input
                    type="number"
                    value={maxCustomDomains}
                    onChange={(e) => setMaxCustomDomains(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    value={bandwidthMbps}
                    onChange={(e) => setBandwidthMbps(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="isActiveToggle" className="text-slate-300">
                  Paket aktif dan dapat dipilih oleh pelanggan
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400"
                >
                  Simpan ke Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
