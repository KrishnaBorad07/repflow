import api from './api';

export const getWeeklyPlan = async () => {
  return api.get('/plans/current');
};

export const generatePlan = async (userProfile) => {
  return api.post('/plans/generate', userProfile);
};

export const regeneratePlan = async (tweaks = {}) => {
  return api.post('/plans/regenerate', tweaks);
};

export const getDayDetail = async (planId, dayId) => {
  return api.get(`/plans/${planId}/days/${dayId}`);
};
