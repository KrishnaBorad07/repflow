import { create } from 'zustand';

const useWorkoutStore = create((set, get) => ({
  activeWorkout: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  setsCompleted: [],
  isResting: false,
  restTimeRemaining: 0,
  elapsedSeconds: 0,
  isPaused: false,

  startWorkout: (workout) => {
    set({
      activeWorkout: workout,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      setsCompleted: [],
      isResting: false,
      restTimeRemaining: 0,
      elapsedSeconds: 0,
      isPaused: false,
    });
  },

  nextExercise: () => {
    const { currentExerciseIndex, activeWorkout } = get();
    if (activeWorkout && currentExerciseIndex < activeWorkout.exercises.length - 1) {
      set({ currentExerciseIndex: currentExerciseIndex + 1, currentSetIndex: 0 });
    }
  },

  completeSet: (setData) => {
    set((state) => ({
      setsCompleted: [...state.setsCompleted, { ...setData, exerciseIndex: state.currentExerciseIndex, setIndex: state.currentSetIndex }],
      currentSetIndex: state.currentSetIndex + 1,
      isResting: true,
      restTimeRemaining: state.activeWorkout?.exercises[state.currentExerciseIndex]?.restSeconds || 90,
    }));
  },

  skipRest: () => {
    set({ isResting: false, restTimeRemaining: 0 });
  },

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

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  endWorkout: () => {
    set({
      activeWorkout: null,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      setsCompleted: [],
      isResting: false,
      restTimeRemaining: 0,
      elapsedSeconds: 0,
      isPaused: false,
    });
  },
}));

export default useWorkoutStore;
