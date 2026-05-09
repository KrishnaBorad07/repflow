import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, Clock, Dumbbell } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Chip from '../components/common/Chip';
import { MUSCLE_GROUPS, SESSION_LENGTHS, EQUIPMENT_OPTIONS } from '../utils/constants';

const quickTemplates = [
  { id: 'qt_1', name: 'Full Body Blast', duration: '30 min', muscles: 'Full Body', exercises: 6, icon: Zap },
  { id: 'qt_2', name: 'Upper Body Push', duration: '25 min', muscles: 'Chest · Shoulders', exercises: 5, icon: Dumbbell },
  { id: 'qt_3', name: 'Core & Cardio', duration: '20 min', muscles: 'Core · Cardio', exercises: 4, icon: Clock },
];

export default function QuickWorkoutPage() {
  const navigate = useNavigate();
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [selectedEquipment, setSelectedEquipment] = useState('full-gym');

  const toggleMuscle = (muscle) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
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
          {quickTemplates.map(({ id, name, duration, muscles, exercises, icon: Icon }) => (
            <Card key={id} className="p-4 flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/workout/quick')}>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Icon size={18} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-xs text-muted mt-0.5">{muscles} · {duration} · {exercises} exercises</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom builder */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold mb-2.5">Or build your own</h3>

        {/* Muscle groups */}
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

        {/* Duration */}
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

        {/* Equipment */}
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

      <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/workout/quick')}>
        <Zap size={16} /> Generate workout
      </Button>
    </div>
  );
}
