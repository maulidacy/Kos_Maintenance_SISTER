// src/app/admin/stats/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Stats = {
  perStatus: Record<string, number>;
  perHari: { day: string; total: number }[];
  mode: string;
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [mode, setMode] = useState<'weak' | 'strong'>('weak');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/stats?mode=${mode}`);
      const data = await res.json();
      setStats(data);
      setLoading(false);
    }
    load();
  }, [mode]);

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Statistik Laporan
        </p>
        <h1 className="text-xl font-semibold text-slate-50">Statistik Sistem</h1>
        <p className="text-xs text-slate-400">
          Menggunakan mode konsistensi: {mode === 'weak' ? 'Weak (Replica)' : 'Strong (Primary)'}
        </p>
      </header>

      {/* SWITCH MODE */}
      <div className="inline-flex rounded-full border border-white/10 bg-slate-900/70 p-1 text-xs text-slate-200">
        <button
          onClick={() => setMode('weak')}
          className={`px-3 py-1 rounded-full transition ${
            mode === 'weak'
              ? 'bg-emerald-500 text-slate-900'
              : 'hover:bg-slate-800/80'
          }`}
        >
          Weak (Replica)
        </button>
        <button
          onClick={() => setMode('strong')}
          className={`px-3 py-1 rounded-full transition ${
            mode === 'strong'
              ? 'bg-emerald-500 text-slate-900'
              : 'hover:bg-slate-800/80'
          }`}
        >
          Strong (Primary)
        </button>
      </div>

      {/* STATISTIK PER STATUS */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats &&
          Object.entries(stats.perStatus).map(([status, total]) => (
            <div
              key={status}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-black/30"
            >
              <p className="text-xs font-semibold text-slate-400">
                {status}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-50">
                {total}
              </p>
            </div>
          ))}
      </div>

      {/* STATISTIK PER HARI */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-black/40">
        <h3 className="text-sm font-semibold text-slate-300">
          Jumlah Laporan 7 Hari Terakhir
        </h3>

        {loading && (
          <p className="text-xs text-slate-500 mt-2">Memuat data…</p>
        )}

        {!loading && stats?.perHari?.length === 0 && (
          <p className="text-xs text-slate-500 mt-2">
            Belum ada laporan minggu ini.
          </p>
        )}

        <div className="mt-4 space-y-3">
          {stats?.perHari?.map((d) => (
            <div
              key={d.day}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2"
            >
              <span className="text-xs text-slate-300">{d.day}</span>
              <span className="text-sm font-semibold text-emerald-300">
                {d.total}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
