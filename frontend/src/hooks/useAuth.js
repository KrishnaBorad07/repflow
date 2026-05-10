import useAuthStore from '../store/authStore';

export default function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    refreshUser,
    updateProfile,
  } = useAuthStore();
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    refreshUser,
    updateProfile,
  };
}
