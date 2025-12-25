// src/app/admin/layout.tsx
import type { ReactNode } from 'react';
import AdminShell from './AdminShell';

export const metadata = {
  title: 'Admin | Kos Maintenance',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // layout server: hanya bungkus ke komponen client
  return <AdminShell>{children}</AdminShell>;
}
