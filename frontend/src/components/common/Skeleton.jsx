/**
 * RepFlow — Skeleton Placeholders
 * Shimmer placeholders for content loading states.
 * Use for: initial fetch of any list/card/chart screen.
 *
 * Usage:
 *   <Skeleton width="70%" height={12} />           — basic shimmer block
 *   <Skeleton.ListItem />                           — avatar + 2 text lines
 *   <Skeleton.List count={3} />                     — multiple ListItems
 *   <Skeleton.Card />                               — card with title, body, chips
 *   <Skeleton.Chart />                              — bar chart placeholder
 */

const shimmerClass = 'rf-skeleton';

function ShimmerStyle() {
  return (
    <style>{`
      .${shimmerClass} {
        background: linear-gradient(90deg, #1A1D24 0%, #262932 50%, #1A1D24 100%);
        background-size: 200% 100%;
        animation: rf-shimmer 1.4s ease-in-out infinite;
      }
      @keyframes rf-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}

function Box({ width = '100%', height = 12, radius = 6, className = '' }) {
  return (
    <div
      className={`${shimmerClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
      }}
    />
  );
}

function ListItem({ className = '' }) {
  return (
    <div className={`flex gap-3 items-center ${className}`}>
      <Box width={44} height={44} radius={12} />
      <div className="flex-1 flex flex-col gap-1.5">
        <Box width="70%" height={12} />
        <Box width="40%" height={10} />
      </div>
    </div>
  );
}

function List({ count = 3, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <ListItem key={i} />
      ))}
    </div>
  );
}

function Card({ className = '' }) {
  return (
    <div
      className={`flex flex-col gap-2.5 p-4 ${className}`}
      style={{ border: '1px solid var(--hairline, #262932)', borderRadius: 14 }}
    >
      <Box width="50%" height={10} />
      <Box width="75%" height={22} />
      <Box width="100%" height={80} />
      <div className="flex gap-2">
        <Box width={60} height={20} radius={999} />
        <Box width={40} height={20} radius={999} />
      </div>
    </div>
  );
}

function Chart({ barCount = 7, className = '' }) {
  const heights = [30, 60, 45, 80, 55, 70, 90];
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <Box width="40%" height={10} />
      <div className="flex gap-1.5 items-end" style={{ height: 100 }}>
        {Array.from({ length: barCount }, (_, i) => (
          <Box
            key={i}
            width={14}
            height={`${heights[i % heights.length]}%`}
            radius={4}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Default export: basic shimmer box (backwards compatible).
 * Also has compound sub-components: Skeleton.ListItem, Skeleton.List, etc.
 */
export default function Skeleton({ className = '', width, height, radius = 6 }) {
  return (
    <>
      <ShimmerStyle />
      <Box
        width={width}
        height={height}
        radius={radius}
        className={className}
      />
    </>
  );
}

Skeleton.Box = Box;
Skeleton.ListItem = ListItem;
Skeleton.List = List;
Skeleton.Card = Card;
Skeleton.Chart = Chart;
Skeleton.ShimmerStyle = ShimmerStyle;
