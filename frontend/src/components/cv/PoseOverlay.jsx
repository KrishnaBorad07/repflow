import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { SKELETON_EDGES, getKeypointMap } from '../../utils/poseAnalysis';

/**
 * Skeleton renderer (Spec 3.2).
 *
 * Imperative draw to keep render cost off the React tree — calling
 * `setState` at 30 fps would tank the rest of the page. The parent
 * holds a ref and calls `overlayRef.current.draw(keypoints, jointStatus)`
 * inside its own pose-detection callback.
 *
 * jointStatus shape: { [keypoint_name]: 'good' | 'warn' | 'bad' }
 *   • good → green skeleton (default)
 *   • warn → yellow highlight
 *   • bad  → red highlight
 * Edges take the higher-severity color of their two endpoints.
 */

const COLORS = {
  good: '#7BD88F',
  warn: '#E8C454',
  bad: '#E96A6A',
  default: 'rgba(255, 255, 255, 0.85)',
};

const SEVERITY = { good: 1, warn: 2, bad: 3 };

const PoseOverlay = forwardRef(function PoseOverlay({ videoRef, className = '' }, ref) {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    draw: (keypoints, jointStatus) =>
      drawSkeleton(canvasRef.current, videoRef?.current, keypoints, jointStatus),
    clear: () => {
      const c = canvasRef.current;
      if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
    },
  }));

  // Match canvas backing-store size to its CSS box, otherwise the skeleton
  // stretches whenever the layout changes (rotate, resize, sidebar open).
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef?.current;
    if (!canvas || !video) return;
    const resize = () => {
      const rect = video.getBoundingClientRect();
      canvas.width = Math.max(rect.width, 1);
      canvas.height = Math.max(rect.height, 1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(video);
    return () => ro.disconnect();
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
});

export default PoseOverlay;

function drawSkeleton(canvas, video, keypoints, jointStatus = {}) {
  if (!canvas || !video || !keypoints?.length) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const sw = video.videoWidth || canvas.width;
  const sh = video.videoHeight || canvas.height;
  const dw = canvas.width;
  const dh = canvas.height;

  // <video> uses object-cover; replicate that scale+crop so the skeleton
  // sits over the visible part of the feed, not the cropped letterbox.
  const scale = Math.max(dw / sw, dh / sh);
  const offsetX = (dw - sw * scale) / 2;
  const offsetY = (dh - sh * scale) / 2;
  const project = (p) => ({ x: p.x * scale + offsetX, y: p.y * scale + offsetY });

  ctx.clearRect(0, 0, dw, dh);

  const map = getKeypointMap(keypoints, 0.3);

  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [aName, bName] of SKELETON_EDGES) {
    const a = map[aName];
    const b = map[bName];
    if (!a || !b) continue;

    const sa = jointStatus[aName];
    const sb = jointStatus[bName];
    let color = COLORS.default;
    if (sa || sb) {
      const dominant = (SEVERITY[sa] || 0) >= (SEVERITY[sb] || 0) ? sa : sb;
      color = COLORS[dominant] || COLORS.default;
    }

    const pa = project(a);
    const pb = project(b);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  // Joint dots
  for (const name of Object.keys(map)) {
    const status = jointStatus[name];
    ctx.fillStyle = status ? COLORS[status] : '#C8FF3D';
    const p = project(map[name]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
