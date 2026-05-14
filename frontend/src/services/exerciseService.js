import exercisesData from '../data/exercises.json';

/**
 * Image base URL — served via jsDelivr CDN (caches GitHub raw content).
 * Falls back to raw.githubusercontent.com if needed.
 */
const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';

/**
 * Map free-exercise-db muscle names → RepFlow muscle groups
 */
const MUSCLE_MAP = {
  chest: 'Chest',
  lats: 'Back',
  'middle back': 'Back',
  'lower back': 'Back',
  traps: 'Back',
  quadriceps: 'Legs',
  hamstrings: 'Legs',
  glutes: 'Legs',
  calves: 'Legs',
  abductors: 'Legs',
  adductors: 'Legs',
  shoulders: 'Shoulders',
  neck: 'Shoulders',
  biceps: 'Arms',
  triceps: 'Arms',
  forearms: 'Arms',
  abdominals: 'Core',
};

/**
 * Map free-exercise-db equipment names → display names
 */
const EQUIPMENT_MAP = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  'body only': 'Bodyweight',
  cable: 'Cable',
  machine: 'Machine',
  kettlebells: 'Kettlebell',
  bands: 'Band',
  'e-z curl bar': 'EZ Bar',
  'exercise ball': 'Exercise Ball',
  'foam roll': 'Foam Roller',
  'medicine ball': 'Medicine Ball',
  other: 'Other',
  '': 'Other',
};

/**
 * Map free-exercise-db level → display names
 */
const LEVEL_MAP = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Advanced',
};

/**
 * Transform a raw exercise from free-exercise-db into RepFlow's shape.
 */
function transformExercise(raw) {
  const primaryMuscle = raw.primaryMuscles?.[0] || '';
  const muscleGroup = MUSCLE_MAP[primaryMuscle] || 'Other';

  const secondaryMuscles = (raw.secondaryMuscles || [])
    .map((m) => MUSCLE_MAP[m])
    .filter(Boolean)
    .filter((m, i, arr) => arr.indexOf(m) === i && m !== muscleGroup);

  // Resolve images: custom exercises may have a customImageUrl (e.g. Wikimedia GIF)
  // or custom/ prefixed paths that don't live on the free-exercise-db CDN.
  const images = raw.customImageUrl
    ? [raw.customImageUrl]
    : (raw.images || []).map((img) =>
        img.startsWith('custom/') ? null : `${IMAGE_BASE}/${img}`
      ).filter(Boolean);

  return {
    id: raw.id,
    name: raw.name,
    muscle: muscleGroup,
    primaryMuscleRaw: primaryMuscle,
    secondaryMuscles,
    secondaryMusclesRaw: raw.secondaryMuscles || [],
    difficulty: LEVEL_MAP[raw.level] || 'Intermediate',
    equipment: EQUIPMENT_MAP[raw.equipment] || raw.equipment || 'Other',
    category: raw.category || 'strength',
    force: raw.force,
    mechanic: raw.mechanic,
    description: (raw.instructions || []).join(' '),
    instructions: raw.instructions || [],
    images,
    // GIF / animation URL (Wikimedia, Pixabay, etc.)
    gifUrl: raw.customImageUrl || null,
    // YouTube tutorial
    tutorialUrl: raw.tutorialUrl || null,
    tutorialTitle: raw.tutorialTitle || null,
    tutorialChannel: raw.tutorialChannel || null,
    // Defaults for workout context (overridden by plan data)
    sets: 3,
    reps: raw.category === 'stretching' ? '30s' : '10',
    restSeconds: 60,
    weight: 0,
  };
}

/** Full transformed dataset (computed once) */
let _allExercises = null;
function getAllExercises() {
  if (!_allExercises) {
    _allExercises = exercisesData.map(transformExercise);
  }
  return _allExercises;
}

/**
 * Get exercises with optional filters.
 * Mirrors the old mock API signature.
 */
export const getExercises = async (filters = {}) => {
  let results = getAllExercises();

  if (filters.muscle) {
    results = results.filter((e) => e.muscle === filters.muscle);
  }
  if (filters.difficulty) {
    results = results.filter((e) => e.difficulty === filters.difficulty);
  }
  if (filters.equipment) {
    results = results.filter((e) => e.equipment === filters.equipment);
  }
  if (filters.category) {
    results = results.filter((e) => e.category === filters.category);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.primaryMuscleRaw.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q)
    );
  }

  return { data: results };
};

/**
 * Get a single exercise by ID.
 */
export const getExerciseById = async (id) => {
  const exercise = getAllExercises().find((e) => e.id === id);
  return { data: exercise || null };
};

/**
 * Get all unique muscle groups in the dataset.
 */
export const getMuscleGroups = () => {
  return ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
};

/**
 * Get all unique equipment types in the dataset.
 */
export const getEquipmentTypes = () => {
  const types = new Set(getAllExercises().map((e) => e.equipment));
  return [...types].sort();
};

/**
 * Search exercises by name (for autocomplete / quick search).
 */
/**
 * Find the best-matching library exercise by name.
 * Used to bridge backend plan exercises → library detail pages.
 * Returns the exercise object or null.
 */
export const findExerciseByName = (name) => {
  if (!name) return null;
  const q = name.toLowerCase().replace(/[-_]/g, ' ').trim();
  const all = getAllExercises();

  // 1. Exact match (case-insensitive)
  let match = all.find((e) => e.name.toLowerCase() === q);
  if (match) return match;

  // 2. One name contains the other
  match = all.find(
    (e) =>
      e.name.toLowerCase().includes(q) || q.includes(e.name.toLowerCase())
  );
  if (match) return match;

  // 3. Token overlap — pick the exercise sharing the most words
  const qTokens = q.split(/\s+/);
  let best = null;
  let bestScore = 0;
  for (const e of all) {
    const eTokens = e.name.toLowerCase().split(/\s+/);
    const overlap = qTokens.filter((t) => eTokens.includes(t)).length;
    const score = overlap / Math.max(qTokens.length, eTokens.length);
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }
  return bestScore >= 0.4 ? best : null;
};

export const searchExercises = async (query, limit = 10) => {
  if (!query || query.length < 2) return { data: [] };
  const q = query.toLowerCase();
  const results = getAllExercises()
    .filter((e) => e.name.toLowerCase().includes(q))
    .slice(0, limit);
  return { data: results };
};
