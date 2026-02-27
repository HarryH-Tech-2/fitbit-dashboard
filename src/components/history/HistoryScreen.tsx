import { Loader } from 'lucide-react';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useWorkoutStorage } from '../../hooks/useWorkoutStorage';
import { useFitbitHistory } from '../../hooks/useFitbitHistory';
import { WorkoutList } from './WorkoutList';
import { AvgHRChart } from './AvgHRChart';
import { TimeInZoneChart } from './TimeInZoneChart';
import { FrequencyChart } from './FrequencyChart';
import { RestingHRChart } from './RestingHRChart';
import { FitbitActivityCard } from './FitbitActivityCard';

export function HistoryScreen() {
  const { workouts, loading, remove } = useWorkoutStorage();
  const { settings } = useWorkoutContext();
  const fitbit = useFitbitHistory();

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
      {fitbit.dailyHR.length > 0 && <RestingHRChart dailyHR={fitbit.dailyHR} />}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Workout History</h2>
        <WorkoutList workouts={workouts} onDelete={remove} />
      </div>
      {fitbit.loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
          <Loader size={16} className="animate-spin" />
          Loading Fitbit activities...
        </div>
      ) : fitbit.activities.length > 0 ? (
        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-3">Fitbit Activities</h2>
          <div className="space-y-3">
            {fitbit.activities.map(a => (
              <FitbitActivityCard key={a.logId} activity={a} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
