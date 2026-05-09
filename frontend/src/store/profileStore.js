import { create } from 'zustand';
import { mockUser, mockAchievements } from '../utils/mockData';

const useProfileStore = create((set) => ({
  profile: mockUser,
  achievements: mockAchievements,
  isLoading: false,

  updateProfile: (updates) => {
    set((state) => ({ profile: { ...state.profile, ...updates } }));
  },

  setAchievements: (achievements) => set({ achievements }),
}));

export default useProfileStore;
