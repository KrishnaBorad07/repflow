import { mockExercises } from '../utils/mockData';

// TODO: Replace with actual API call
export const getExercises = async (filters = {}) => {
  // return api.get('/exercises', { params: filters });
  let results = [...mockExercises];
  if (filters.muscle) results = results.filter((e) => e.muscle === filters.muscle);
  if (filters.difficulty) results = results.filter((e) => e.difficulty === filters.difficulty);
  if (filters.equipment) results = results.filter((e) => e.equipment === filters.equipment);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((e) => e.name.toLowerCase().includes(q));
  }
  return Promise.resolve({ data: results });
};

// TODO: Replace with actual API call
export const getExerciseById = async (id) => {
  // return api.get(`/exercises/${id}`);
  const exercise = mockExercises.find((e) => e.id === id);
  return Promise.resolve({ data: exercise });
};
