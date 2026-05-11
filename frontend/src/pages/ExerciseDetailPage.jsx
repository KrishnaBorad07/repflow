import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Badge from '../components/common/Badge';
import Chip from '../components/common/Chip';
import Card from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import { getExerciseById } from '../services/exerciseService';

function ExerciseImages({ images, name }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const hasMultiple = images?.length > 1;

  // Auto-flip between start/end positions
  useEffect(() => {
    if (!autoPlay || !hasMultiple) return;
    const interval = setInterval(() => {
      setActiveIdx((i) => (i + 1) % images.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [autoPlay, hasMultiple, images?.length]);

  if (!images?.length || error) {
    return (
      <div className="w-full h-52 rounded-card bg-[repeating-linear-gradient(135deg,#15171C_0_8px,#1A1D24_8px_16px)] border border-hairline flex items-center justify-center text-[11px] text-dim font-mono uppercase mb-5">
        NO IMAGE AVAILABLE
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="relative w-full rounded-card border border-hairline overflow-hidden bg-surface">
        {/* Bottom image — always visible, no fade */}
        <img
          src={images[0]}
          alt={`${name} — position 1`}
          onError={() => setError(true)}
          className="w-full rounded-card"
        />
        {/* Top image — fades in/out over the bottom one */}
        {images.length > 1 && (
          <img
            src={images[1]}
            alt={`${name} — position 2`}
            onError={() => setError(true)}
            className="absolute inset-0 w-full h-full rounded-card transition-opacity duration-500"
            style={{ opacity: activeIdx === 1 ? 1 : 0 }}
          />
        )}
      </div>
      {hasMultiple && (
        <div className="flex justify-center items-center gap-2 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveIdx(i); setAutoPlay(false); }}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors ${
                activeIdx === i
                  ? 'bg-accent text-accent-ink font-semibold'
                  : 'bg-surface border border-hairline text-muted'
              }`}
            >
              {i === 0 ? 'Start' : 'End'}
            </button>
          ))}
          <button
            onClick={() => setAutoPlay((p) => !p)}
            className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors ${
              autoPlay
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'bg-surface border border-hairline text-muted'
            }`}
          >
            {autoPlay ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await getExerciseById(exerciseId);
      setExercise(res.data);
      setLoading(false);
    })();
  }, [exerciseId]);

  if (loading) {
    return (
      <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[800px] lg:mx-auto">
        <Skeleton width={36} height={36} radius={999} />
        <div className="mt-4"><Skeleton width="100%" height={208} radius={14} /></div>
        <div className="mt-5"><Skeleton width="60%" height={24} /></div>
        <div className="mt-3 flex gap-2"><Skeleton width={60} height={24} radius={999} /><Skeleton width={60} height={24} radius={999} /></div>
        <div className="mt-5"><Skeleton.Card /></div>
      </div>
    );
  }

  if (!exercise) return <div className="p-8 text-muted">Exercise not found.</div>;

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[800px] lg:mx-auto">
      <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center mb-4">
        <ChevronLeft size={18} />
      </button>

      <ExerciseImages images={exercise.images} name={exercise.name} />

      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{exercise.name}</h1>
        <Badge color={exercise.difficulty === 'Beginner' ? 'green' : exercise.difficulty === 'Intermediate' ? 'yellow' : 'red'}>
          {exercise.difficulty}
        </Badge>
      </div>

      <div className="flex gap-1.5 mt-3 flex-wrap">
        <Chip active>{exercise.muscle}</Chip>
        {exercise.secondaryMuscles.map((m) => <Chip key={m}>{m}</Chip>)}
      </div>

      {/* Instructions */}
      {exercise.instructions?.length > 0 && (
        <Card className="p-4 mt-5">
          <h3 className="text-sm font-semibold mb-3">How to perform</h3>
          <ol className="flex flex-col gap-2.5">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent font-mono font-semibold text-xs mt-0.5 shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Details */}
      <Card className="p-4 mt-3">
        <h3 className="text-sm font-semibold mb-3">Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted">Equipment</span>
            <div className="font-semibold mt-1">{exercise.equipment}</div>
          </div>
          <div>
            <span className="text-muted">Category</span>
            <div className="font-semibold mt-1 capitalize">{exercise.category}</div>
          </div>
          {exercise.force && (
            <div>
              <span className="text-muted">Force</span>
              <div className="font-semibold mt-1 capitalize">{exercise.force}</div>
            </div>
          )}
          {exercise.mechanic && (
            <div>
              <span className="text-muted">Mechanic</span>
              <div className="font-semibold mt-1 capitalize">{exercise.mechanic}</div>
            </div>
          )}
          <div>
            <span className="text-muted">Difficulty</span>
            <div className="font-semibold mt-1">{exercise.difficulty}</div>
          </div>
          <div>
            <span className="text-muted">Target muscle</span>
            <div className="font-semibold mt-1 capitalize">{exercise.primaryMuscleRaw}</div>
          </div>
        </div>
      </Card>

      {/* Secondary muscles */}
      {exercise.secondaryMusclesRaw?.length > 0 && (
        <Card className="p-4 mt-3">
          <h3 className="text-sm font-semibold mb-3">Secondary muscles</h3>
          <div className="flex gap-1.5 flex-wrap">
            {exercise.secondaryMusclesRaw.map((m) => (
              <Chip key={m}>{m}</Chip>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
