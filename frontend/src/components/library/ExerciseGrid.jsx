import { useState, useEffect, useRef } from 'react';
import Badge from '../common/Badge';

/**
 * Auto-flips between start/end position images to simulate movement.
 * Only animates when the image is visible in the viewport (IntersectionObserver).
 */
function ExerciseImage({ images, alt }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  const hasMultiple = images?.length > 1;

  // Only flip when visible on screen
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMultiple) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMultiple]);

  // Auto-flip timer
  useEffect(() => {
    if (!isVisible || !hasMultiple) return;
    const interval = setInterval(() => {
      setActiveIdx((i) => (i + 1) % images.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isVisible, hasMultiple, images?.length]);

  if (error || !images?.length) {
    return (
      <div className="w-full h-[100px] rounded-[10px] bg-[repeating-linear-gradient(135deg,#15171C_0_8px,#1A1D24_8px_16px)] border border-hairline flex items-center justify-center text-[9px] text-dim font-mono uppercase">
        NO IMAGE
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full rounded-[10px] border border-hairline overflow-hidden bg-surface">
      {/* Bottom image — always visible, no fade */}
      <img
        src={images[0]}
        alt={`${alt} — position 1`}
        loading="lazy"
        onError={() => setError(true)}
        className="w-full rounded-[10px]"
      />
      {/* Top image — fades in/out over the bottom one */}
      {hasMultiple && (
        <img
          src={images[1]}
          alt={`${alt} — position 2`}
          loading="lazy"
          onError={() => setError(true)}
          className="absolute inset-0 w-full h-full rounded-[10px] transition-opacity duration-500"
          style={{ opacity: activeIdx === 1 ? 1 : 0 }}
        />
      )}
    </div>
  );
}

export default function ExerciseGrid({ exercises, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {exercises.map((ex) => (
        <button
          key={ex.id}
          onClick={() => onSelect(ex)}
          className="card p-2.5 text-left hover:border-hairline-2 transition-colors"
        >
          <div className="mb-2.5">
            <ExerciseImage images={ex.images} alt={ex.name} />
          </div>
          <div className="text-[13px] font-semibold leading-tight line-clamp-2">{ex.name}</div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[11px] text-muted">{ex.muscle}</span>
            <Badge color={ex.difficulty === 'Beginner' ? 'green' : ex.difficulty === 'Intermediate' ? 'yellow' : 'red'}>
              {ex.difficulty === 'Beginner' ? 'BEG' : ex.difficulty === 'Intermediate' ? 'INT' : 'ADV'}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  );
}
