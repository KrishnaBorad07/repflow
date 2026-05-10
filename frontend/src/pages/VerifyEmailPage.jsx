import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import useAuthStore from '../store/authStore';

/**
 * Six-digit OTP entry. Auto-advances per character and posts to /verify-otp
 * once the last box is filled. Falls back to a manual "Verify" button.
 */
export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [resendMsg, setResendMsg] = useState(null);
  const inputs = useRef([]);

  // If the user landed here without going through signup, send them back.
  useEffect(() => {
    if (!pendingEmail) navigate('/signup', { replace: true });
  }, [pendingEmail, navigate]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const code = digits.join('');

  const setDigit = (idx, value) => {
    const v = value.replace(/\D/g, '').slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
    if (v && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split('');
    while (next.length < 6) next.push('');
    setDigits(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const submit = async (codeOverride) => {
    const finalCode = codeOverride ?? code;
    if (finalCode.length !== 6) return;
    setError(null);
    const result = await verifyOtp(pendingEmail, finalCode);
    if (result.ok) {
      navigate('/onboarding');
    } else {
      setError(result.error);
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
  };

  // Auto-submit when all six are filled.
  useEffect(() => {
    if (code.length === 6 && !isLoading) submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleResend = async () => {
    setResendMsg(null);
    setError(null);
    const result = await resendOtp(pendingEmail);
    if (result.ok) setResendMsg(result.message || 'A new code is on its way.');
    else setError(result.error);
  };

  if (!pendingEmail) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-12">
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <path d="M4 6 L12 3 L20 6 L20 12 C20 17 16 21 12 22 C8 21 4 17 4 12 Z" fill="#C8FF3D" />
            <path d="M9 11l2.5 3 4-5" stroke="#0A0B0D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="text-[17px] font-semibold">RepFlow</span>
        </div>

        <h1 className="text-[32px] font-semibold tracking-tight">Check your email</h1>
        <p className="text-muted text-sm mt-2">
          We sent a 6-digit code to <span className="text-text font-medium">{pendingEmail}</span>.
        </p>

        <div className="mt-8 flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 text-center text-[22px] font-mono font-semibold rounded-[10px] bg-surface border border-hairline focus:border-accent focus:outline-none"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {error && <p className="text-[13px] text-bad mt-4" role="alert">{error}</p>}
        {resendMsg && <p className="text-[13px] text-good mt-4">{resendMsg}</p>}

        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-6"
          disabled={code.length !== 6 || isLoading}
          onClick={() => submit()}
        >
          {isLoading ? 'Verifying…' : 'Verify'}
        </Button>

        <p className="text-center text-[13px] text-muted mt-6">
          Didn't get the code?{' '}
          <button onClick={handleResend} className="text-accent font-semibold">Resend</button>
        </p>

        <p className="text-center text-[13px] text-muted mt-3">
          <Link to="/signup" className="text-accent font-semibold">Use a different email</Link>
        </p>
      </motion.div>
    </div>
  );
}
