import { useEffect, useState } from 'react';
import { findExerciseByName } from '../../services/exerciseService';

function FormCycle({ images, exerciseName }) {
  const [frame, setFrame] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % images.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [images]);

  useEffect(() => {
    setFrame(0);
    setImgError(false);
  }, [images]);

  const label = images.length >= 2 ? (frame === 0 ? 'Start' : 'End') : 'Position';

  if (imgError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[11px] text-dim font-mono uppercase bg-[#0d0e10]">
        IMAGE UNAVAILABLE
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#0d0e10] flex items-center justify-center">
      <img
        key={images[frame]}
        src={images[frame]}
        alt={`${exerciseName} — ${label}`}
        onError={() => setImgError(true)}
        className="max-w-full max-h-full object-contain transition-opacity duration-300"
      />
      <div className="absolute top-3 left-3 pointer-events-none bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-accent/20 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="text-[10px] font-mono tracking-widest text-accent uppercase">
          {images.length >= 2 ? `${label} · Loop` : 'Form'}
        </span>
      </div>
      {images.length >= 2 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === frame ? 'bg-accent' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VideoPlayer({ exerciseName, className = '' }) {
  const [media, setMedia] = useState(null);

  useEffect(() => {
    if (!exerciseName) {
      setMedia(null);
      return;
    }
    const exercise = findExerciseByName(exerciseName);
    if (!exercise) {
      setMedia(null);
      return;
    }

    if (exercise.gifUrl) {
      setMedia({ type: 'gif', src: exercise.gifUrl, name: exercise.name });
    } else if (exercise.images?.length >= 1) {
      setMedia({ type: 'form', images: exercise.images, name: exercise.name });
    } else {
      setMedia(null);
    }
  }, [exerciseName]);

  // Fallback: no media found
  if (!media) {
    return (
      <div className={`bg-[repeating-linear-gradient(135deg,#15171C_0_8px,#1A1D24_8px_16px)] border border-hairline flex items-center justify-center text-[11px] text-dim font-mono uppercase ${className}`}>
        <span>EXERCISE DEMO LOOP</span>
      </div>
    );
  }

  // GIF loop
  if (media.type === 'gif') {
    return (
      <div className={`relative bg-[#0d0e10] border border-hairline overflow-hidden flex items-center justify-center ${className}`}>
        <img
          src={media.src}
          alt={`${media.name} — form loop`}
          className="max-w-full max-h-full object-contain mx-auto"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute top-3 left-3 pointer-events-none bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-accent/20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-accent uppercase">GIF · Loop</span>
        </div>
      </div>
    );
  }

  // Form: auto-cycle start↔end images
  return (
    <div className={`border border-hairline overflow-hidden ${className}`}>
      <FormCycle images={media.images} exerciseName={media.name} />
    </div>
  );
}
