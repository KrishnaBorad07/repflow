import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseFilter from '../components/library/ExerciseFilter';
import ExerciseGrid from '../components/library/ExerciseGrid';
import Skeleton from '../components/common/Skeleton';
import { getExercises } from '../services/exerciseService';

export default function ExerciseLibraryPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeMuscle, setActiveMuscle] = useState(null);
  const [activeEquipment, setActiveEquipment] = useState(null);

  // Load exercises once
  useEffect(() => {
    (async () => {
      const res = await getExercises();
      setExercises(res.data);
      setLoading(false);
    })();
  }, []);

  // Filter client-side (data is already local)
  const filtered = useMemo(() => {
    let results = exercises;
    if (activeMuscle) results = results.filter((e) => e.muscle === activeMuscle);
    if (activeEquipment) results = results.filter((e) => e.equipment === activeEquipment);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.primaryMuscleRaw.toLowerCase().includes(q) ||
          e.equipment.toLowerCase().includes(q)
      );
    }
    return results;
  }, [exercises, activeMuscle, activeEquipment, search]);

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[900px] lg:mx-auto">
      <h1 className="text-[26px] font-semibold tracking-tight mb-1">Library</h1>
      <p className="text-sm text-muted mb-3.5">{exercises.length} exercises</p>
      <ExerciseFilter
        search={search}
        onSearchChange={setSearch}
        activeMuscle={activeMuscle}
        onMuscleChange={setActiveMuscle}
        activeEquipment={activeEquipment}
        onEquipmentChange={setActiveEquipment}
      />
      <div className="mt-[18px]">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            <Skeleton.Card />
            <Skeleton.Card />
            <Skeleton.Card />
            <Skeleton.Card />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">
            No exercises found. Try a different filter.
          </div>
        ) : (
          <ExerciseGrid exercises={filtered} onSelect={(ex) => navigate(`/library/${ex.id}`)} />
        )}
      </div>
    </div>
  );
}
