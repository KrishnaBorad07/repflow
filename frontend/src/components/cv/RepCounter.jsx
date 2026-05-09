// Phase 2 placeholder — automatic rep counter
export default function RepCounter({ count = 0, target = 10 }) {
  return (
    <div className="bg-accent text-accent-ink px-[18px] py-2.5 rounded-pill font-bold text-[22px] font-mono">
      {count} / {target}
    </div>
  );
}
