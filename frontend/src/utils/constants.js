export const APP_NAME = 'RepFlow';

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  PLAN: '/plan',
  PLAN_DAY: '/plan/:dayId',
  WORKOUT: '/workout/:sessionId',
  PROGRESS: '/progress',
  LIBRARY: '/library',
  EXERCISE_DETAIL: '/library/:exerciseId',
  CHAT: '/chat',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  QUICK_WORKOUT: '/quick-workout',
};

export const FITNESS_GOALS = [
  { id: 'fat-loss', emoji: '🔥', label: 'Lose fat', description: 'Burn calories and lean out' },
  { id: 'muscle-gain', emoji: '💪', label: 'Build muscle', description: 'Get bigger and stronger' },
  { id: 'endurance', emoji: '🏃', label: 'Improve endurance', description: 'Better stamina and cardio' },
  { id: 'general', emoji: '🧘', label: 'General fitness', description: 'Stay healthy and active' },
  { id: 'flexibility', emoji: '🤸', label: 'Flexibility & mobility', description: 'Move better, feel better' },
];

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', level: '1', label: 'Beginner', description: 'New to working out or returning' },
  { id: 'intermediate', level: '2', label: 'Intermediate', description: 'Consistent training for 6+ months' },
  { id: 'advanced', level: '3', label: 'Advanced', description: '2+ years of structured training' },
];

export const EQUIPMENT_OPTIONS = [
  { id: 'none', label: 'No equipment', description: 'Bodyweight only' },
  { id: 'basic', label: 'Basic home', description: 'Dumbbells, bands, pull-up bar' },
  { id: 'full-gym', label: 'Full gym', description: 'Barbells, machines, cables' },
];

export const DAYS_PER_WEEK = [2, 3, 4, 5, 6];
export const SESSION_LENGTHS = ['15 min', '30 min', '45 min', '60 min', '90 min'];
export const PREFERRED_TIMES = ['Morning', 'Lunch', 'Evening', 'Anytime'];

export const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const EQUIPMENT_TYPES = ['Barbell', 'Dumbbell', 'Bodyweight', 'Cable', 'Machine', 'Kettlebell', 'Band'];
