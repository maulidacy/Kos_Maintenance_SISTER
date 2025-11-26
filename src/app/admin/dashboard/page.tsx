'use client';

import { useEffect, useState } from 'react';

type Report = {
  id: string;
  status: 'BARU' | 'DIPROSES' | 'DIKERJAKAN' | 'SELESAI' | 'DITOLAK';
};

type Stats = {
  total: number;
  BARU: number;
  DIPROSES: number;
  DIKERJAKAN: number;
  SELESAI: number;
  DITOLAK: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    BARU: 0,
    DIPROSES: 0,
    DIKERJAKAN: 0,
    SELESAI: 0,
    DITOLAK: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reports?admin=1&mode=strong');
        const data = await res.json();
        const reports: Report[] = data.reports || [];

        const next: Stats = {
          total: reports.length,
          BARU: 0,
          DIPROSES: 0,
          DIKERJAKAN: 0,
          SELESAI: 0,
          DITOLAK: 0,
        };

        for (const r of reports) {
          next[r.status] += 1;
        }

        setStats(next);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const cards = [
    { key: 'total', label: 'Total', value: stats.total },
    { key: 'BARU', label: 'Baru', value: stats.BARU },
    { key: 'DIPROSES', label: 'Diproses', value: stats.DIPROSES },
    { key: 'DIKERJAKAN', label: 'Dikerjakan', value: stats.DIKERJAKAN },
    { key: 'SELESAI', label: 'Selesai', value: stats.SELESAI },
    { key: 'DITOLAK', label: 'Ditolak', value: stats.DITOLAK },
  ];

  return (
    <div className="flex h-full flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Overview
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
            Dashboard Laporan
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Ringkasan status laporan fasilitas kos berdasarkan data terbaru
            (strong consistency / Supabase).
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {cards.map((card, index) => (
          <div
            key={card.key}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-950/95 p-4 shadow-lg shadow-slate-950/80 transition hover:border-emerald-400/60 hover:shadow-emerald-500/25"
          >
            {/* glow lembut di pojok */}
            <div className="pointer-events-none absolute -right-6 -top-10 h-20 w-20 rounded-full bg-emerald-400/15 blur-2xl transition group-hover:bg-emerald-400/30" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {card.label}
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-50">
              {loading ? (
                <span className="inline-flex h-7 w-11 animate-pulse rounded-lg bg-slate-700/70" />
              ) : (
                card.value
              )}
            </p>

            <p className="mt-1 text-[10px] text-slate-500">
              {index === 0
                ? 'Total semua laporan terdaftar'
                : 'Jumlah laporan dengan status ini'}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
