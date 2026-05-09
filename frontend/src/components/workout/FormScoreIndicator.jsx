export default function FormScoreIndicator({ score }) {
  const color = score >= 8 ? 'text-good' : score >= 6 ? 'text-warn' : 'text-bad';
  const label = score >= 8 ? 'Good' : score >= 6 ? 'Fair' : 'Needs work';

  return (
    <div className="text-right">
      <div className={`font-mono tabular-nums text-[22px] font-semibold ${color}`}>{score.toFixed(1)}</div>
      <div className="text-[10px] text-dim uppercase">{label}</div>
    </div>
  );
}
