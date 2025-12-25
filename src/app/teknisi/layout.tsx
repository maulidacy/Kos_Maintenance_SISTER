import type { ReactNode } from 'react';
import TechnicianShell from './TechnicianShell';

export const metadata = {
  title: 'Teknisi | Kos Maintenance',
};

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  return <TechnicianShell>{children}</TechnicianShell>;
}
