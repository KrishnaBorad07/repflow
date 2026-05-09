import { mockProgressData, mockWorkoutHistory, mockWeeklyStats } from '../utils/mockData';

// TODO: Replace with actual API call
export const getProgressData = async () => {
  // return api.get('/progress');
  return Promise.resolve({ data: mockProgressData });
};

// TODO: Replace with actual API call
export const getWeeklyStats = async () => {
  // return api.get('/progress/weekly');
  return Promise.resolve({ data: mockWeeklyStats });
};

// TODO: Replace with actual API call
export const getWorkoutHistory = async () => {
  // return api.get('/progress/history');
  return Promise.resolve({ data: mockWorkoutHistory });
};
