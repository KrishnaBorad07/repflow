import api from './api';

export const getUserProfile = async () => {
  return api.get('/users/profile');
};

export const saveOnboarding = async (data) => {
  return api.post('/users/onboarding', data);
};

export const updateUserProfile = async (updates) => {
  return api.put('/users/profile', updates);
};

export const updatePreferences = async (preferences) => {
  return api.put('/users/preferences', preferences);
};
