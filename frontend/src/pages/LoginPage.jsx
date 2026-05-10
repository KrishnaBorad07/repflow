import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import RepFlowLogo from '../components/common/RepFlowLogo';
import MiniSpinner from '../components/common/MiniSpinner';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await login(form.email, form.password);
    if (result.ok) navigate('/dashboard');
    else setError(result.error);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 py-10 sm:p-6 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex items-center mb-10 sm:mb-12">
          <RepFlowLogo height={24} />
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted text-sm mt-2">Pick up where you left off.</p>

        <form onSubmit={handleSubmit} className="mt-7 sm:mt-8 flex flex-col gap-3.5">
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jash@example.com" />
          <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-[13px] text-bad" role="alert">{error}</p>}
          <div className="text-right">
            <Link to="/forgot-password" className="text-[13px] text-accent font-medium">Forgot password?</Link>
          </div>
          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2" disabled={isLoading}>
            {isLoading ? <><MiniSpinner variant="ring" size={14} color="#0A0B0D" /> Signing in…</> : 'Log in'}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-hairline" /><span className="text-dim text-xs">or</span><div className="flex-1 h-px bg-hairline" />
        </div>

        <GoogleSignInButton onError={setError} />

        <p className="text-center text-[13px] text-muted mt-8">
          New to RepFlow? <Link to="/signup" className="text-accent font-semibold">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
