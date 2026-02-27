import { Timer } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
      <Timer size={20} className="text-interval" />
      <h1 className="text-lg font-bold tracking-tight">4×4 Interval</h1>
    </header>
  );
}
