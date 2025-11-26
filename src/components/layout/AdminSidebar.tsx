'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/reports', label: 'Laporan' },
  { href: '/admin/stats', label: 'Statistik' },
];

type AdminSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AdminSidebar({ className = '', onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`w-56 shrink-0 border-r border-white/5 bg-slate-950/90 px-3 py-5 text-sm text-slate-100 ${className}`}
    >
      <nav className="space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const base =
            'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition';
          const activeClass =
            'bg-emerald-500/15 text-emerald-100 border border-emerald-500/50 shadow-sm shadow-emerald-500/40';
          const inactiveClass =
            'text-slate-300 hover:bg-slate-800/90 hover:text-slate-50';

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`${base} ${active ? activeClass : inactiveClass}`}
            >
              <span>{link.label}</span>
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
