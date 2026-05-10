import { create } from 'zustand';
import { getWeeklyPlan, generatePlan, regeneratePlan } from '../services/planService';

const usePlanStore = create((set, get) => ({
  currentPlan: null,
  selectedDay: null,
  selectedWeek: 1,
  isLoading: false,
  error: null,

  setSelectedDay: (day) => set({ selectedDay: day }),
  setSelectedWeek: (week) => set({ selectedWeek: week }),

  nextWeek: () => set((state) => ({
    selectedWeek: Math.min(state.selectedWeek + 1, state.currentPlan?.totalWeeks || 1),
  })),
  prevWeek: () => set((state) => ({
    selectedWeek: Math.max(state.selectedWeek - 1, 1),
  })),

  fetchPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await getWeeklyPlan();
      set({ currentPlan: data, selectedWeek: data.weekNumber, isLoading: false });
    } catch (err) {
      if (err.response?.status === 404) {
        set({ currentPlan: null, isLoading: false });
      } else {
        set({ error: err.message, isLoading: false });
      }
    }
  },

  generateNewPlan: async (userProfile) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await generatePlan(userProfile);
      set({ currentPlan: data, selectedWeek: data.weekNumber, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  regeneratePlan: async (tweaks = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await regeneratePlan(tweaks);
      set({ currentPlan: data, selectedWeek: data.weekNumber, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },
}));

export default usePlanStore;
