export default function Card({ children, className = '', highlight = false, onClick, ...props }) {
  return (
    <div
      className={`bg-surface border rounded-card ${highlight ? 'border-accent/40 bg-accent/5' : 'border-hairline'} ${onClick ? 'cursor-pointer hover:border-hairline-2' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
