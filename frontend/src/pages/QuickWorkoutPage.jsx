import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, Clock, Dumbbell } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Chip from '../components/common/Chip';
import { MUSCLE_GROUPS, SESSION_LENGTHS, EQUIPMENT_OPTIONS } from '../utils/constants';
import { mockExercises } from '../utils/mockData';
import useWorkoutStore from '../store/workoutStore';

// Group 1 owns real /api/plans/quick generation. Until that ships, build the
// session locally from a couple of mockExercises so the rest of the workout
// flow can be exercised end-to-end.
const quickTemplates = [
  {
    id: 'qt_1',
    name: 'Full Body Blast',
    duration: '30 min',
    muscles: 'Full Body',
    icon: Zap,
    exerciseIds: ['ex_013', 'ex_001', 'ex_007', 'ex_011', 'ex_017', 'ex_021'],
  },
  {
    id: 'qt_2',
    name: 'Upper Body Push',
    duration: '25 min',
    muscles: 'Chest · Shoulders',
    icon: Dumbbell,
    exerciseIds: ['ex_001', 'ex_003', 'ex_004', 'ex_005', 'ex_019'],
  },
  {
    id: 'qt_3',
    name: 'Core & Cardio',
    duration: '20 min',
    muscles: 'Core · Cardio',
    icon: Clock,
    exerciseIds: ['ex_021', 'ex_018', 'ex_017', 'ex_019'],
  },
];

export default function QuickWorkoutPage() {
  const navigate = useNavigate();
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [selectedEquipment, setSelectedEquipment] = useState('full-gym');
  const { beginWorkout, isStarting } = useWorkoutStore();

  const toggleMuscle = (muscle) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const startTemplate = async (template) => {
    const exercises = template.exerciseIds
      .map((id) => mockExercises.find((e) => e.id === id))
      .filter(Boolean);

    try {
      const sessionId = await beginWorkout({
        plan_day_id: null,
        name: template.name,
        exercises,
      });
      navigate(`/workout/${sessionId}`);
    } catch (err) {
      console.error('Failed to start quick workout:', err);
    }
  };

  const startCustom = async () => {
    // Pick exercises whose primary muscle matches user selection;
    // fall back to a balanced set if nothing matches.
    let exercises = mockExercises.filter((e) =>
      selectedMuscles.some((m) => e.muscle?.toLowerCase().includes(m.toLowerCase()))
    );
    if (!exercises.length) exercises = mockExercises.slice(0, 5);
    exercises = exercises.slice(0, 6);

    try {
      const sessionId = await beginWorkout({
        plan_day_id: null,
        name: `Quick ${selectedDuration}`,
        exercises,
      });
      navigate(`/workout/${sessionId}`);
    } catch (err) {
      console.error('Failed to start quick workout:', err);
    }
  };

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[800px] lg:mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Quick Workout</h1>
          <p className="text-xs text-muted mt-0.5">Generate an AI-powered workout</p>
        </div>
      </div>

      {/* Quick templates */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold mb-2.5">Quick start</h3>
        <div className="space-y-2">
          {quickTemplates.map((template) => {
            const { id, name, duration, muscles, exerciseIds, icon: Icon } = template;
            return (
              <Card key={id} className="p-4 flex items-center gap-3.5 cursor-pointer" onClick={() => startTemplate(template)}>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Icon size={18} className="text-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-muted mt-0.5">{muscles} · {duration} · {exerciseIds.length} exercises</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom builder */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold mb-2.5">Or build your own</h3>

        <div className="mb-4">
          <label className="text-xs text-muted mb-2 block">Target muscles</label>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_GROUPS.map((muscle) => (
              <Chip key={muscle} active={selectedMuscles.includes(muscle)} onClick={() => toggleMuscle(muscle)}>
                {muscle}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-muted mb-2 block">Duration</label>
          <div className="flex flex-wrap gap-1.5">
            {SESSION_LENGTHS.map((len) => (
              <Chip key={len} active={selectedDuration === len} onClick={() => setSelectedDuration(len)}>
                {len}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs text-muted mb-2 block">Equipment</label>
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <Chip key={eq.id} active={selectedEquipment === eq.id} onClick={() => setSelectedEquipment(eq.id)}>
                {eq.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <Button variant="primary" size="lg" fullWidth onClick={startCustom} disabled={isStarting}>
        <Zap size={16} /> {isStarting ? 'Starting…' : 'Generate workout'}
      </Button>
    </div>
  );
}
