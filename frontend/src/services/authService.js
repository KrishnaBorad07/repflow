import { mockUser } from '../utils/mockData';

// TODO: Replace with actual API call
export const login = async (email, password) => {
  // return api.post('/auth/login', { email, password });
  return Promise.resolve({ data: { user: mockUser, token: 'mock_jwt_token' } });
};

// TODO: Replace with actual API call
export const signup = async (userData) => {
  // return api.post('/auth/signup', userData);
  return Promise.resolve({ data: { user: { ...mockUser, ...userData }, token: 'mock_jwt_token' } });
};

// TODO: Replace with actual API call
export const logout = async () => {
  // return api.post('/auth/logout');
  return Promise.resolve({ data: { success: true } });
};

// TODO: Replace with actual API call
export const getMe = async () => {
  // return api.get('/auth/me');
  return Promise.resolve({ data: mockUser });
};
