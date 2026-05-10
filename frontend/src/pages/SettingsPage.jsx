import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Moon, Sun, Bell, LogOut, ChevronRight, Save,
  Dumbbell, Calendar, Clock, Target, Zap, Check,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateProfile: updateStoreProfile, refreshUser } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  // Local editable state — seeded from user
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('full_gym');
  const [inventory, setInventory] = useState([]);
  const [styles, setStyles] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionMin, setSessionMin] = useState(45);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Seed local state from user on mount
  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setEquipment(user.workout_environment || 'full_gym');
    setInventory(user.equipment_inventory || []);
    setStyles(user.preferred_styles || []);
    setMuscles(user.priority_muscles || []);
    setDaysPerWeek(user.available_days || 4);
    setSessionMin(user.session_duration_min || 45);
  }, [user]);

  const toggleChip = (list, setList, item) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update name if changed
      if (name !== user.name) {
        await updateUserProfile({ name });
      }
      // Update preferences
      await updatePreferences({
        workout_environment: equipment,
        equipment_inventory: inventory,
        preferred_styles: styles,
        priority_muscles: muscles.map((m) => m.toLowerCase()),
        available_days: daysPerWeek,
        session_duration_min: sessionMin,
      });
      // Refresh store with latest data
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
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
