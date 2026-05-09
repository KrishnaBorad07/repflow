import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { mockExercises } from '../utils/mockData';
import Badge from '../components/common/Badge';
import Chip from '../components/common/Chip';
import Card from '../components/common/Card';
import VideoPlayer from '../components/workout/VideoPlayer';

export default function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const exercise = mockExercises.find((e) => e.id === exerciseId);

  if (!exercise) return <div className="p-8 text-muted">Exercise not found.</div>;

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[800px]">
      <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center mb-4">
        <ChevronLeft size={18} />
      </button>

      <VideoPlayer className="w-full h-52 rounded-card mb-5" />

      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{exercise.name}</h1>
        <Badge color={exercise.difficulty === 'Beginner' ? 'green' : 'yellow'}>
          {exercise.difficulty}
        </Badge>
      </div>

      <div className="flex gap-1.5 mt-3">
        <Chip active>{exercise.muscle}</Chip>
        {exercise.secondaryMuscles.map((m) => <Chip key={m}>{m}</Chip>)}
      </div>

      <Card className="p-4 mt-5">
        <h3 className="text-sm font-semibold mb-2">Description</h3>
        <p className="text-sm text-muted leading-relaxed">{exercise.description}</p>
      </Card>

      <Card className="p-4 mt-3">
        <h3 className="text-sm font-semibold mb-3">Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted">Equipment</span><div className="font-semibold mt-1">{exercise.equipment}</div></div>
          <div><span className="text-muted">Default sets × reps</span><div className="font-semibold mt-1">{exercise.sets} × {exercise.reps}</div></div>
          <div><span className="text-muted">Rest period</span><div className="font-semibold mt-1">{exercise.restSeconds}s</div></div>
          <div><span className="text-muted">Difficulty</span><div className="font-semibold mt-1">{exercise.difficulty}</div></div>
        </div>
      </Card>
    </div>
  );
}
