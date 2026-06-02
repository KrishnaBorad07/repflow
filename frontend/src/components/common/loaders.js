/**
 * RepFlow — Loader Components Barrel Export
 *
 * Import all loaders from one place:
 *   import { PlateSpinLoader, WaveLoader, Skeleton } from '../components/common/loaders';
 *
 * Loader index & use-cases:
 *   01 · Loader (Bar Lift)     — App splash, full-page transitions
 *   02 · PlateSpinLoader       — Default in-app spinner (generating plan, fetching data)
 *   05 · RingLoader            — Pull-to-refresh, inline data sync
 *   07 · PlateStackLoader      — Analytics/volume computation
 *   09 · FormLockLoader        — CV camera warmup, model calibration
 *   12 · StopwatchLoader       — Rest timer init, EMOM/AMRAP loading
 *   14 · SquatLoader           — Onboarding "building your plan"
 *   15 · WaveLoader            — AI chat thinking, voice coach
 *   LinearProgress             — Top-of-page indeterminate bar
 *   Skeleton                   — Shimmer placeholders (Box, ListItem, List, Card, Chart)
 *   MiniSpinner                — Inline button/chip spinners (ring, plate, dots, bar)
 *   LiveChip                   — Pulsing "LIVE" indicator
 */

export { default as Loader } from './Loader';
export { default as PlateSpinLoader } from './PlateSpinLoader';
export { default as RingLoader } from './RingLoader';
export { default as PlateStackLoader } from './PlateStackLoader';
export { default as FormLockLoader } from './FormLockLoader';
export { default as StopwatchLoader } from './StopwatchLoader';
export { default as SquatLoader } from './SquatLoader';
export { default as WaveLoader } from './WaveLoader';
export { default as LinearProgress } from './LinearProgress';
export { default as Skeleton } from './Skeleton';
export { default as MiniSpinner, LiveChip } from './MiniSpinner';
