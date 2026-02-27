import { useWorkoutContext } from '../../context/WorkoutContext';
import { useWorkoutStorage } from '../../hooks/useWorkoutStorage';
import { WorkoutList } from './WorkoutList';
import { AvgHRChart } from './AvgHRChart';
import { TimeInZoneChart } from './TimeInZoneChart';
import { FrequencyChart } from './FrequencyChart';

export function HistoryScreen() {
  const { workouts, loading, remove } = useWorkoutStorage();
  const { settings } = useWorkoutContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        Loading...
      </div>
    );
  }

  const hasHRData = workouts.some(w => w.allReadings.length > 0);

  return (
    <div className="px-4 py-6 space-y-6">
      <FrequencyChart workouts={workouts} />
      {hasHRData && (
        <>
          <AvgHRChart workouts={workouts} />
          <TimeInZoneChart workouts={workouts} zoneConfig={settings.hrZoneConfig} />
        </>
      )}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Workout History</h2>
        <WorkoutList workouts={workouts} onDelete={remove} />
      </div>
    </div>
  );
}
