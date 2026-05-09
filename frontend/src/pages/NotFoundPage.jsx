import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="text-[80px] font-bold font-mono text-accent leading-none">404</div>
      <h1 className="text-2xl font-semibold mt-4">Page not found</h1>
      <p className="text-sm text-muted mt-2 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex gap-2.5">
        <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}
