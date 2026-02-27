import type { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  return (
    <div className="flex flex-col h-dvh bg-slate-950 text-white">
      <Header />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
