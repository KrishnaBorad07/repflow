import api from './api';

/**
 * All endpoints below match backend/app/api/auth.py.
 * The axios instance in api.js attaches `Authorization: Bearer <token>`
 * from localStorage on every request — we just have to STORE the token here.
 */

const TOKEN_KEY = 'repflow_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);


// ─── Login (already-verified user) ───
export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  if (res.data?.access_token) setToken(res.data.access_token);
  return res;
};

// ─── Signup step 1 — request OTP. Returns 202, NO token yet. ───
export const requestSignup = async ({ name, email, password }) => {
  return api.post('/auth/signup', { name, email, password });
};

// ─── Signup step 2 — verify OTP, account is created here. Returns token. ───
export const verifyOtp = async (email, otp) => {
  const res = await api.post('/auth/verify-otp', { email, otp });
  if (res.data?.access_token) setToken(res.data.access_token);
  return res;
};

// ─── Resend OTP for an existing pending signup ───
export const resendOtp = async (email) => {
  return api.post('/auth/resend-otp', { email });
};

// ─── Google OAuth — `idToken` comes from Google Identity Services ───
export const googleLogin = async (idToken) => {
  const res = await api.post('/auth/google', { id_token: idToken });
  if (res.data?.access_token) setToken(res.data.access_token);
  return res;
};

export const guestLogin = async () => {
  const res = await api.post('/auth/guest');
  if (res.data?.access_token) setToken(res.data.access_token);
  return res;
};

export const forgotPassword = async (email) => {
  return api.post('/auth/forgot-password', { email });
};

export const getMe = async () => {
  return api.get('/auth/me');
};

export const logout = async () => {
  // Stateless JWT — there's nothing to call on the server. Just drop the token.
  clearToken();
  return { data: { success: true } };
};
