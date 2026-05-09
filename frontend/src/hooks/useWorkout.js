import { useEffect, useRef } from 'react';
import useWorkoutStore from '../store/workoutStore';

export default function useWorkout() {
  const store = useWorkoutStore();
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);

  useEffect(() => {
    if (store.isResting && !store.isPaused) {
      timerRef.current = setInterval(() => store.tickRest(), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [store.isResting, store.isPaused]);

  useEffect(() => {
    if (store.activeWorkout && !store.isPaused) {
      elapsedRef.current = setInterval(() => store.tickElapsed(), 1000);
    }
    return () => clearInterval(elapsedRef.current);
  }, [store.activeWorkout, store.isPaused]);

  return store;
}
