'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ReportTable } from '@/components/reports/ReportTable';

type Mode = 'strong' | 'eventual' | 'weak';

export default function AdminReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialMode = (searchParams.get('mode') as Mode) || 'strong';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const res = await fetch(`/api/reports?admin=1&mode=${mode}`);
      const data = await res.json();
      setReports(data.reports || []);
      setLoading(false);
    }
    fetchReports();
  }, [mode]);

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    const sp = new URLSearchParams(window.location.search);
    sp.set('mode', newMode);
    router.replace(`/admin/reports?${sp.toString()}`);
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">
            Daftar Laporan
          </h1>
          <p className="text-xs text-slate-400">
            Mode konsistensi:{' '}
            <span className="font-semibold uppercase">{mode}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-2 py-1 text-xs text-slate-100">
          <span className="hidden md:inline text-slate-400">
            Mode baca data:
          </span>
          {(['strong', 'eventual', 'weak'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`rounded-xl px-3 py-1 font-medium transition ${
                mode === m
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <p className="text-xs text-slate-400">Memuat laporan...</p>
      ) : (
        <ReportTable
          reports={reports.map((r) => ({
            id: r.id,
            judul: r.judul,
            kategori: r.kategori,
            prioritas: r.prioritas,
            status: r.status,
            lokasi: r.lokasi,
            createdAt: r.createdAt,
          }))}
        />
      )}
    </div>
  );
}
