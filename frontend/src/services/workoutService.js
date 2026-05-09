import { mockWorkoutHistory } from '../utils/mockData';

// TODO: Replace with actual API call
export const startWorkout = async (dayId) => {
  // return api.post(`/workouts/start`, { dayId });
  return Promise.resolve({ data: { sessionId: 'ws_' + Date.now() } });
};

// TODO: Replace with actual API call
export const logSet = async (sessionId, setData) => {
  // return api.post(`/workouts/${sessionId}/sets`, setData);
  return Promise.resolve({ data: { success: true } });
};

// TODO: Replace with actual API call
export const endWorkout = async (sessionId) => {
  // return api.post(`/workouts/${sessionId}/end`);
  return Promise.resolve({ data: { duration: 46, volume: 4820, formScore: 8.3, calories: 412 } });
};

// TODO: Replace with actual API call
export const getWorkoutHistory = async () => {
  // return api.get('/workouts/history');
  return Promise.resolve({ data: mockWorkoutHistory });
};
