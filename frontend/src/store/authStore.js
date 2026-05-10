import { create } from 'zustand';
import {
  login as loginRequest,
  requestSignup,
  verifyOtp as verifyOtpRequest,
  resendOtp as resendOtpRequest,
  googleLogin as googleLoginRequest,
  forgotPassword as forgotPasswordRequest,
  getMe,
  logout as logoutRequest,
  getToken,
  clearToken,
} from '../services/authService';

/**
 * Shape the raw backend user (snake_case fields, missing UI helpers) into
 * what the rest of the app expects on `state.user`.
 */
function shapeUser(raw) {
  if (!raw) return null;
  const initials = raw.name
    ? raw.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';
  const memberSince = raw.member_since
    ? new Date(raw.member_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'New member';
  return {
    ...raw,
    initials,
    memberSince,
    // Stats placeholders until workout history lands (Section 2)
    totalWorkouts: 0,
    totalHours: 0,
    streak: 0,
    totalVolumeKg: 0,
  };
}

/** Pull the user-facing message out of an axios error. */
function extractError(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) return detail[0]?.msg || fallback;
  return detail || err?.message || fallback;
}

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /** Email currently going through the OTP flow (used by VerifyEmailPage). */
  pendingEmail: null,

  /**
   * Run once on app start.
   * - If we have a token, hit /auth/me. Success → log in. Failure → drop token.
   * - If we don't, do nothing (user goes through PublicRoute → /login).
   */
  bootstrap: async () => {
    const token = getToken();
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await getMe();
      set({ user: shapeUser(res.data), isAuthenticated: true, isLoading: false });
    } catch (err) {
      clearToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginRequest(email, password);
      set({ user: shapeUser(res.data.user), isAuthenticated: true, isLoading: false });
      return { ok: true };
    } catch (err) {
      const message = extractError(err, 'Login failed. Please try again.');
      set({ isLoading: false, error: message });
      return { ok: false, error: message };
    }
  },

  /**
   * Step 1 of signup. Stores the email locally so VerifyEmailPage knows
   * which account it's verifying. Does NOT log the user in.
   */
  startSignup: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    try {
      await requestSignup({ name, email, password });
      set({ pendingEmail: email.toLowerCase(), isLoading: false });
      return { ok: true };
    } catch (err) {
      const message = extractError(err, 'Signup failed. Please try again.');
      set({ isLoading: false, error: message });
      return { ok: false, error: message };
    }
  },

  /** Step 2 of signup. On success the user is logged in. */
  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await verifyOtpRequest(email, otp);
      set({
        user: shapeUser(res.data.user),
        isAuthenticated: true,
        isLoading: false,
        pendingEmail: null,
      });
      return { ok: true };
    } catch (err) {
      const message = extractError(err, 'Verification failed.');
      set({ isLoading: false, error: message });
      return { ok: false, error: message };
    }
  },

  resendOtp: async (email) => {
    try {
      const res = await resendOtpRequest(email);
      return { ok: true, message: res.data?.message };
    } catch (err) {
      return { ok: false, error: extractError(err, 'Could not resend code.') };
    }
  },

  /**
   * Google sign-in. `credential` is the id_token JWT from
   * @react-oauth/google's <GoogleLogin onSuccess={r => r.credential}>.
   */
  googleLogin: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const res = await googleLoginRequest(credential);
      set({ user: shapeUser(res.data.user), isAuthenticated: true, isLoading: false });
      return { ok: true, user: res.data.user };
    } catch (err) {
      const message = extractError(err, 'Google sign-in failed.');
      set({ isLoading: false, error: message });
      return { ok: false, error: message };
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await forgotPasswordRequest(email);
      return { ok: true, message: res.data?.message };
    } catch (err) {
      return { ok: false, error: extractError(err, 'Request failed.') };
    }
  },

  logout: async () => {
    await logoutRequest();
    set({ user: null, isAuthenticated: false, error: null, pendingEmail: null });
  },

  refreshUser: async () => {
    try {
      const res = await getMe();
      set({ user: shapeUser(res.data) });
    } catch (err) {
      // 401 is handled by the axios interceptor.
    }
  },

  updateProfile: (updates) => {
    set((state) => ({ user: state.user ? { ...state.user, ...updates } : null }));
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
