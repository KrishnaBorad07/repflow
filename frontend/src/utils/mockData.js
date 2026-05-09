export const mockUser = {
  id: 'usr_001',
  name: 'Jash Patel',
  email: 'jash@example.com',
  initials: 'JP',
  avatar: null,
  goal: 'Build Muscle',
  level: 'Intermediate',
  memberSince: 'Feb 2026',
  plan: 'Pro',
  week: 3,
  streak: 12,
  totalWorkouts: 78,
  totalHours: 62,
  totalVolumeKg: 284000,
  preferences: {
    daysPerWeek: 4,
    sessionLength: '45 min',
    preferredTime: 'Evening',
    equipment: 'full-gym',
    workoutStyles: ['strength', 'HIIT'],
    priorityMuscles: ['Chest', 'Back'],
  },
};

export const mockExercises = [
  { id: 'ex_001', name: 'Barbell Bench Press', muscle: 'Chest', secondaryMuscles: ['Triceps', 'Shoulders'], difficulty: 'Intermediate', equipment: 'Barbell', description: 'Lie on a flat bench and press the barbell from chest to full arm extension.', sets: 4, reps: 10, restSeconds: 90, weight: 60 },
  { id: 'ex_002', name: 'Incline Dumbbell Press', muscle: 'Chest', secondaryMuscles: ['Shoulders', 'Triceps'], difficulty: 'Intermediate', equipment: 'Dumbbell', description: 'Press dumbbells upward on an incline bench set to 30-45 degrees.', sets: 3, reps: 12, restSeconds: 75, weight: 22.5 },
  { id: 'ex_003', name: 'Overhead Shoulder Press', muscle: 'Shoulders', secondaryMuscles: ['Triceps'], difficulty: 'Intermediate', equipment: 'Barbell', description: 'Press the barbell overhead from shoulder height to full arm extension.', sets: 4, reps: 8, restSeconds: 90, weight: 40 },
  { id: 'ex_004', name: 'Lateral Raises', muscle: 'Shoulders', secondaryMuscles: ['Traps'], difficulty: 'Beginner', equipment: 'Dumbbell', description: 'Raise dumbbells to the sides until arms are parallel to the floor.', sets: 3, reps: 15, restSeconds: 60, weight: 8 },
  { id: 'ex_005', name: 'Triceps Rope Pushdown', muscle: 'Arms', secondaryMuscles: [], difficulty: 'Beginner', equipment: 'Cable', description: 'Push the rope attachment down from chest height until arms are fully extended.', sets: 3, reps: 12, restSeconds: 60, weight: 25 },
  { id: 'ex_006', name: 'Cable Chest Fly', muscle: 'Chest', secondaryMuscles: ['Shoulders'], difficulty: 'Intermediate', equipment: 'Cable', description: 'Bring cable handles together in front of chest with a slight elbow bend.', sets: 3, reps: 12, restSeconds: 60, weight: 15 },
  { id: 'ex_007', name: 'Pull-ups', muscle: 'Back', secondaryMuscles: ['Biceps', 'Core'], difficulty: 'Intermediate', equipment: 'Bodyweight', description: 'Hang from a bar and pull your body up until chin clears the bar.', sets: 4, reps: 8, restSeconds: 90, weight: 0 },
  { id: 'ex_008', name: 'Barbell Row', muscle: 'Back', secondaryMuscles: ['Biceps', 'Core'], difficulty: 'Intermediate', equipment: 'Barbell', description: 'Hinge at the hips and row the barbell to your lower chest.', sets: 4, reps: 10, restSeconds: 90, weight: 70 },
  { id: 'ex_009', name: 'Seated Cable Row', muscle: 'Back', secondaryMuscles: ['Biceps'], difficulty: 'Beginner', equipment: 'Cable', description: 'Pull the cable handle toward your lower chest while seated.', sets: 3, reps: 12, restSeconds: 75, weight: 50 },
  { id: 'ex_010', name: 'Face Pulls', muscle: 'Shoulders', secondaryMuscles: ['Traps', 'Back'], difficulty: 'Beginner', equipment: 'Cable', description: 'Pull the rope toward your face with elbows high.', sets: 3, reps: 15, restSeconds: 60, weight: 15 },
  { id: 'ex_011', name: 'Barbell Bicep Curl', muscle: 'Arms', secondaryMuscles: [], difficulty: 'Beginner', equipment: 'Barbell', description: 'Curl the barbell from hip height to shoulder height.', sets: 3, reps: 12, restSeconds: 60, weight: 25 },
  { id: 'ex_012', name: 'Hammer Curl', muscle: 'Arms', secondaryMuscles: ['Forearms'], difficulty: 'Beginner', equipment: 'Dumbbell', description: 'Curl dumbbells with neutral grip (palms facing each other).', sets: 3, reps: 12, restSeconds: 60, weight: 14 },
  { id: 'ex_013', name: 'Barbell Squat', muscle: 'Legs', secondaryMuscles: ['Glutes', 'Core'], difficulty: 'Intermediate', equipment: 'Barbell', description: 'Squat down with barbell on upper back until thighs are parallel to floor.', sets: 4, reps: 8, restSeconds: 120, weight: 100 },
  { id: 'ex_014', name: 'Romanian Deadlift', muscle: 'Legs', secondaryMuscles: ['Back', 'Glutes'], difficulty: 'Intermediate', equipment: 'Barbell', description: 'Hinge at the hips with slight knee bend, lowering barbell along the legs.', sets: 4, reps: 10, restSeconds: 90, weight: 80 },
  { id: 'ex_015', name: 'Leg Press', muscle: 'Legs', secondaryMuscles: ['Glutes'], difficulty: 'Beginner', equipment: 'Machine', description: 'Push the platform away by extending your legs.', sets: 3, reps: 12, restSeconds: 90, weight: 160 },
  { id: 'ex_016', name: 'Leg Curl', muscle: 'Legs', secondaryMuscles: [], difficulty: 'Beginner', equipment: 'Machine', description: 'Curl the pad toward your glutes while lying face down.', sets: 3, reps: 12, restSeconds: 60, weight: 35 },
  { id: 'ex_017', name: 'Calf Raises', muscle: 'Legs', secondaryMuscles: [], difficulty: 'Beginner', equipment: 'Machine', description: 'Rise onto the balls of your feet against resistance.', sets: 4, reps: 15, restSeconds: 45, weight: 80 },
  { id: 'ex_018', name: 'Goblet Squat', muscle: 'Legs', secondaryMuscles: ['Core', 'Glutes'], difficulty: 'Beginner', equipment: 'Dumbbell', description: 'Hold a dumbbell at chest height and squat to parallel.', sets: 3, reps: 12, restSeconds: 75, weight: 20 },
  { id: 'ex_019', name: 'Push-ups', muscle: 'Chest', secondaryMuscles: ['Triceps', 'Shoulders', 'Core'], difficulty: 'Beginner', equipment: 'Bodyweight', description: 'Lower your body to the floor and push back up with arms extended.', sets: 3, reps: 15, restSeconds: 60, weight: 0 },
  { id: 'ex_020', name: 'Dumbbell Row', muscle: 'Back', secondaryMuscles: ['Biceps'], difficulty: 'Beginner', equipment: 'Dumbbell', description: 'Row a dumbbell to your hip while supported on a bench.', sets: 3, reps: 12, restSeconds: 60, weight: 22.5 },
  { id: 'ex_021', name: 'Plank', muscle: 'Core', secondaryMuscles: ['Shoulders'], difficulty: 'Beginner', equipment: 'Bodyweight', description: 'Hold a straight body position on forearms and toes.', sets: 3, reps: 1, restSeconds: 60, weight: 0 },
  { id: 'ex_022', name: 'Hip Thrust', muscle: 'Legs', secondaryMuscles: ['Glutes'], difficulty: 'Intermediate', equipment: 'Barbell', description: 'Drive hips upward with upper back on bench, barbell across hips.', sets: 4, reps: 10, restSeconds: 90, weight: 90 },
];

export const mockWeeklyPlan = {
  weekNumber: 3,
  totalWeeks: 8,
  programName: 'Strength Building',
  days: [
    {
      id: 'day_1', dayName: 'Mon', date: 'May 5', label: 'Pull Day',
      muscles: 'Back · Biceps', duration: '42 min', exerciseCount: 6, status: 'done',
      exercises: [
        { ...mockExercises.find(e => e.id === 'ex_007'), order: 1 },
        { ...mockExercises.find(e => e.id === 'ex_008'), order: 2 },
        { ...mockExercises.find(e => e.id === 'ex_009'), order: 3 },
        { ...mockExercises.find(e => e.id === 'ex_010'), order: 4 },
        { ...mockExercises.find(e => e.id === 'ex_011'), order: 5 },
        { ...mockExercises.find(e => e.id === 'ex_012'), order: 6 },
      ],
    },
    {
      id: 'day_2', dayName: 'Tue', date: 'May 6', label: 'Push Day',
      muscles: 'Chest · Shoulders · Triceps', duration: '45 min', exerciseCount: 6, status: 'today',
      exercises: [
        { ...mockExercises.find(e => e.id === 'ex_001'), order: 1 },
        { ...mockExercises.find(e => e.id === 'ex_002'), order: 2 },
        { ...mockExercises.find(e => e.id === 'ex_003'), order: 3 },
        { ...mockExercises.find(e => e.id === 'ex_004'), order: 4 },
        { ...mockExercises.find(e => e.id === 'ex_005'), order: 5 },
        { ...mockExercises.find(e => e.id === 'ex_006'), order: 6 },
      ],
    },
    {
      id: 'day_3', dayName: 'Wed', date: 'May 7', label: 'Legs',
      muscles: 'Quads · Hamstrings · Glutes', duration: '55 min', exerciseCount: 7, status: 'plan',
      exercises: [
        { ...mockExercises.find(e => e.id === 'ex_013'), order: 1 },
        { ...mockExercises.find(e => e.id === 'ex_014'), order: 2 },
        { ...mockExercises.find(e => e.id === 'ex_015'), order: 3 },
        { ...mockExercises.find(e => e.id === 'ex_016'), order: 4 },
        { ...mockExercises.find(e => e.id === 'ex_022'), order: 5 },
        { ...mockExercises.find(e => e.id === 'ex_017'), order: 6 },
        { ...mockExercises.find(e => e.id === 'ex_021'), order: 7 },
      ],
    },
    {
      id: 'day_4', dayName: 'Thu', date: 'May 8', label: 'Rest',
      muscles: 'Mobility & recovery', duration: '15 min', exerciseCount: 0, status: 'rest',
      exercises: [],
    },
    {
      id: 'day_5', dayName: 'Fri', date: 'May 9', label: 'Upper',
      muscles: 'Chest · Back', duration: '48 min', exerciseCount: 6, status: 'plan',
      exercises: [
        { ...mockExercises.find(e => e.id === 'ex_001'), order: 1, weight: 62.5 },
        { ...mockExercises.find(e => e.id === 'ex_007'), order: 2 },
        { ...mockExercises.find(e => e.id === 'ex_003'), order: 3 },
        { ...mockExercises.find(e => e.id === 'ex_020'), order: 4 },
        { ...mockExercises.find(e => e.id === 'ex_005'), order: 5 },
        { ...mockExercises.find(e => e.id === 'ex_011'), order: 6 },
      ],
    },
    {
      id: 'day_6', dayName: 'Sat', date: 'May 10', label: 'Lower',
      muscles: 'Glutes · Hamstrings', duration: '50 min', exerciseCount: 6, status: 'plan',
      exercises: [
        { ...mockExercises.find(e => e.id === 'ex_014'), order: 1 },
        { ...mockExercises.find(e => e.id === 'ex_022'), order: 2 },
        { ...mockExercises.find(e => e.id === 'ex_015'), order: 3 },
        { ...mockExercises.find(e => e.id === 'ex_016'), order: 4 },
        { ...mockExercises.find(e => e.id === 'ex_017'), order: 5 },
        { ...mockExercises.find(e => e.id === 'ex_018'), order: 6 },
      ],
    },
    {
      id: 'day_7', dayName: 'Sun', date: 'May 11', label: 'Rest',
      muscles: 'Full recovery', duration: '—', exerciseCount: 0, status: 'rest',
      exercises: [],
    },
  ],
};

export const mockWorkoutHistory = [
  { id: 'wh_001', date: '2026-05-05', name: 'Pull Day', duration: 42, volume: 4820, formScore: 8.4, exercises: 6, setsCompleted: 20 },
  { id: 'wh_002', date: '2026-05-04', name: 'Legs', duration: 58, volume: 8200, formScore: 8.0, exercises: 7, setsCompleted: 24 },
  { id: 'wh_003', date: '2026-05-03', name: 'Push Day', duration: 46, volume: 4650, formScore: 8.5, exercises: 6, setsCompleted: 20 },
  { id: 'wh_004', date: '2026-05-01', name: 'Pull Day', duration: 44, volume: 4720, formScore: 8.3, exercises: 6, setsCompleted: 20 },
  { id: 'wh_005', date: '2026-04-30', name: 'Push Day', duration: 45, volume: 4580, formScore: 8.1, exercises: 6, setsCompleted: 20 },
  { id: 'wh_006', date: '2026-04-28', name: 'Legs', duration: 56, volume: 7900, formScore: 7.8, exercises: 7, setsCompleted: 24 },
  { id: 'wh_007', date: '2026-04-27', name: 'Upper', duration: 48, volume: 5100, formScore: 8.2, exercises: 6, setsCompleted: 20 },
  { id: 'wh_008', date: '2026-04-25', name: 'Lower', duration: 50, volume: 7600, formScore: 8.0, exercises: 6, setsCompleted: 22 },
  { id: 'wh_009', date: '2026-04-24', name: 'Pull Day', duration: 40, volume: 4500, formScore: 8.1, exercises: 6, setsCompleted: 20 },
  { id: 'wh_010', date: '2026-04-23', name: 'Push Day', duration: 44, volume: 4400, formScore: 7.9, exercises: 6, setsCompleted: 20 },
];

export const mockProgressData = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  benchPress: 50 + i * 2.5,
  squat: 80 + i * 3,
  deadlift: 90 + i * 3.5,
  ohp: 30 + i * 1.5,
  volume: 10000 + i * 800 + Math.random() * 500,
  formScore: 7.2 + i * 0.15 + Math.random() * 0.2,
  workouts: 3 + Math.floor(Math.random() * 2),
}));

export const mockAchievements = [
  { id: 'ach_001', name: '10-day streak', icon: '🔥', earned: true, date: '2026-04-28' },
  { id: 'ach_002', name: 'First PR', icon: '🏆', earned: true, date: '2026-03-15' },
  { id: 'ach_003', name: 'Form Master', icon: '🎯', earned: true, date: '2026-04-20' },
  { id: 'ach_004', name: '100 workouts', icon: '💯', earned: false, progress: 78 },
  { id: 'ach_005', name: 'Heavy hitter', icon: '🏋️', earned: false, progress: 60 },
  { id: 'ach_006', name: 'Early bird', icon: '☀️', earned: false, progress: 30 },
  { id: 'ach_007', name: '30-day streak', icon: '🔥', earned: false, progress: 40 },
  { id: 'ach_008', name: 'Try 10 exercises', icon: '🧪', earned: true, date: '2026-03-22' },
  { id: 'ach_009', name: 'Perfect session', icon: '✨', earned: false, progress: 85 },
];

export const mockChatMessages = [
  { id: 'msg_001', role: 'assistant', content: "How's training been? I noticed you hit a new bench PR — nice work.", timestamp: '2026-05-05T10:30:00' },
  { id: 'msg_002', role: 'user', content: 'Yeah but my squat is stalling. Been at 100kg for 3 weeks.', timestamp: '2026-05-05T10:31:00' },
  {
    id: 'msg_003', role: 'assistant', timestamp: '2026-05-05T10:31:30',
    content: "I see it in your last 6 sessions. Your form score dropped from 8.4 to 7.6 below parallel — likely fatigue.",
    suggestion: {
      title: 'SUGGESTED CHANGE',
      body: 'Drop to 92.5kg, add 1 set, focus on tempo (3-second descent).',
      actionLabel: 'Apply to next session',
    },
  },
  { id: 'msg_004', role: 'user', content: "That makes sense. I've been feeling heavy at the bottom.", timestamp: '2026-05-05T10:32:00' },
  { id: 'msg_005', role: 'assistant', content: "Exactly. Tempo work at 92.5kg will strengthen the bottom position and rebuild confidence in depth. Try it for 2 weeks and we'll reassess. Your RDL is strong at 80kg which means the posterior chain isn't the issue — it's positioning under fatigue.", timestamp: '2026-05-05T10:32:30' },
];

export const mockWeeklySummary = "This week you completed 3 of 5 planned sessions. Your bench press volume increased 8% over last week, and your form score on Romanian deadlifts improved from 7.8 to 8.2. You've been consistent with upper body work but missed your second leg day — consider swapping Wednesday's rest day to stay on track. Overall, you're progressing well toward your strength goal.";

export const mockWeekDots = [
  { day: 'M', status: 'done' },
  { day: 'T', status: 'today' },
  { day: 'W', status: 'plan' },
  { day: 'T', status: 'plan' },
  { day: 'F', status: 'plan' },
  { day: 'S', status: 'rest' },
  { day: 'S', status: 'rest' },
];

export const mockHeatmapData = [
  0, 0.2, 0.5, 0.85, 1, 0.6, 0.3,
  0.5, 0, 1, 0.7, 0.85, 0.4, 0,
  0, 1, 0.6, 0.85, 0.7, 0.4, 0,
  0.3, 0, 0.5, 0.6, 0, 0, 0,
  0.85, 0.7, 1, 0.5, 0, 0, 0,
];

export const mockMuscleBalance = {
  labels: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
  data: [0.95, 0.55, 0.85, 0.7, 0.65, 0.5],
};

export const mockWeeklyStats = {
  volume: { value: '12,450', unit: 'kg', delta: '+8%', up: true },
  workouts: { value: '3', unit: 'of 5', delta: '−1', up: false },
  formAvg: { value: '8.2', unit: '/10', delta: '+0.3', up: true },
  time: { value: '2:18', unit: 'hrs', delta: '+12m', up: true },
};
