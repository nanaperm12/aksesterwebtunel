import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Server, Copy, Check, Terminal, Clock, ShieldCheck, Play } from 'lucide-react';
import { AgentPlatform } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAgentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { quotaUsage, currentPlan, generateEnrollmentToken, addAgent } = useApp();

  const [platform, setPlatform] = useState<AgentPlatform>('linux');
  const [agentName, setAgentName] = useState('');
  const [tokenData, setTokenData] = useState<{ token: string; expiresAt: string } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [copied, setCopied] = useState(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const generated = generateEnrollmentToken();
      setTokenData(generated);
      setSecondsRemaining(15 * 60);
      setSimulatedSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, secondsRemaining]);

  if (!isOpen || !tokenData) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const linuxCommand = `curl -sSL https://aksester.us/install.sh | sudo bash -s -- --token "${tokenData.token}"`;
  const windowsCommand = `irm https://aksester.us/install.ps1 | iex; Register-AksesterAgent -Token "${tokenData.token}"`;

  const activeCommand = platform === 'linux' ? linuxCommand : windowsCommand;

  const handleSimulateEnrollment = () => {
    const defaultName = agentName.trim() || (platform === 'linux' ? 'Ubuntu-Server-Produksi' : 'Windows-Workstation-POS');
    addAgent(defaultName, platform);
    setSimulatedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Daftarkan Agent Baru</h3>
              <p className="text-xs text-slate-400">
                Hubungkan server atau komputer lokal dengan enrollment token sekali pakai
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

        {!quotaUsage.canCreateAgent && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
            Kuota Agent paket {currentPlan?.name} telah penuh ({quotaUsage.agentsUsed}/
            {quotaUsage.maxAgents}). Harap upgrade paket.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nama Pengenal Agent (Opsional)
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Contoh: Server-Gudang-1, Laptop-Dev"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Token Card */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Token Enrollment (Satu Kali Pakai)
              </span>
              <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Berlaku: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-md font-mono text-xs text-cyan-300 break-all select-all flex items-center justify-between">
              <span>{tokenData.token}</span>
            </div>
          </div>

          {/* OS Switcher */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pilih Sistem Operasi Target
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setPlatform('linux')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                  platform === 'linux'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🐧 Linux (systemd)</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform('windows')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                  platform === 'windows'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🪟 Windows (PowerShell)</span>
              </button>
            </div>
          </div>

          {/* CLI Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Jalankan di terminal server pelanggan
              </label>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeCommand);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Salin Perintah
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 break-all select-all">
              {activeCommand}
            </div>
          </div>

          {simulatedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Agent berhasil terdaftar dan online! Memperbarui dashboard...</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSimulateEnrollment}
              disabled={simulatedSuccess || !quotaUsage.canCreateAgent}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulasikan Agent Terhubung Langsung</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
