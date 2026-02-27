import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { WorkoutRecord } from '../types/workout';

interface FourByFourDB extends DBSchema {
  workouts: {
    key: string;
    value: WorkoutRecord;
    indexes: {
      'by-date': number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<FourByFourDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FourByFourDB>('four-by-four', 1, {
      upgrade(db) {
        const store = db.createObjectStore('workouts', { keyPath: 'id' });
        store.createIndex('by-date', 'startedAt');
      },
    });
  }
  return dbPromise;
}

export async function saveWorkout(record: WorkoutRecord): Promise<void> {
  const db = await getDB();
  await db.put('workouts', record);
}

export async function getWorkout(id: string): Promise<WorkoutRecord | undefined> {
  const db = await getDB();
  return db.get('workouts', id);
}

export async function getAllWorkouts(): Promise<WorkoutRecord[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('workouts', 'by-date');
  return all.reverse(); // newest first
}

export async function deleteWorkout(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('workouts', id);
}
