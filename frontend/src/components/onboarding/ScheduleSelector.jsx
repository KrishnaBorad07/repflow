import { DAYS_PER_WEEK, SESSION_LENGTHS, PREFERRED_TIMES } from '../../utils/constants';

export default function ScheduleSelector({ schedule, onChange }) {
  const update = (field, value) => onChange({ ...schedule, [field]: value });

  return (
    <div className="space-y-7">
      <div>
        <div className="text-xs text-muted mb-2.5 tracking-wider">DAYS PER WEEK</div>
        <div className="flex gap-2">
          {DAYS_PER_WEEK.map((n) => (
            <button
              key={n}
              onClick={() => update('daysPerWeek', n)}
              className={`flex-1 h-14 rounded-xl font-mono text-lg font-semibold border transition-colors ${
                schedule.daysPerWeek === n
                  ? 'bg-accent text-accent-ink border-accent'
                  : 'bg-surface text-text border-hairline'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-muted mb-2.5 tracking-wider">SESSION LENGTH</div>
        <div className="flex gap-2 flex-wrap">
          {SESSION_LENGTHS.map((len) => (
            <button
              key={len}
              onClick={() => update('sessionLength', len)}
              className={`px-[18px] py-3 rounded-pill text-sm font-medium border transition-colors ${
                schedule.sessionLength === len
                  ? 'bg-accent text-accent-ink border-accent'
                  : 'bg-surface text-text border-hairline'
              }`}
            >
              {len}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-muted mb-2.5 tracking-wider">PREFERRED TIME</div>
        <div className="flex gap-2">
          {PREFERRED_TIMES.map((time) => (
            <button
              key={time}
              onClick={() => update('preferredTime', time)}
              className={`flex-1 py-3 px-2 rounded-xl text-center text-[13px] font-medium border transition-colors ${
                schedule.preferredTime === time
                  ? 'bg-accent/[0.08] text-accent border-accent/40'
                  : 'bg-surface text-text border-hairline'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
