'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReportTable } from '@/components/reports/ReportTable';

type ReportRow = {
  id: string;
  judul: string;
  kategori: string;
  prioritas: string;
  status: string;
  lokasi: string;
  createdAt: string;
};

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reports?mode=strong');
        const data = await res.json();
        setReports(data.reports || []);
      } catch (err) {
        console.error('Fetch reports error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-3 py-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Laporan Saya</h1>
            <p className="text-xs text-slate-300">
              Klik salah satu baris untuk melihat & mengedit detail laporan.
            </p>
          </div>
          <Link
            href="/reports/new"
            className="inline-flex items-center rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-600"
          >
            Laporan baru
          </Link>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-xs text-slate-300">
            Memuat laporan...
          </div>
        ) : (
          <ReportTable
            reports={reports}
            onRowClick={(id) => router.push(`/reports/${id}`)}
          />
        )}
      </div>
    </main>
  );
}
