import { create } from 'zustand';
import { getUserProfile } from '../services/userService';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: true, // stub: always authenticated (Group 2 adds real auth)
  isLoading: true,

  /** Fetch the real user profile from the backend */
  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await getUserProfile();
      const u = res.data;
      set({
        user: {
          ...u,
          initials: u.name
            ? u.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : '??',
          memberSince: u.member_since
            ? new Date(u.member_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : 'New member',
          // Stats — placeholder until workout history is implemented (Section 2)
          totalWorkouts: 0,
          totalHours: 0,
          streak: 0,
          totalVolumeKg: 0,
        },
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      set({ isLoading: false });
    }
  },

  login: (email, password) => {
    // Group 2 will replace with real auth
    set({ isAuthenticated: true });
    get().fetchUser();
  },

  signup: (userData) => {
    // Group 2 will replace with real auth
    set({ isAuthenticated: true });
    get().fetchUser();
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updates) => {
    set((state) => ({ user: state.user ? { ...state.user, ...updates } : null }));
  },
}));

export default useAuthStore;
