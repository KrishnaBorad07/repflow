import { useState } from 'react';
import StatCard from '../components/progress/StatCard';
import StreakCalendar from '../components/progress/StreakCalendar';
import StrengthChart from '../components/progress/StrengthChart';
import VolumeChart from '../components/progress/VolumeChart';
import MuscleGroupRadar from '../components/progress/MuscleGroupRadar';
import { mockWeeklyStats } from '../utils/mockData';

const tabs = ['Overview', 'Strength', 'Body', 'History'];

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[900px]">
      <h1 className="text-[26px] font-semibold tracking-tight">Progress</h1>

      <div className="flex gap-1 mt-3.5 p-1 bg-surface border border-hairline rounded-[10px]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab ? 'bg-elevated text-text' : 'text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3.5">
        <StreakCalendar />

        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Volume" value={mockWeeklyStats.volume.value} unit={mockWeeklyStats.volume.unit} delta={mockWeeklyStats.volume.delta} up={mockWeeklyStats.volume.up} />
          <StatCard label="Workouts" value={mockWeeklyStats.workouts.value} unit={mockWeeklyStats.workouts.unit} delta={mockWeeklyStats.workouts.delta} up={mockWeeklyStats.workouts.up} />
          <StatCard label="Form avg" value={mockWeeklyStats.formAvg.value} unit={mockWeeklyStats.formAvg.unit} delta={mockWeeklyStats.formAvg.delta} up={mockWeeklyStats.formAvg.up} />
          <StatCard label="Time" value={mockWeeklyStats.time.value} unit={mockWeeklyStats.time.unit} delta={mockWeeklyStats.time.delta} up={mockWeeklyStats.time.up} />
        </div>

        <StrengthChart />
        <VolumeChart />
        <MuscleGroupRadar />
      </div>
    </div>
  );
}
