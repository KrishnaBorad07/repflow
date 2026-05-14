import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Moon, Sun, LogOut, Save,
  Dumbbell, Calendar, Target, Zap, Check, Heart, Ruler, Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import GoalSelector from '../components/onboarding/GoalSelector';
import ExperienceSelector from '../components/onboarding/ExperienceSelector';
import BodyMetricsForm from '../components/onboarding/BodyMetricsForm';
import InjurySelector from '../components/onboarding/InjurySelector';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import usePlanStore from '../store/planStore';
import { updateUserProfile, updatePreferences } from '../services/userService';
import {
  EQUIPMENT_OPTIONS, EQUIPMENT_INVENTORY_OPTIONS, TRAINING_STYLES,
  MUSCLE_GROUPS, DAYS_PER_WEEK, SESSION_LENGTHS,
} from '../utils/constants';

const INVENTORY_LABELS = {
  barbell: 'Barbell', dumbbells: 'Dumbbells', kettlebell: 'Kettlebell',
  pull_up_bar: 'Pull-up bar', resistance_bands: 'Bands', cables: 'Cables',
  machines: 'Machines', bench: 'Bench', squat_rack: 'Squat rack',
  trx: 'TRX', foam_roller: 'Foam roller', yoga_mat: 'Yoga mat',
};

const PLAN_AFFECTING_KEYS = [
  'goal', 'experience', 'equipment', 'inventory', 'styles', 'muscles',
  'daysPerWeek', 'sessionMin', 'injuries',
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateProfile: updateStoreProfile, refreshUser } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { regeneratePlan, currentPlan } = usePlanStore();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('muscle_gain');
  const [experience, setExperience] = useState('consistent');
  const [metrics, setMetrics] = useState({ age: '', height: '', weight: '', bodyFat: '' });
  const [equipment, setEquipment] = useState('full_gym');
  const [inventory, setInventory] = useState([]);
  const [styles, setStyles] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionMin, setSessionMin] = useState(45);
  const [injuries, setInjuries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Snapshot of initial values to detect plan-affecting changes
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    if (!user) return;
    const state = {
      name: user.name || '',
      goal: user.goal || 'muscle_gain',
      experience: user.experience_level || 'consistent',
      metrics: {
        age: user.age ? String(user.age) : '',
        height: user.height_cm ? String(user.height_cm) : '',
        weight: user.weight_kg ? String(user.weight_kg) : '',
        bodyFat: user.body_fat_pct ? String(user.body_fat_pct) : '',
      },
      equipment: user.workout_environment || 'full_gym',
      inventory: user.equipment_inventory || [],
      styles: user.preferred_styles || [],
      muscles: user.priority_muscles || [],
      daysPerWeek: user.available_days || 4,
      sessionMin: user.session_duration_min || 45,
      injuries: user.injuries || [],
    };
    setName(state.name);
    setGoal(state.goal);
    setExperience(state.experience);
    setMetrics(state.metrics);
    setEquipment(state.equipment);
    setInventory(state.inventory);
    setStyles(state.styles);
    setMuscles(state.muscles);
    setDaysPerWeek(state.daysPerWeek);
    setSessionMin(state.sessionMin);
    setInjuries(state.injuries);
    setInitial(state);
  }, [user]);

  const toggleChip = (list, setList, item) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const hasPlanAffectingChanges = () => {
    if (!initial) return false;
    const current = { goal, experience, equipment, inventory, styles, muscles, daysPerWeek, sessionMin, injuries };
    const prev = {
      goal: initial.goal, experience: initial.experience, equipment: initial.equipment,
      inventory: initial.inventory, styles: initial.styles, muscles: initial.muscles,
      daysPerWeek: initial.daysPerWeek, sessionMin: initial.sessionMin, injuries: initial.injuries,
    };
    return JSON.stringify(current) !== JSON.stringify(prev);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (name !== user.name) {
        await updateUserProfile({ name });
      }
      await updatePreferences({
        goal,
        experience_level: experience,
        age: metrics.age ? parseInt(metrics.age) : undefined,
        height_cm: metrics.height ? parseFloat(metrics.height) : undefined,
        weight_kg: metrics.weight ? parseFloat(metrics.weight) : undefined,
        body_fat_pct: metrics.bodyFat ? parseFloat(metrics.bodyFat) : undefined,
        workout_environment: equipment,
        equipment_inventory: inventory,
        preferred_styles: styles,
        priority_muscles: muscles.map((m) => m.toLowerCase()),
        available_days: daysPerWeek,
        session_duration_min: sessionMin,
        injuries: injuries.map((i) => i.toLowerCase()),
      });
      await refreshUser();

      const planChanged = hasPlanAffectingChanges();

      // Snapshot the new state so subsequent saves compare against it
      setInitial({
        name, goal, experience, metrics, equipment, inventory, styles, muscles, daysPerWeek, sessionMin, injuries,
      });

      if (planChanged && currentPlan) {
        setSaving(false);
        setShowRegenModal(true);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regeneratePlan();
      setShowRegenModal(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Regenerate failed:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleSkipRegen = () => {
    setShowRegenModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[600px] lg:mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
      </div>

      {/* Theme toggle */}
      <Card className="p-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
          <span className="text-sm font-medium">Dark mode</span>
        </div>
        <button
          onClick={toggleTheme}
          className={`relative w-[46px] h-[26px] rounded-full transition-colors ${isDark ? 'bg-accent' : 'bg-elevated'}`}
        >
          <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow transition-transform ${isDark ? 'left-[23px]' : 'left-[3px]'}`} />
        </button>
      </Card>

      {/* Profile */}
      <SectionLabel icon={null} label="PROFILE" />
      <Card className="p-4 mb-4">
        <label className="block text-xs text-muted mb-1.5">Display name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-[42px] bg-elevated border border-hairline rounded-xl px-3 text-sm text-text placeholder:text-dim outline-none focus:border-accent/50 transition-colors"
        />
      </Card>

      {/* Goal */}
      <SectionLabel icon={Target} label="FITNESS GOAL" />
      <Card className="p-4 mb-4">
        <GoalSelector selected={goal} onSelect={setGoal} />
      </Card>

      {/* Experience */}
      <SectionLabel icon={Activity} label="EXPERIENCE LEVEL" />
      <Card className="p-4 mb-4">
        <ExperienceSelector selected={experience} onSelect={setExperience} />
      </Card>

      {/* Body Metrics */}
      <SectionLabel icon={Ruler} label="BODY METRICS" />
      <Card className="p-4 mb-4">
        <BodyMetricsForm metrics={metrics} onChange={setMetrics} />
      </Card>

      {/* Schedule */}
      <SectionLabel icon={Calendar} label="SCHEDULE" />
      <Card className="p-4 mb-4 space-y-4">
        <div>
          <label className="block text-xs text-muted mb-2">Days per week</label>
          <div className="flex gap-2">
            {DAYS_PER_WEEK.map((d) => (
              <button
                key={d}
                onClick={() => setDaysPerWeek(d)}
                className={`flex-1 h-[38px] rounded-xl text-sm font-semibold font-mono border transition-colors ${
                  daysPerWeek === d ? 'bg-accent/[0.08] text-accent border-accent/40' : 'bg-elevated text-muted border-hairline'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted mb-2">Session length</label>
          <div className="flex flex-wrap gap-2">
            {SESSION_LENGTHS.map((s) => {
              const min = parseInt(s);
              return (
                <button
                  key={s}
                  onClick={() => setSessionMin(min)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    sessionMin === min ? 'bg-accent/[0.08] text-accent border-accent/40' : 'bg-elevated text-muted border-hairline'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Equipment */}
      <SectionLabel icon={Dumbbell} label="EQUIPMENT" />
      <Card className="p-4 mb-4 space-y-4">
        <div className="flex flex-col gap-2">
          {EQUIPMENT_OPTIONS.map((opt) => {
            const isActive = equipment === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setEquipment(opt.id)}
                className={`flex items-center justify-between p-3.5 rounded-[14px] border text-left transition-colors ${
                  isActive ? 'bg-accent/[0.08] border-accent/40' : 'bg-elevated border-hairline'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="text-xs text-muted mt-0.5">{opt.description}</div>
                </div>
                {isActive && (
                  <div className="w-[20px] h-[20px] rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Check size={12} className="text-accent-ink" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {(equipment === 'home_basic' || equipment === 'full_gym') && (
          <div>
            <label className="block text-xs text-muted mb-2">Available equipment</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_INVENTORY_OPTIONS.map((item) => {
                const isActive = inventory.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleChip(inventory, setInventory, item)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      isActive ? 'bg-accent/[0.08] text-accent border-accent/40' : 'bg-elevated text-muted border-hairline'
                    }`}
                  >
                    {INVENTORY_LABELS[item] || item}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Injuries */}
      <SectionLabel icon={Heart} label="INJURIES / LIMITATIONS" />
      <Card className="p-4 mb-4">
        <InjurySelector selected={injuries} onChange={setInjuries} />
      </Card>

      {/* Training styles */}
      <SectionLabel icon={Zap} label="TRAINING STYLES" />
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {TRAINING_STYLES.map((s) => {
            const isActive = styles.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleChip(styles, setStyles, s.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  isActive ? 'bg-accent/[0.08] text-accent border-accent/40' : 'bg-elevated text-muted border-hairline'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Priority muscles */}
      <SectionLabel icon={Target} label="PRIORITY MUSCLES" />
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((m) => {
            const isActive = muscles.map((x) => x.toLowerCase()).includes(m.toLowerCase());
            return (
              <button
                key={m}
                onClick={() => toggleChip(
                  muscles.map((x) => x.toLowerCase()),
                  (val) => setMuscles(val),
                  m.toLowerCase()
                )}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  isActive ? 'bg-accent/[0.08] text-accent border-accent/40' : 'bg-elevated text-muted border-hairline'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Save */}
      <Button variant="primary" size="lg" fullWidth onClick={handleSave} disabled={saving}>
        {saved ? (
          <><Check size={16} /> Saved!</>
        ) : saving ? (
          'Saving...'
        ) : (
          <><Save size={16} /> Save changes</>
        )}
      </Button>

      {/* Logout */}
      <div className="mt-4">
        <Button variant="danger" size="lg" fullWidth onClick={handleLogout}>
          <LogOut size={16} /> Log out
        </Button>
      </div>

      <p className="text-center text-xs text-dim mt-6">RepFlow v1.0.0</p>

      {/* Regenerate Plan Modal */}
      <AnimatePresence>
        {showRegenModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleSkipRegen}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-surface border border-hairline rounded-2xl p-6 z-50"
            >
              <h3 className="text-lg font-semibold mb-2">Update your plan?</h3>
              <p className="text-sm text-muted mb-5">
                Your preferences have changed. Would you like to regenerate your workout plan from today onwards? Past days will stay as they are.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" size="md" fullWidth onClick={handleSkipRegen} disabled={regenerating}>
                  Keep current plan
                </Button>
                <Button variant="primary" size="md" fullWidth onClick={handleRegenerate} disabled={regenerating}>
                  {regenerating ? 'Generating...' : 'Yes, update plan'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      {Icon && <Icon size={13} className="text-muted" />}
      <h3 className="text-xs text-muted font-semibold tracking-wider">{label}</h3>
    </div>
  );
}
