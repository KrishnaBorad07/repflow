import useThemeStore from '../store/themeStore';

export default function useTheme() {
  const { isDark, toggleTheme, setDark, setLight } = useThemeStore();
  return { isDark, toggleTheme, setDark, setLight };
}
