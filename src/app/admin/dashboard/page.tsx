'use client';

import { useEffect, useMemo, useState } from 'react';

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

type TimetimeSummary = {
  range: { from: string; to: string };
  total: number;
  finished: number;
  rejected: number;
  received: number;
  inProgress: number;
  avgResponseMs: number;
  avgWorkMs: number;
  avgTotalMs: number;
};

type TimetimeResponse = {
  ok: boolean;
  summary: TimetimeSummary;
  human: {
    avgResponseMin: number;
    avgWorkMin: number;
    avgTotalMin: number;
  };
  error?: string;
};

function formatDateInput(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function minutesToLabel(min: number) {
  if (!min || min <= 0) return '0 menit';
  if (min < 60) return `${min} menit`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

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

  // timetime state
  const [timeFrom, setTimeFrom] = useState(() => {
    const now = new Date();
    now.setDate(now.getDate() - 6);
    return formatDateInput(now);
  });
  const [timeTo, setTimeTo] = useState(() => formatDateInput(new Date()));
  const [ttLoading, setTtLoading] = useState(false);
  const [ttError, setTtError] = useState<string | null>(null);
  const [tt, setTt] = useState<TimetimeResponse | null>(null);

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

  // lazy load timetime: hanya setelah overview selesai load
  useEffect(() => {
    if (loading) return;

    let ignore = false;

    async function loadTimetime() {
      setTtLoading(true);
      setTtError(null);

      try {
        const qs = new URLSearchParams({
          from: timeFrom,
          to: timeTo,
        }).toString();

        const res = await fetch(`/api/admin/timetime?${qs}`, {
          credentials: 'include',
        });

        const data: TimetimeResponse = await res.json();

        if (!res.ok || !data.ok) {
          setTtError(data.error || 'Gagal memuat timetime report.');
          setTt(null);
          return;
        }

        if (!ignore) setTt(data);
      } catch (e) {
        console.error(e);
        if (!ignore) {
          setTtError('Gagal memuat timetime report.');
          setTt(null);
        }
      } finally {
        if (!ignore) setTtLoading(false);
      }
    }

    loadTimetime();

    return () => {
      ignore = true;
    };
  }, [loading, timeFrom, timeTo]);

  const cards = useMemo(
    () => [
      { key: 'total', label: 'Total', value: stats.total },
      { key: 'BARU', label: 'Baru', value: stats.BARU },
      { key: 'DIPROSES', label: 'Diproses', value: stats.DIPROSES },
      { key: 'DIKERJAKAN', label: 'Dikerjakan', value: stats.DIKERJAKAN },
      { key: 'SELESAI', label: 'Selesai', value: stats.SELESAI },
      { key: 'DITOLAK', label: 'Ditolak', value: stats.DITOLAK },
    ],
    [stats]
  );

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
            (strong consistency).
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {cards.map((card, index) => (
          <div
            key={card.key}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-950/95 p-4 shadow-lg shadow-slate-950/80 transition hover:border-emerald-400/60 hover:shadow-emerald-500/25"
          >
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

      {/* TIMETIME REPORT (LAZY) */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
              Timetime Report
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-50">
              Rata-rata Response Time dan Work Time
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Menghitung durasi dari timestamp (reported, received, started, resolved).
              Data diambil ringan tanpa fetch semua detail laporan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div>
              <label className="block text-[11px] text-slate-400">Dari</label>
              <input
                type="date"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400">Sampai</label>
              <input
                type="date"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {ttError && (
          <p className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">
            {ttError}
          </p>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-[11px] text-slate-400">Avg Response Time</p>
            <p className="mt-2 text-lg font-semibold text-slate-50">
              {ttLoading ? (
                <span className="inline-flex h-5 w-24 animate-pulse rounded-lg bg-slate-700/70" />
              ) : (
                minutesToLabel(tt?.human.avgResponseMin || 0)
              )}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              receivedAt - reportedAt
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-[11px] text-slate-400">Avg Work Time</p>
            <p className="mt-2 text-lg font-semibold text-slate-50">
              {ttLoading ? (
                <span className="inline-flex h-5 w-24 animate-pulse rounded-lg bg-slate-700/70" />
              ) : (
                minutesToLabel(tt?.human.avgWorkMin || 0)
              )}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              resolvedAt - startedAt
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-[11px] text-slate-400">Avg Total Time</p>
            <p className="mt-2 text-lg font-semibold text-slate-50">
              {ttLoading ? (
                <span className="inline-flex h-5 w-24 animate-pulse rounded-lg bg-slate-700/70" />
              ) : (
                minutesToLabel(tt?.human.avgTotalMin || 0)
              )}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              resolvedAt - reportedAt
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-[11px] text-slate-400">Total Laporan</p>
            <p className="mt-2 text-xl font-semibold text-slate-50">
              {ttLoading ? (
                <span className="inline-flex h-6 w-14 animate-pulse rounded-lg bg-slate-700/70" />
              ) : (
                tt?.summary.total ?? 0
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-[11px] text-slate-400">Selesai</p>
            <p className="mt-2 text-xl font-semibold text-slate-50">
              {ttLoading ? (
                <span className="inline-flex h-6 w-14 animate-pulse rounded-lg bg-slate-700/70" />
              ) : (
                tt?.summary.finished ?? 0
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-[11px] text-slate-400">Ditolak</p>
            <p className="mt-2 text-xl font-semibold text-slate-50">
              {ttLoading ? (
                <span className="inline-flex h-6 w-14 animate-pulse rounded-lg bg-slate-700/70" />
              ) : (
                tt?.summary.rejected ?? 0
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-[11px] text-slate-400">Sedang Dikerjakan</p>
            <p className="mt-2 text-xl font-semibold text-slate-50">
              {ttLoading ? (
                <span className="inline-flex h-6 w-14 animate-pulse rounded-lg bg-slate-700/70" />
              ) : (
                tt?.summary.inProgress ?? 0
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
