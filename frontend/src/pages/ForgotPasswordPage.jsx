import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-12">
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none"><path d="M4 6 L12 3 L20 6 L20 12 C20 17 16 21 12 22 C8 21 4 17 4 12 Z" fill="#C8FF3D" /><path d="M9 11l2.5 3 4-5" stroke="#0A0B0D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          <span className="text-[17px] font-semibold">RepFlow</span>
        </div>
        <h1 className="text-[32px] font-semibold tracking-tight">Reset password</h1>
        <p className="text-muted text-sm mt-2">We'll send you a reset link.</p>

        {sent ? (
          <div className="mt-8 p-6 card text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-lg font-semibold">Check your email</h3>
            <p className="text-sm text-muted mt-2">We've sent a reset link to {email}</p>
            <Link to="/login"><Button variant="secondary" size="md" className="mt-6">Back to login</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3.5">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jash@example.com" />
            <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2">Send reset link</Button>
          </form>
        )}

        <p className="text-center text-[13px] text-muted mt-8">
          <Link to="/login" className="text-accent font-semibold">Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
}
