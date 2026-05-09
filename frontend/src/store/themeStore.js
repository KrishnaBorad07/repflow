import { create } from 'zustand';

const useThemeStore = create((set) => ({
  isDark: true,

  toggleTheme: () => {
    set((state) => {
      const newIsDark = !state.isDark;
      document.documentElement.classList.toggle('dark', newIsDark);
      document.documentElement.classList.toggle('light', !newIsDark);
      return { isDark: newIsDark };
    });
  },

  setDark: () => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    set({ isDark: true });
  },

  setLight: () => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    set({ isDark: false });
  },
}));

export default useThemeStore;
