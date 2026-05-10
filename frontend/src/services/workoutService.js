import api from './api';

/**
 * Begin a workout session on the backend.
 * @param {{plan_day_id?: string, workout_name?: string}} payload
 * @returns {Promise<WorkoutSummary>}
 */
export const startWorkout = async (payload = {}) => {
  const { data } = await api.post('/workouts/start', payload);
  return data;
};

/**
 * Append a completed set to an active session.
 * @param {number|string} sessionId
 * @param {object} setData — see SetLogRequest schema
 */
export const logSet = async (sessionId, setData) => {
  const { data } = await api.post(`/workouts/${sessionId}/sets`, setData);
  return data;
};

/**
 * Finalize a session — backend computes duration, volume, avg form, calories.
 * @param {number|string} sessionId
 * @param {{rpe?: number}} payload
 */
export const endWorkout = async (sessionId, payload = {}) => {
  const { data } = await api.post(`/workouts/${sessionId}/end`, payload);
  return data;
};

/**
 * Paginated finalized workouts, newest first.
 */
export const getWorkoutHistory = async (limit = 20, offset = 0) => {
  const { data } = await api.get('/workouts/history', { params: { limit, offset } });
  return data;
};

/**
 * Single session detail with all sets.
 */
export const getSession = async (sessionId) => {
  const { data } = await api.get(`/workouts/${sessionId}`);
  return data;
};
