import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProvisioningJob } from '../../types';
import {
  Activity,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Code2,
  X,
  Filter,
} from 'lucide-react';

export const AdminJobsTab: React.FC = () => {
  const { jobs, retryJob } = useApp();
  const [filterStatus, setFilterStatus] = useState('all');
  const [inspectingJob, setInspectingJob] = useState<ProvisioningJob | null>(null);

  const filteredJobs = jobs.filter((j) => {
    if (filterStatus === 'all') return true;
    return j.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Worker Queue & Provisioning Jobs</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Antrean eksekusi latar belakang untuk konfigurasi Caddy reverse proxy, alokasi FRP port,
            dan perpanjangan sertifikat TLS ACME (PRD 6.1 & 10)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            aria-label="Filter Status Job"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Completed (Sukses)</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed (Gagal)</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 font-sans">
              <tr>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Tipe Job</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Percobaan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Waktu Dibuat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    Tidak ada pekerjaan background worker.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {j.id}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-cyan-400">
                      {j.jobType}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {j.resourceType}: <span className="text-slate-400">{j.resourceId}</span>
                    </td>

                    <td className="py-3.5 px-4 tabular-nums text-slate-400">
                      {j.attempts}x
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          j.status === 'completed'
                            ? 'text-emerald-400'
                            : j.status === 'failed'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {j.status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : j.status === 'failed' ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize">{j.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-sans text-[11px]">
                      {new Date(j.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingJob(j)}
                          title="Lihat Payload JSON"
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                        </button>
                        {j.status === 'failed' && (
                          <button
                            onClick={() => retryJob(j.id)}
                            title="Retry Pekerjaan Ini"
                            className="px-2.5 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspection Modal */}
      {inspectingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Payload JSON: {inspectingJob.jobType}
                </h3>
              </div>
              <button
                onClick={() => setInspectingJob(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto max-h-64">
              <pre>{JSON.stringify(inspectingJob.payloadJson, null, 2)}</pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectingJob(null)}
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
