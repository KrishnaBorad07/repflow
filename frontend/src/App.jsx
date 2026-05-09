import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import useAuthStore from './store/authStore';
import Loader from './components/common/Loader';

export default function App() {
  const { fetchUser, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loader while fetching user on initial load
  if (isAuthenticated && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader size={80} label="Loading your profile..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}
