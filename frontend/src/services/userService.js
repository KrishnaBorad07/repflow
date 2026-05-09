import { mockUser } from '../utils/mockData';

// TODO: Replace with actual API call
export const getUserProfile = async () => {
  // return api.get('/users/me');
  return Promise.resolve({ data: mockUser });
};

// TODO: Replace with actual API call
export const updateUserProfile = async (updates) => {
  // return api.patch('/users/me', updates);
  return Promise.resolve({ data: { ...mockUser, ...updates } });
};

// TODO: Replace with actual API call
export const updatePreferences = async (preferences) => {
  // return api.patch('/users/me/preferences', preferences);
  return Promise.resolve({ data: { ...mockUser.preferences, ...preferences } });
};
