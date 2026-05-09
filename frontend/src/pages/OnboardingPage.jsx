import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import OnboardingStep from '../components/onboarding/OnboardingStep';
import GoalSelector from '../components/onboarding/GoalSelector';
import ExperienceSelector from '../components/onboarding/ExperienceSelector';
import BodyMetricsForm from '../components/onboarding/BodyMetricsForm';
import EquipmentSelector from '../components/onboarding/EquipmentSelector';
import ScheduleSelector from '../components/onboarding/ScheduleSelector';
import InjurySelector from '../components/onboarding/InjurySelector';
import StyleSelector from '../components/onboarding/StyleSelector';
import Button from '../components/common/Button';

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState({
    goal: 'muscle-gain',
    experience: 'intermediate',
    metrics: { age: '22', height: '178', weight: '75', bodyFat: '' },
    equipment: 'full-gym',
    schedule: { daysPerWeek: 4, sessionLength: '45 min', preferredTime: 'Evening' },
    injuries: [],
    styles: ['strength'],
  });

  const next = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      setGenerating(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    }
  };

  const back = () => step > 1 && setStep(step - 1);

  if (generating) return <GeneratingScreen />;

  const steps = {
    1: { title: "What's your main goal?", sub: "We'll shape your plan around this.", content: <GoalSelector selected={data.goal} onSelect={(goal) => setData({ ...data, goal })} /> },
    2: { title: 'Experience level?', sub: 'So we know where to start you.', content: <ExperienceSelector selected={data.experience} onSelect={(exp) => setData({ ...data, experience: exp })} /> },
    3: { title: 'Body metrics', sub: 'Helps us calibrate intensity.', content: <BodyMetricsForm metrics={data.metrics} onChange={(metrics) => setData({ ...data, metrics })} /> },
    4: { title: 'Equipment access?', sub: 'We only suggest what you can use.', content: <EquipmentSelector selected={data.equipment} onSelect={(eq) => setData({ ...data, equipment: eq })} /> },
    5: { title: 'How often can you train?', sub: 'Pick what fits a normal week.', content: <ScheduleSelector schedule={data.schedule} onChange={(schedule) => setData({ ...data, schedule })} /> },
    6: { title: 'Any injuries or limitations?', sub: "We'll program around them.", content: <InjurySelector selected={data.injuries} onChange={(injuries) => setData({ ...data, injuries })} /> },
    7: { title: 'Preferred styles?', sub: 'Pick as many as you like.', content: <StyleSelector selected={data.styles} onChange={(styles) => setData({ ...data, styles })} /> },
  };

  const current = steps[step];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm h-[680px] relative">
        <OnboardingStep step={step} total={TOTAL_STEPS} onBack={back} onSkip={next}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h1 className="text-[28px] font-semibold tracking-tight leading-tight">{current.title}</h1>
              <p className="text-sm text-muted mt-2 mb-6">{current.sub}</p>
              {current.content}
            </motion.div>
          </AnimatePresence>
        </OnboardingStep>
        <div className="absolute bottom-6 left-6 right-6">
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
  const messages = ['Analyzing your profile…', 'Selecting exercises…', 'Building your weekly split…', 'Optimizing for your goals…', 'Almost there…'];

  useState(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15 + 5, 100));
    }, 600);
    return () => clearInterval(interval);
  });

  const messageIndex = Math.min(Math.floor(progress / 20), messages.length - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-7">
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 rounded-full border border-accent/15" />
        <div className="absolute inset-3.5 rounded-full border border-accent/25" />
        <div className="absolute inset-7 rounded-full border border-accent/40 flex items-center justify-center bg-[radial-gradient(circle,rgba(200,255,61,0.15),transparent_70%)]">
          <Sparkles size={36} className="text-accent" strokeWidth={1.4} />
        </div>
        <motion.div
          className="absolute top-0 left-[76px] w-2 h-2 rounded-full bg-accent shadow-[0_0_16px_#C8FF3D]"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '4px 80px' }}
        />
      </div>
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
