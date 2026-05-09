import { mockWeeklyPlan } from '../utils/mockData';

// TODO: Replace with actual API call
export const getWeeklyPlan = async (weekNumber) => {
  // return api.get(`/plans/weekly/${weekNumber}`);
  return Promise.resolve({ data: mockWeeklyPlan });
};

// TODO: Replace with actual API call
export const regeneratePlan = async () => {
  // return api.post('/plans/regenerate');
  return Promise.resolve({ data: mockWeeklyPlan });
};

// TODO: Replace with actual API call
export const getDayDetail = async (dayId) => {
  // return api.get(`/plans/days/${dayId}`);
  const day = mockWeeklyPlan.days.find((d) => d.id === dayId);
  return Promise.resolve({ data: day });
};
