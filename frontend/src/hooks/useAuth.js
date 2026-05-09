import useAuthStore from '../store/authStore';

export default function useAuth() {
  const { user, isAuthenticated, isLoading, login, signup, logout, updateProfile } = useAuthStore();
  return { user, isAuthenticated, isLoading, login, signup, logout, updateProfile };
}
