import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import RepFlowLogo from '../components/common/RepFlowLogo';
import useAuthStore from '../store/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(form);
    navigate('/onboarding');
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
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jash Patel" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jash@example.com" />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-3">Create account</Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-hairline" />
          <span className="text-dim text-xs">or</span>
          <div className="flex-1 h-px bg-hairline" />
        </div>

        <Button variant="secondary" size="lg" fullWidth>
          <GoogleIcon /> Continue with Google
        </Button>

        <p className="text-center text-[13px] text-muted mt-8">
          Already have an account? <Link to="/login" className="text-accent font-semibold">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 110-24c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.9-5l-6-5C29.1 35.4 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8L6 33C9.4 39.6 16.1 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.9 5.5l6 5C40.7 35.5 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>;
}
