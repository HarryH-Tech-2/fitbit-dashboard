import { useCallback, useEffect, useState } from 'react';
import type { WorkoutRecord } from '../types/workout';
import { deleteWorkout, getAllWorkouts, saveWorkout } from '../lib/db';

export function useWorkoutStorage() {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await getAllWorkouts();
    setWorkouts(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (record: WorkoutRecord) => {
    await saveWorkout(record);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteWorkout(id);
    await refresh();
  }, [refresh]);

  return { workouts, loading, save, remove, refresh };
}
