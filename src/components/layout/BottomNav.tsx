import { Clock, History, Settings } from 'lucide-react';
import { useWorkoutContext, type Tab } from '../../context/WorkoutContext';

const tabs: { id: Tab; label: string; icon: typeof Clock }[] = [
  { id: 'timer', label: 'Timer', icon: Clock },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const { tab, setTab } = useWorkoutContext();

  return (
    <nav className="flex border-t border-slate-800 bg-slate-950 pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            tab === id ? 'text-white' : 'text-slate-500'
          }`}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </nav>
  );
}
