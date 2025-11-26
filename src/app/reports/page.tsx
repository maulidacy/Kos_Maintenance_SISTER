'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ReportTable } from '@/components/reports/ReportTable';

type Mode = 'strong' | 'eventual' | 'weak';

type ReportRow = {
  id: string;
  judul: string;
  kategori: string;
  prioritas: string;
  status: string;
  lokasi: string;
  createdAt: string;
};

export default function UserReportsPage() {
  const [mode, setMode] = useState<Mode>('strong');
  const [status, setStatus] = useState<string>('');
  const [kategori, setKategori] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);

  async function loadReports() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('mode', mode);
      if (status) params.set('status', status);
      if (kategori) params.set('kategori', kategori);

      const res = await fetch(`/api/reports?${params.toString()}`, {
        method: 'GET',
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.error('Response bukan JSON /api/reports', res.status);
        setError('Terjadi kesalahan server.');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal memuat laporan.');
        return;
      }

      setReports(
        (data.reports || []).map((r: any) => ({
          id: r.id,
          judul: r.judul,
          kategori: r.kategori,
          prioritas: r.prioritas,
          status: r.status,
          lokasi: r.lokasi,
          createdAt: r.createdAt,
        })),
      );
    } catch (e) {
      console.error(e);
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, status, kategori]);

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
              Laporan Saya
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              Riwayat Laporan Fasilitas
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300">
              Lihat semua laporan yang pernah kamu buat dan status terbarunya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/reports/new"
              className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400"
            >
              + Buat Laporan Baru
            </Link>
          </div>
        </header>

        {/* Filter & mode */}
        <section className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-3 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-300/90">Mode konsistensi:</span>
            <div className="inline-flex rounded-full bg-slate-900/80 p-1">
              {(['strong', 'eventual', 'weak'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                    mode === m
                      ? 'bg-emerald-500 text-slate-950 shadow shadow-emerald-400/50'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  {m === 'strong'
                    ? 'Strong (Primary)'
                    : m === 'eventual'
                    ? 'Eventual (Replica)'
                    : 'Weak (Statistik)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            >
              <option value="">Semua status</option>
              <option value="BARU">Baru</option>
              <option value="DIPROSES">Diproses</option>
              <option value="DIKERJAKAN">Dikerjakan</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
            </select>

            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            >
              <option value="">Semua kategori</option>
              <option value="AIR">Air</option>
              <option value="LISTRIK">Listrik</option>
              <option value="WIFI">WiFi</option>
              <option value="KEBERSIHAN">Kebersihan</option>
              <option value="FASILITAS_UMUM">Fasilitas Umum</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
        </section>

        {/* Tabel laporan */}
        <section className="space-y-3">
          {loading && (
            <p className="text-xs text-slate-300">
              Memuat laporan… (mode: <span className="font-mono">{mode}</span>)
            </p>
          )}
          {error && (
            <p className="text-xs text-red-300">
              {error}
            </p>
          )}

          <ReportTable reports={reports} />
        </section>
      </div>
    </main>
  );
}
