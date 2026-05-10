import { create } from 'zustand';
import * as workoutService from '../services/workoutService';

/**
 * Active-workout state machine.
 *
 * Lifecycle:
 *   beginWorkout(workout)  → POST /workouts/start, store sessionId + workout
 *   completeSet(setData)   → POST /workouts/{id}/sets, then transition to rest
 *   finishWorkout()        → POST /workouts/{id}/end, returns summary
 */
const useWorkoutStore = create((set, get) => ({
  // ──── State ────
  sessionId: null,
  activeWorkout: null,            // { plan_day_id, name, exercises: [...] }
  currentExerciseIndex: 0,
  currentSetIndex: 0,              // 0-based; UI shows +1
  setsCompleted: [],               // [{ exerciseIndex, setIndex, ...setData, serverId }]
  isResting: false,
  restTimeRemaining: 0,
  elapsedSeconds: 0,
  isPaused: false,
  isStarting: false,
  isEnding: false,
  summary: null,                   // populated on finishWorkout
  error: null,

  // ──── Actions ────

  /**
   * Begin a workout. Creates a session on the backend, then mirrors
   * locally. Returns the server-issued sessionId so the caller can
   * navigate to /workout/{id}.
   */
  beginWorkout: async (workout) => {
    set({ isStarting: true, error: null });
    try {
      const summary = await workoutService.startWorkout({
        plan_day_id: workout.plan_day_id ?? null,
        workout_name: workout.name ?? null,
      });
      set({
        sessionId: summary.id,
        activeWorkout: workout,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        setsCompleted: [],
        isResting: false,
        restTimeRemaining: 0,
        elapsedSeconds: 0,
        isPaused: false,
        isStarting: false,
        summary: null,
        error: null,
      });
      return summary.id;
    } catch (err) {
      set({ isStarting: false, error: extractError(err) });
      throw err;
    }
  },

  /**
   * Log a completed set. Optimistically transitions to rest while the
   * POST is in flight; if it fails we surface the error but keep the
   * local state (the user shouldn't lose progress).
   */
  completeSet: async (setData) => {
    const { sessionId, activeWorkout, currentExerciseIndex, currentSetIndex } = get();
    if (!sessionId || !activeWorkout) return;

    const exercise = activeWorkout.exercises[currentExerciseIndex];
    const exerciseSetCount = exercise?.sets ?? 4;

    // 1-based set_number for the API; align with UI display.
    const setNumber = currentSetIndex + 1;

    const payload = {
      exercise_id: String(exercise?.id ?? `ex_${currentExerciseIndex}`),
      exercise_name: exercise?.name ?? null,
      set_number: setNumber,
      reps_completed: setData.reps_completed ?? exercise?.reps ?? 0,
      reps_good_form: setData.reps_good_form ?? null,
      weight_kg: setData.weight_kg ?? exercise?.weight ?? 0,
      form_score: setData.form_score ?? null,
      is_partial: setData.is_partial ?? false,
      notes: setData.notes ?? null,
    };

    // Decide what comes next: more sets in this exercise, next exercise, or finished.
    const isLastSetOfExercise = setNumber >= exerciseSetCount;
    const isLastExercise = currentExerciseIndex >= activeWorkout.exercises.length - 1;
    const restSeconds = isLastSetOfExercise
      ? 60                                    // shorter rest between exercises
      : exercise?.restSeconds ?? 90;

    // Optimistic local update — UX shouldn't wait on the network.
    set((state) => ({
      setsCompleted: [
        ...state.setsCompleted,
        { exerciseIndex: currentExerciseIndex, setIndex: currentSetIndex, ...payload },
      ],
      currentSetIndex: isLastSetOfExercise ? 0 : currentSetIndex + 1,
      currentExerciseIndex: isLastSetOfExercise && !isLastExercise
        ? currentExerciseIndex + 1
        : currentExerciseIndex,
      isResting: !(isLastSetOfExercise && isLastExercise),
      restTimeRemaining: isLastSetOfExercise && isLastExercise ? 0 : restSeconds,
    }));

    try {
      const saved = await workoutService.logSet(sessionId, payload);
      // Patch the local entry with the server id so we can correlate later.
      set((state) => ({
        setsCompleted: state.setsCompleted.map((s, i) =>
          i === state.setsCompleted.length - 1 ? { ...s, serverId: saved.id } : s
        ),
      }));
    } catch (err) {
      console.error('logSet failed:', err);
      set({ error: extractError(err) });
    }

    return { isLastSetOfExercise, isLastExercise };
  },

  skipRest: () => set({ isResting: false, restTimeRemaining: 0 }),

  tickRest: () => {
    set((state) => {
      const remaining = state.restTimeRemaining - 1;
      return remaining <= 0
        ? { restTimeRemaining: 0, isResting: false }
        : { restTimeRemaining: remaining };
    });
  },

  tickElapsed: () => {
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
  },

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  /**
   * Finalize the session. Server computes duration, volume, avg form, calories.
   * Returns the summary so the caller can render the complete screen.
   */
  finishWorkout: async ({ rpe } = {}) => {
    const { sessionId } = get();
    if (!sessionId) return null;

    set({ isEnding: true, error: null });
    try {
      const summary = await workoutService.endWorkout(sessionId, { rpe });
      set({ summary, isEnding: false });
      return summary;
    } catch (err) {
      set({ isEnding: false, error: extractError(err) });
      throw err;
    }
  },

  /**
   * Wipe local state. Call when leaving the workout flow.
   */
  resetWorkout: () => {
    set({
      sessionId: null,
      activeWorkout: null,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      setsCompleted: [],
      isResting: false,
      restTimeRemaining: 0,
      elapsedSeconds: 0,
      isPaused: false,
      isStarting: false,
      isEnding: false,
      summary: null,
      error: null,
    });
  },
}));

function extractError(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return err?.message ?? 'Something went wrong';
}

export default useWorkoutStore;
