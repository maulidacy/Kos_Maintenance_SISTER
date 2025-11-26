export default function AdminReportsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-slate-50">
          Manajemen Laporan
        </h1>
        <p className="text-xs text-slate-300">
          Lihat dan kelola semua laporan dari penghuni kos.
        </p>
      </header>

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-sm backdrop-blur">
        <p className="text-xs text-slate-300">
          Tabel laporan akan ditampilkan di sini.
        </p>
      </div>
    </div>
  );
}
