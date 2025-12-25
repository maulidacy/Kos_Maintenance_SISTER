// src/components/reports/ReportTable.tsx
'use client';

import Link from 'next/link';

type ReportRow = {
  id: string;
  judul: string;
  kategori: string;
  prioritas: string;
  status: string;
  lokasi: string;
  createdAt: string;
};

export function ReportTable({ reports }: { reports: ReportRow[] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
      <table className="min-w-full text-left text-xs text-slate-200">
        <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Judul</th>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Prioritas</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Lokasi</th>
            <th className="px-4 py-3">Dibuat</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-6 text-center text-slate-400"
              >
                Belum ada laporan.
              </td>
            </tr>
          ) : (
            reports.map((r) => (
              <tr
                key={r.id}
                className="border-t border-white/5 hover:bg-slate-900/60"
              >
                {/* JUDUL → link ke detail laporan (halaman yang sudah berfungsi) */}
                <td className="px-4 py-3 text-sm text-slate-100">
                  <Link
                    href={`/reports/${r.id}`}
                    className="hover:text-emerald-300 underline-offset-2 hover:underline"
                  >
                    {r.judul}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-slate-300">
                  {r.kategori}
                </td>
                <td className="px-4 py-3 text-xs text-slate-300">
                  {r.prioritas}
                </td>
                <td className="px-4 py-3 text-xs text-slate-300">
                  {r.status}
                </td>
                <td className="px-4 py-3 text-xs text-slate-300">
                  {r.lokasi}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleString('id-ID')}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
