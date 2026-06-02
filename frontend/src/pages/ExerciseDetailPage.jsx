import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, ExternalLink } from 'lucide-react';
import Badge from '../components/common/Badge';
import Chip from '../components/common/Chip';
import Card from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import { getExerciseById } from '../services/exerciseService';

// ─── Helper: extract YouTube video ID from URL ───────────
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// ─── Media type constants ────────────────────────────────
const MEDIA_TUTORIAL = 'tutorial';
const MEDIA_GIF = 'gif';
const MEDIA_FORM = 'form'; // auto-cycles start↔end CDN images

/**
 * Build the list of available media items for an exercise.
 * Each item: { type, label, thumbnail, src }
 */
function buildMediaItems(exercise) {
  const items = [];
  const ytId = getYouTubeId(exercise.tutorialUrl);

  // 1. YouTube tutorial
  if (ytId) {
    items.push({
      type: MEDIA_TUTORIAL,
      label: 'Tutorial',
      sublabel: exercise.tutorialChannel || 'YouTube',
      thumbnail: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`,
      ytId,
    });
  }

  // 2. GIF / animation loop
  if (exercise.gifUrl) {
    items.push({
      type: MEDIA_GIF,
      label: 'Form loop',
      sublabel: 'GIF',
      thumbnail: exercise.gifUrl,
      src: exercise.gifUrl,
    });
  }

  // 3. Start↔End auto-cycle (single thumbnail, loops like a GIF)
  if (exercise.images?.length >= 2) {
    items.push({
      type: MEDIA_FORM,
      label: 'Form',
      sublabel: 'Start → End',
      thumbnail: exercise.images[0],
      images: [exercise.images[0], exercise.images[1]],
    });
  } else if (exercise.images?.length === 1) {
    items.push({
      type: MEDIA_FORM,
      label: 'Form',
      sublabel: 'Position',
      thumbnail: exercise.images[0],
      images: [exercise.images[0]],
    });
  }

  return items;
}

// ─── Hero display for active media ──────────────────────
function HeroMedia({ item, exerciseName }) {
  const [imgError, setImgError] = useState(false);

  // Reset error state when item changes
  useEffect(() => {
    setImgError(false);
  }, [item]);

  if (!item) {
    return (
      <div className="w-full aspect-video rounded-[14px] bg-[repeating-linear-gradient(135deg,#15171C_0_8px,#1A1D24_8px_16px)] border border-hairline flex items-center justify-center text-[11px] text-dim font-mono uppercase">
        NO MEDIA AVAILABLE
      </div>
    );
  }

  // YouTube embed
  if (item.type === MEDIA_TUTORIAL && item.ytId) {
    return (
      <div className="relative w-full aspect-video rounded-[14px] overflow-hidden border border-hairline bg-[#0d0e10]">
        <iframe
          src={`https://www.youtube.com/embed/${item.ytId}?rel=0&modestbranding=1`}
          title={`${exerciseName} tutorial`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
        {/* Tag */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-red-500/20 flex items-center gap-1.5">
          <Play size={10} className="text-red-400 fill-red-400" />
          <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase">YouTube</span>
        </div>
      </div>
    );
  }

  // GIF loop
  if (item.type === MEDIA_GIF) {
    return (
      <div className="relative w-full rounded-[14px] overflow-hidden border border-hairline bg-[#0d0e10]">
        {!imgError ? (
          <img
            src={item.src}
            alt={`${exerciseName} — form loop`}
            onError={() => setImgError(true)}
            className="w-full"
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center text-[11px] text-dim font-mono uppercase">
            GIF UNAVAILABLE
          </div>
        )}
        {/* Tag */}
        <div className="absolute top-3 left-3 pointer-events-none bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-accent/20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-accent uppercase">GIF · Loop</span>
        </div>
      </div>
    );
  }

  // Form: auto-cycle start↔end images
  if (item.type === MEDIA_FORM) {
    return <FormCycleHero images={item.images} exerciseName={exerciseName} />;
  }

  return null;
}

// ─── Auto-cycling start↔end hero ────────────────────────
function FormCycleHero({ images, exerciseName }) {
  const [frame, setFrame] = useState(0);
  const [imgError, setImgError] = useState(false);

  // Auto-cycle between start and end every 1.5s
  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % images.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [images]);

  // Reset on image change
  useEffect(() => {
    setFrame(0);
    setImgError(false);
  }, [images]);

  const label = images.length >= 2
    ? (frame === 0 ? 'Start' : 'End')
    : 'Position';

  return (
    <div className="relative w-full rounded-[14px] overflow-hidden border border-hairline bg-[#0d0e10]">
      {!imgError ? (
        <img
          key={images[frame]}
          src={images[frame]}
          alt={`${exerciseName} — ${label}`}
          onError={() => setImgError(true)}
          className="w-full transition-opacity duration-300"
        />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center text-[11px] text-dim font-mono uppercase">
          IMAGE UNAVAILABLE
        </div>
      )}
      {/* Tag */}
      <div className="absolute top-3 left-3 pointer-events-none bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-accent/20 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="text-[10px] font-mono tracking-widest text-accent uppercase">
          {images.length >= 2 ? `${label} · Loop` : 'Form'}
        </span>
      </div>
      {/* Frame dots */}
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

// ─── Auto-cycling thumbnail for Form items ─────────────
function FormThumb({ images }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % images.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="absolute inset-0 bg-[#0d0e10]">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            i === frame ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ))}
    </div>
  );
}

// ─── Thumbnail strip ────────────────────────────────────
function ThumbnailStrip({ items, activeIndex, onSelect }) {
  if (items.length <= 1) return null;

  return (
    <div
      className="grid gap-2.5 mt-3"
      style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)` }}
    >
      {items.map((item, i) => (
        <button
          key={item.type + i}
          onClick={() => onSelect(i)}
          className={`relative aspect-video rounded-[10px] overflow-hidden border-2 transition-all ${
            activeIndex === i
              ? 'border-accent shadow-[0_0_0_1px_rgba(200,255,61,0.3)]'
              : 'border-hairline hover:border-dim'
          }`}
        >
          {/* Thumbnail image */}
          {item.type === MEDIA_TUTORIAL ? (
            <div className="absolute inset-0 bg-[#0d0e10]">
              <img
                src={item.thumbnail}
                alt=""
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-6 rounded-md bg-red-600/90 flex items-center justify-center">
                  <Play size={10} className="text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
          ) : item.type === MEDIA_FORM && item.images?.length >= 2 ? (
            <FormThumb images={item.images} />
          ) : (
            <div className="absolute inset-0 bg-[#0d0e10]">
              <img
                src={item.thumbnail}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Label overlay */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5">
            <div className="bg-black/75 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-mono tracking-wider text-white/90 uppercase truncate">
              {item.type === MEDIA_TUTORIAL && '▶ '}
              {(item.type === MEDIA_GIF || item.type === MEDIA_FORM) && '● '}
              {item.label}
              {item.sublabel && item.type === MEDIA_TUTORIAL && (
                <span className="text-white/50 ml-1">· {item.sublabel}</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Main page component ────────────────────────────────
export default function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await getExerciseById(exerciseId);
      setExercise(res.data);
      setLoading(false);
    })();
  }, [exerciseId]);

  // Reset media selection when exercise changes
  useEffect(() => {
    setActiveMediaIdx(0);
  }, [exerciseId]);

  if (loading) {
    return (
      <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[800px] lg:mx-auto">
        <Skeleton width={36} height={36} radius={999} />
        <div className="mt-4"><Skeleton width="100%" height={208} radius={14} /></div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <Skeleton width="100%" height={80} radius={10} />
          <Skeleton width="100%" height={80} radius={10} />
        </div>
        <div className="mt-5"><Skeleton width="60%" height={24} /></div>
        <div className="mt-3 flex gap-2"><Skeleton width={60} height={24} radius={999} /><Skeleton width={60} height={24} radius={999} /></div>
        <div className="mt-5"><Skeleton.Card /></div>
      </div>
    );
  }

  if (!exercise) return <div className="p-8 text-muted">Exercise not found.</div>;

  const mediaItems = buildMediaItems(exercise);
  const activeItem = mediaItems[activeMediaIdx] || null;

  return (
    <div className="px-5 pt-2 pb-6 lg:p-8 lg:max-w-[800px] lg:mx-auto">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center mb-4">
        <ChevronLeft size={18} />
      </button>

      {/* ── Gallery: Hero + Thumbnail Strip ── */}
      <HeroMedia item={activeItem} exerciseName={exercise.name} />
      <ThumbnailStrip
        items={mediaItems}
        activeIndex={activeMediaIdx}
        onSelect={setActiveMediaIdx}
      />

      {/* YouTube external link — shown below strip when tutorial exists */}
      {exercise.tutorialUrl && (
        <a
          href={exercise.tutorialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mt-3 py-2 px-4 rounded-[10px] bg-surface border border-hairline text-muted text-xs font-medium hover:border-dim hover:text-text transition-colors"
        >
          <ExternalLink size={12} />
          <span>Watch on YouTube</span>
          {exercise.tutorialChannel && (
            <span className="text-dim">· {exercise.tutorialChannel}</span>
          )}
        </a>
      )}

      {/* ── Title + badges ── */}
      <div className="flex items-start justify-between mt-6">
        <h1 className="text-2xl font-semibold tracking-tight">{exercise.name}</h1>
        <Badge color={exercise.difficulty === 'Beginner' ? 'green' : exercise.difficulty === 'Intermediate' ? 'yellow' : 'red'}>
          {exercise.difficulty}
        </Badge>
      </div>

      <div className="flex gap-1.5 mt-3 flex-wrap">
        <Chip active>{exercise.muscle}</Chip>
        {exercise.secondaryMuscles.map((m) => <Chip key={m}>{m}</Chip>)}
      </div>

      {/* ── Instructions ── */}
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

      {/* ── Details grid ── */}
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

      {/* ── Secondary muscles ── */}
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
