export default function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={`animate-pulse bg-elevated rounded-card ${className}`}
      style={{ width, height }}
    />
  );
}
