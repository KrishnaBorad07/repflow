import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseFilter from '../components/library/ExerciseFilter';
import ExerciseGrid from '../components/library/ExerciseGrid';
import { mockExercises } from '../utils/mockData';

export default function ExerciseLibraryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeMuscle, setActiveMuscle] = useState(null);

  let filtered = [...mockExercises];
  if (activeMuscle) filtered = filtered.filter((e) => e.muscle === activeMuscle);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((e) => e.name.toLowerCase().includes(q));
  }

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[900px]">
      <h1 className="text-[26px] font-semibold tracking-tight mb-3.5">Library</h1>
      <ExerciseFilter search={search} onSearchChange={setSearch} activeMuscle={activeMuscle} onMuscleChange={setActiveMuscle} />
      <div className="mt-[18px]">
        <ExerciseGrid exercises={filtered} onSelect={(ex) => navigate(`/library/${ex.id}`)} />
      </div>
    </div>
  );
}
