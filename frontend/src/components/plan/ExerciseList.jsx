import ExerciseCard from '../workout/ExerciseCard';

export default function ExerciseList({ exercises, onExerciseClick }) {
  return (
    <div className="flex flex-col gap-2.5">
      {exercises.map((exercise, index) => (
        <ExerciseCard
          key={exercise.id || index}
          exercise={exercise}
          index={index}
          onClick={() => onExerciseClick?.(exercise)}
        />
      ))}
    </div>
  );
}
