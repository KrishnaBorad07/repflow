import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import useAuthStore from './store/authStore';
import Loader from './components/common/Loader';

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const [booted, setBooted] = useState(false);

  // Run once: if a JWT is already on disk, validate it via /auth/me.
  useEffect(() => {
    (async () => {
      await bootstrap();
      setBooted(true);
    })();
  }, [bootstrap]);

  if (!booted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader size={80} label="Loading..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}
