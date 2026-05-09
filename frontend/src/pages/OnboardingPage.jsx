import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import OnboardingStep from '../components/onboarding/OnboardingStep';
import GoalSelector from '../components/onboarding/GoalSelector';
import ExperienceSelector from '../components/onboarding/ExperienceSelector';
import BodyMetricsForm from '../components/onboarding/BodyMetricsForm';
import EquipmentSelector from '../components/onboarding/EquipmentSelector';
import ScheduleSelector from '../components/onboarding/ScheduleSelector';
import InjurySelector from '../components/onboarding/InjurySelector';
import StyleSelector from '../components/onboarding/StyleSelector';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { saveOnboarding } from '../services/userService';

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    goal: 'muscle_gain',
    experience: 'consistent',
    metrics: { age: '', height: '', weight: '', bodyFat: '' },
    equipment: 'full_gym',
    equipmentInventory: [],
    schedule: { daysPerWeek: 4, sessionLength: '45 min', preferredTime: 'Evening' },
    injuries: [],
    styles: ['strength'],
  });

  /** Validate the current step before advancing */
  const validate = () => {
    if (step === 3) {
      const { age, height, weight } = data.metrics;
      const a = parseInt(age);
      const h = parseFloat(height);
      const w = parseFloat(weight);
      if (!age || isNaN(a) || a < 13 || a > 100) {
        setError('Please enter a valid age (13-100).');
        return false;
      }
      if (!height || isNaN(h) || h < 100 || h > 250) {
        setError('Please enter a valid height (100-250 cm).');
        return false;
      }
      if (!weight || isNaN(w) || w < 30 || w > 250) {
        setError('Please enter a valid weight (30-250 kg).');
        return false;
      }
    }
    if (step === 7 && data.styles.length === 0) {
      setError('Select at least one training style.');
      return false;
    }
    return true;
  };

  /** Map frontend form state to backend OnboardingRequest schema */
  const buildPayload = () => {
    const sessionMinutes = parseInt(data.schedule.sessionLength) || 45;
    return {
      goal: data.goal,
      experience_level: data.experience,
      age: parseInt(data.metrics.age) || 21,
      height_cm: parseFloat(data.metrics.height) || 175,
      weight_kg: parseFloat(data.metrics.weight) || 70,
      body_fat_pct: data.metrics.bodyFat ? parseFloat(data.metrics.bodyFat) : null,
      workout_environment: data.equipment,
      available_days: data.schedule.daysPerWeek,
      session_duration_min: sessionMinutes,
      injuries: data.injuries.map((i) => i.toLowerCase()),
      equipment_inventory: data.equipmentInventory,
      preferred_styles: data.styles,
      priority_muscles: [],
    };
  };

  const next = async () => {
    setError(null);
    if (!validate()) return;

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      setGenerating(true);
      try {
        await saveOnboarding(buildPayload());
        setTimeout(() => navigate('/dashboard'), 3500);
      } catch (err) {
        console.error('Onboarding save failed:', err);
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          setError(detail[0].msg);
        } else {
          setError('Something went wrong. Please try again.');
        }
        setGenerating(false);
      }
    }
  };

  const back = () => {
    setError(null);
    step > 1 && setStep(step - 1);
  };

  if (generating) return <GeneratingScreen />;

  const steps = {
    1: {
      title: "What's your main goal?",
      sub: "We'll shape your plan around this.",
      content: <GoalSelector selected={data.goal} onSelect={(goal) => setData({ ...data, goal })} />,
    },
    2: {
      title: 'Experience level?',
      sub: 'So we know where to start you.',
      content: <ExperienceSelector selected={data.experience} onSelect={(exp) => setData({ ...data, experience: exp })} />,
    },
    3: {
      title: 'Body metrics',
      sub: 'Helps us calibrate intensity.',
      content: <BodyMetricsForm metrics={data.metrics} onChange={(metrics) => setData({ ...data, metrics })} />,
    },
    4: {
      title: 'Equipment access?',
      sub: 'We only suggest what you can use.',
      content: (
        <EquipmentSelector
          selected={data.equipment}
          onSelect={(eq) => setData({ ...data, equipment: eq })}
          inventory={data.equipmentInventory}
          onInventoryChange={(inv) => setData({ ...data, equipmentInventory: inv })}
        />
      ),
    },
    5: {
      title: 'How often can you train?',
      sub: 'Pick what fits a normal week.',
      content: <ScheduleSelector schedule={data.schedule} onChange={(schedule) => setData({ ...data, schedule })} />,
    },
    6: {
      title: 'Any injuries or limitations?',
      sub: "We'll program around them.",
      content: <InjurySelector selected={data.injuries} onChange={(injuries) => setData({ ...data, injuries })} />,
    },
    7: {
      title: 'Preferred styles?',
      sub: 'Pick as many as you like.',
      content: <StyleSelector selected={data.styles} onChange={(styles) => setData({ ...data, styles })} />,
    },
  };

  const current = steps[step];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-[480px] lg:max-w-[520px] min-h-[680px] relative">
        <OnboardingStep step={step} total={TOTAL_STEPS} onBack={back} onSkip={next}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h1 className="text-[28px] lg:text-[32px] font-semibold tracking-tight leading-tight">{current.title}</h1>
              <p className="text-sm text-muted mt-2 mb-6">{current.sub}</p>
              {current.content}
            </motion.div>
          </AnimatePresence>
        </OnboardingStep>

        <div className="mt-8 px-6">
          {error && <p className="text-bad text-sm text-center mb-3">{error}</p>}
          <Button variant="primary" size="lg" fullWidth onClick={next}>
            {step === TOTAL_STEPS ? 'Generate my plan' : 'Continue'} <ChevronRight size={16} strokeWidth={2.4} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function GeneratingScreen() {
  const [progress, setProgress] = useState(0);
  const messages = ['Analyzing your profile...', 'Selecting exercises...', 'Building your weekly split...', 'Optimizing for your goals...', 'Almost there...'];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15 + 5, 100));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const messageIndex = Math.min(Math.floor(progress / 20), messages.length - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-7">
      <Loader size={100} />
      <div className="text-center">
        <div className="kicker !text-accent">Generating</div>
        <div className="text-[22px] font-semibold mt-2.5 tracking-tight">{messages[messageIndex]}</div>
      </div>
      <div className="w-full max-w-[280px]">
        <div className="h-1 bg-elevated rounded-full overflow-hidden">
          <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2.5 text-dim text-[11px] font-mono">
          <span>Step {Math.min(Math.ceil(progress / 20), 5)} of 5</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
