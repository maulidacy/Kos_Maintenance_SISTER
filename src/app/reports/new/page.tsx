'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReportForm } from '@/components/reports/ReportForm';

export default function NewReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(data: {
    kategori: string;
    judul: string;
    deskripsi: string;
    fotoUrl?: string;
    prioritas: string;
    lokasi: string;
  }) {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.error('Respon bukan JSON /api/reports', res.status);
        setError('Terjadi kesalahan server.');
        return;
      }

      const body = await res.json();
      if (!res.ok) {
        setError(body.error || 'Gagal mengirim laporan.');
        return;
      }

      router.push('/reports');
    } catch (e) {
      console.error(e);
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
              Form Laporan
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              Buat Laporan Fasilitas Baru
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300">
              Jelaskan masalah dengan jelas agar admin bisa menindaklanjuti
              dengan cepat.
            </p>
          </div>

          <Link
            href="/reports"
            className="hidden rounded-xl border border-slate-600/60 bg-slate-900/70 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-slate-800/80 md:inline-flex"
          >
            ← Kembali ke daftar
          </Link>
        </header>

        {error && (
          <p className="text-xs text-red-300">
            {error}
          </p>
        )}

        <ReportForm onSubmit={handleCreate} isSubmitting={isSubmitting} />

        <Link
          href="/reports"
          className="mt-2 inline-flex text-[11px] text-slate-300 hover:text-slate-100 md:hidden"
        >
          ← Kembali ke daftar
        </Link>
      </div>
    </main>
  );
}
