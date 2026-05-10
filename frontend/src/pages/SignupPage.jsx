import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import RepFlowLogo from '../components/common/RepFlowLogo';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import useAuthStore from '../store/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const startSignup = useAuthStore((s) => s.startSignup);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    const result = await startSignup({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    if (result.ok) {
      // OTP sent — go to the verify-email screen.
      navigate('/verify-email');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex items-center mb-12">
          <RepFlowLogo height={24} />
        </div>
        <h1 className="text-[32px] font-semibold tracking-tight">Create your account</h1>
        <p className="text-muted text-sm mt-2">Start training smarter in under a minute.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3.5">
          <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jash Patel" />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jash@example.com" />
          <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Confirm password" type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          {error && <p className="text-[13px] text-bad" role="alert">{error}</p>}
          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-3" disabled={isLoading}>
            {isLoading ? 'Sending code…' : 'Create account'}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-hairline" />
          <span className="text-dim text-xs">or</span>
          <div className="flex-1 h-px bg-hairline" />
        </div>

        <GoogleSignInButton onError={setError} />

        <p className="text-center text-[13px] text-muted mt-8">
          Already have an account? <Link to="/login" className="text-accent font-semibold">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
