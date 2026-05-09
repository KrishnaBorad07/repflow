import { create } from 'zustand';
import { mockUser } from '../utils/mockData';

const useAuthStore = create((set) => ({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,

  login: (email, password) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    }, 500);
  },

  signup: (userData) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ user: { ...mockUser, ...userData }, isAuthenticated: true, isLoading: false });
    }, 500);
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }));
  },
}));

export default useAuthStore;
