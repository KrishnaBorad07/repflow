import { create } from 'zustand';
import { mockWeeklyPlan } from '../utils/mockData';

const usePlanStore = create((set) => ({
  currentPlan: mockWeeklyPlan,
  selectedDay: null,
  selectedWeek: 3,
  isLoading: false,

  setSelectedDay: (day) => set({ selectedDay: day }),
  setSelectedWeek: (week) => set({ selectedWeek: week }),

  nextWeek: () => set((state) => ({ selectedWeek: Math.min(state.selectedWeek + 1, state.currentPlan.totalWeeks) })),
  prevWeek: () => set((state) => ({ selectedWeek: Math.max(state.selectedWeek - 1, 1) })),

  regeneratePlan: () => {
    set({ isLoading: true });
    setTimeout(() => set({ isLoading: false }), 1500);
  },
}));

export default usePlanStore;
