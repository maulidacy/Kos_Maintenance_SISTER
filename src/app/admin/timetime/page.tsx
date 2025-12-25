'use client';

import { useEffect, useState } from 'react';

function diffMinutes(a?: string | null, b?: string | null) {
  if (!a || !b) return null;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

export default function AdminTimetimePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/admin/timetime');
      const data = await res.json();
      setReports(data.reports || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Report Timetime
        </p>
        <h1 className="text-xl font-semibold text-slate-50">Durasi Respon & Perbaikan</h1>
        <p className="text-xs text-slate-400">
          Menghitung waktu berdasarkan timestamp: created → received → started → resolved
        </p>
      </header>

      {loading ? (
        <p className="text-xs text-slate-400">Memuat data...</p>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Response (menit)</th>
                <th className="px-4 py-3">Repair (menit)</th>
                <th className="px-4 py-3">Total (menit)</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const response = diffMinutes(r.createdAt, r.receivedAt);
                const repair = diffMinutes(r.startedAt, r.resolvedAt);
                const total = diffMinutes(r.createdAt, r.resolvedAt);

                return (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-slate-900/60">
                    <td className="px-4 py-3 text-sm text-slate-100">{r.judul}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{r.status}</td>
                    <td className="px-4 py-3 text-xs text-emerald-200">{response ?? '-'}</td>
                    <td className="px-4 py-3 text-xs text-emerald-200">{repair ?? '-'}</td>
                    <td className="px-4 py-3 text-xs text-emerald-200">{total ?? '-'}</td>
                  </tr>
                );
              })}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
