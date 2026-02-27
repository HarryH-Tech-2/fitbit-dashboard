import { WorkoutProvider, useWorkoutContext } from './context/WorkoutContext';
import { AppShell } from './components/layout/AppShell';
import { TimerScreen } from './components/timer/TimerScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';

function TabContent() {
  const { tab } = useWorkoutContext();

  switch (tab) {
    case 'timer':
      return <TimerScreen />;
    case 'history':
      return <HistoryScreen />;
    case 'settings':
      return <SettingsScreen />;
  }
}

function App() {
  return (
    <WorkoutProvider>
      <AppShell>
        <TabContent />
      </AppShell>
    </WorkoutProvider>
  );
}

export default App;
