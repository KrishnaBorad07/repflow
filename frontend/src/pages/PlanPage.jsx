import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/common/Button';
import DayCard from '../components/plan/DayCard';
import WeeklyView from '../components/plan/WeeklyView';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import GoalSelector from '../components/onboarding/GoalSelector';
import ExperienceSelector from '../components/onboarding/ExperienceSelector';
import EquipmentSelector from '../components/onboarding/EquipmentSelector';
import ScheduleSelector from '../components/onboarding/ScheduleSelector';
import usePlanStore from '../store/planStore';
import { FITNESS_GOALS, MUSCLE_GROUPS } from '../utils/constants';

const STEPS = ['goal', 'level', 'equipment', 'schedule', 'muscles'];
const STEP_TITLES = {
  goal: "What's your goal?",
  level: 'Your experience level',
  equipment: 'Available equipment',
  schedule: 'Your schedule',
  muscles: 'Priority muscles',
};

export default function PlanPage() {
  const navigate = useNavigate();
  const { currentPlan, selectedWeek, nextWeek, prevWeek, isLoading, fetchPlan, generateNewPlan, regeneratePlan } = usePlanStore();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    goal: '',
    level: '',
    equipment: '',
    schedule: { daysPerWeek: 4, sessionLength: '45 min', preferredTime: 'Evening' },
    priorityMuscles: [],
  });

  useEffect(() => {
    fetchPlan();
  }, []);

  const currentStep = STEPS[step];

  const canNext = () => {
    if (currentStep === 'goal') return !!form.goal;
    if (currentStep === 'level') return !!form.level;
    if (currentStep === 'equipment') return !!form.equipment;
    if (currentStep === 'schedule') return !!form.schedule.daysPerWeek;
    if (currentStep === 'muscles') return form.priorityMuscles.length > 0;
    return true;
  };

  const handleGenerate = () => {
    const goalLabel = FITNESS_GOALS.find(g => g.id === form.goal)?.label || form.goal;
    const sessionMin = parseInt(form.schedule.sessionLength) || 45;

    generateNewPlan({
      goal: goalLabel,
      level: form.level.charAt(0).toUpperCase() + form.level.slice(1),
      daysPerWeek: form.schedule.daysPerWeek,
      sessionLength: sessionMin,
      equipment: form.equipment,
      priorityMuscles: form.priorityMuscles,
      injuries: 'None',
      workoutStyles: ['strength'],
    });
    setShowModal(false);
    setStep(0);
  };

  const toggleMuscle = (m) => {
    setForm(prev => ({
      ...prev,
      priorityMuscles: prev.priorityMuscles.includes(m)
        ? prev.priorityMuscles.filter(x => x !== m)
        : [...prev.priorityMuscles, m],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader />
        <p className="text-muted text-sm">Generating your plan...</p>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5">
          <Sparkles size={48} className="text-accent" />
          <h2 className="text-xl font-semibold">No plan yet</h2>
          <p className="text-muted text-sm text-center">Generate your first AI-powered workout plan</p>
          <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
            <Sparkles size={16} /> Generate Plan
          </Button>
        </div>
        {renderModal()}
      </>
    );
  }

  const completedDays = currentPlan.days.filter((d) => d.status === 'done').length;
  const workoutDays = currentPlan.days.filter((d) => d.status !== 'rest').length;

  function renderModal() {
    return (
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setStep(0); }} title={STEP_TITLES[currentStep]}>
        <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1">
          {currentStep === 'goal' && (
            <GoalSelector selected={form.goal} onSelect={(id) => setForm(prev => ({ ...prev, goal: id }))} />
          )}
          {currentStep === 'level' && (
            <ExperienceSelector selected={form.level} onSelect={(id) => setForm(prev => ({ ...prev, level: id }))} />
          )}
          {currentStep === 'equipment' && (
            <EquipmentSelector selected={form.equipment} onSelect={(id) => setForm(prev => ({ ...prev, equipment: id }))} />
          )}
          {currentStep === 'schedule' && (
            <ScheduleSelector schedule={form.schedule} onChange={(s) => setForm(prev => ({ ...prev, schedule: s }))} />
          )}
          {currentStep === 'muscles' && (
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMuscle(m)}
                  className={`px-4 py-2.5 rounded-pill text-sm font-medium border transition-colors ${
                    form.priorityMuscles.includes(m)
                      ? 'bg-accent text-accent-ink border-accent'
                      : 'bg-surface text-text border-hairline'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 mt-5">
          {step > 0 && (
            <Button variant="secondary" size="md" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={16} /> Back
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            disabled={!canNext()}
            onClick={() => {
              if (step < STEPS.length - 1) {
                setStep(s => s + 1);
              } else {
                handleGenerate();
              }
            }}
          >
            {step === STEPS.length - 1 ? (
              <><Sparkles size={16} /> Generate</>
            ) : (
              <>Next <ChevronRight size={16} /></>
            )}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <div className="px-5 pt-3 pb-6 lg:p-8 lg:max-w-[900px] lg:mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <div className="kicker">Week {selectedWeek} of {currentPlan.totalWeeks}</div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">{currentPlan.programName}</h1>
        </div>
        <WeeklyView weekNumber={selectedWeek} totalWeeks={currentPlan.totalWeeks} completedDays={completedDays} totalDays={workoutDays} onPrev={prevWeek} onNext={nextWeek} />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-muted font-mono mb-1.5">
          <span>{completedDays} of {workoutDays} done</span>
          <span>{workoutDays > 0 ? Math.round((completedDays / workoutDays) * 100) : 0}%</span>
        </div>
        <div className="h-1 bg-elevated rounded-full overflow-hidden mb-4">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${workoutDays > 0 ? (completedDays / workoutDays) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {currentPlan.days.map((day) => (
          <DayCard key={day.id} day={day} onClick={() => day.exerciseCount > 0 && navigate(`/plan/${day.id}`)} />
        ))}
      </div>

      <div className="flex gap-2.5 mt-[18px]">
        <Button variant="secondary" size="md" className="flex-1" onClick={() => regeneratePlan()} disabled={isLoading}>
          <RefreshCw size={16} /> Regenerate
        </Button>
        <Button variant="secondary" size="md" className="flex-1" onClick={() => navigate('/quick-workout')}>
          <Plus size={16} /> Quick workout
        </Button>
      </div>

      {renderModal()}
    </div>
  );
}
