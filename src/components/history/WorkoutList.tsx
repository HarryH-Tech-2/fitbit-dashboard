import type { WorkoutRecord } from '../../types/workout';
import { WorkoutCard } from './WorkoutCard';

interface Props {
  workouts: WorkoutRecord[];
  onDelete: (id: string) => void;
}

export function WorkoutList({ workouts, onDelete }: Props) {
  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <p className="text-lg font-medium">No workouts yet</p>
        <p className="text-sm mt-1">Complete a workout to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map(w => (
        <WorkoutCard key={w.id} workout={w} onDelete={onDelete} />
      ))}
    </div>
  );
}
