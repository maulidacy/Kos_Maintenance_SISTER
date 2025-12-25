'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Task = {
  id: string;
  judul: string;
  lokasi: string;
  status: 'DIPROSES' | 'DIKERJAKAN' | string;
  prioritas: 'RENDAH' | 'SEDANG' | 'TINGGI' | string;
  kategori: string;
  createdAt: string;
};

function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const base =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide';

  const map = {
    default: 'border-white/10 bg-slate-900/60 text-slate-200',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    danger: 'border-red-500/30 bg-red-500/10 text-red-200',
  };

  return <span className={`${base} ${map[variant]}`}>{children}</span>;
}

export default function TeknisiDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/teknisi/tasks', {
        credentials: 'include', // ✅ IMPORTANT
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal memuat tugas teknisi.');
        setTasks([]);
        return;
      }

      setTasks(data.tasks || []);
    } catch (e) {
      console.error(e);
      setError('Gagal memuat tugas teknisi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStart(id: string) {
    setBusyId(id);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${id}/start`, {
        method: 'POST',
        credentials: 'include', // ✅ FIX
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal memulai tugas.');
        return;
      }

      await load();
    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleResolve(id: string) {
    setBusyId(id);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${id}/resolve`, {
        method: 'POST',
        credentials: 'include', // ✅ FIX
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal menyelesaikan tugas.');
        return;
      }

      await load();
    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setBusyId(null);
    }
  }

  function getPriorityVariant(p: string) {
    if (p === 'TINGGI') return 'danger';
    if (p === 'SEDANG') return 'warning';
    return 'default';
  }

  function getStatusVariant(s: string) {
    if (s === 'DIKERJAKAN') return 'success';
    return 'default';
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-3 py-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Teknisi Panel
            </p>
            <h1 className="text-lg font-semibold">Dashboard Teknisi</h1>
            <p className="text-xs text-slate-300">
              Lihat laporan yang sudah di-assign untuk kamu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
            >
              Refresh
            </button>

            <Link
              href="/"
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Beranda
            </Link>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-xs text-slate-300">
            Memuat tugas...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-center text-xs text-slate-300">
            Tidak ada laporan yang di-assign.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* INFO */}
                  <div className="min-w-[250px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-50">
                        {t.judul}
                      </h2>

                      <Badge variant={getStatusVariant(t.status)}>
                        {t.status}
                      </Badge>

                      <Badge variant={getPriorityVariant(t.prioritas)}>
                        {t.prioritas}
                      </Badge>
                    </div>

                    <p className="mt-2 text-xs text-slate-300">
                      Lokasi:{' '}
                      <span className="font-semibold text-emerald-300">
                        {t.lokasi}
                      </span>
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Kategori: {t.kategori} • Dibuat:{' '}
                      {new Date(t.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/reports/${t.id}`}
                      className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:bg-slate-800"
                    >
                      Detail
                    </Link>

                    {t.status === 'DIPROSES' && (
                      <button
                        onClick={() => handleStart(t.id)}
                        disabled={busyId === t.id}
                        className="rounded-xl bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-60"
                      >
                        {busyId === t.id ? '...' : 'Start'}
                      </button>
                    )}

                    {t.status === 'DIKERJAKAN' && (
                      <button
                        onClick={() => handleResolve(t.id)}
                        disabled={busyId === t.id}
                        className="rounded-xl bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-indigo-600 disabled:opacity-60"
                      >
                        {busyId === t.id ? '...' : 'Resolve'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
