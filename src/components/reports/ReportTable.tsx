'use client';

import React from 'react';

type ReportRow = {
  id: string;
  judul: string;
  kategori: string;
  prioritas: string;
  status: string;
  lokasi: string;
  createdAt: string;
};

type ReportTableProps = {
  reports: ReportRow[];
  onRowClick?: (id: string) => void;
};

export function ReportTable({ reports, onRowClick }: ReportTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 shadow-lg shadow-slate-950/70">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/80">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Judul
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Kategori
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Prioritas
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Lokasi
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Dibuat
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/80">
          {reports.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-6 text-center text-xs text-slate-400"
              >
                Belum ada laporan.
              </td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr
                key={report.id}
                className="cursor-pointer hover:bg-slate-900/80"
                onClick={() => onRowClick?.(report.id)}
              >
                <td className="px-4 py-3 text-slate-50">{report.judul}</td>
                <td className="px-4 py-3 text-slate-300">{report.kategori}</td>
                <td className="px-4 py-3 text-slate-300">
                  {report.prioritas}
                </td>
                <td className="px-4 py-3 text-slate-300">{report.status}</td>
                <td className="px-4 py-3 text-slate-300">{report.lokasi}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(report.createdAt).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
