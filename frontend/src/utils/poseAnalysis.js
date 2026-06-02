/**
 * Pure helpers for working with MoveNet/BlazePose keypoints.
 *
 * Keypoint shape (MoveNet COCO-17): { x, y, score, name }.
 * Coordinates are in source-image pixels — the renderer scales them to
 * canvas size, the analyzer just consumes raw values.
 */

// COCO-17 keypoint names (MoveNet output).
export const KEYPOINT_NAMES = {
  NOSE: 'nose',
  LEFT_EYE: 'left_eye',
  RIGHT_EYE: 'right_eye',
  LEFT_EAR: 'left_ear',
  RIGHT_EAR: 'right_ear',
  LEFT_SHOULDER: 'left_shoulder',
  RIGHT_SHOULDER: 'right_shoulder',
  LEFT_ELBOW: 'left_elbow',
  RIGHT_ELBOW: 'right_elbow',
  LEFT_WRIST: 'left_wrist',
  RIGHT_WRIST: 'right_wrist',
  LEFT_HIP: 'left_hip',
  RIGHT_HIP: 'right_hip',
  LEFT_KNEE: 'left_knee',
  RIGHT_KNEE: 'right_knee',
  LEFT_ANKLE: 'left_ankle',
  RIGHT_ANKLE: 'right_ankle',
};

// Edges to draw for the skeleton overlay. Pairs of keypoint names.
export const SKELETON_EDGES = [
  // Face
  ['left_eye', 'right_eye'],
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
  // Torso
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  // Arms
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  // Legs
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

/**
 * Convert a flat keypoints array into a {name -> keypoint} map, dropping
 * any below `minScore` so callers don't have to nullcheck per use.
 */
export function getKeypointMap(keypoints, minScore = 0.3) {
  const map = {};
  if (!keypoints) return map;
  for (const kp of keypoints) {
    if (kp && kp.name && kp.score >= minScore) map[kp.name] = kp;
  }
  return map;
}

/**
 * Angle (degrees) at vertex p2, formed by rays p2→p1 and p2→p3.
 *
 * For knee flexion: angleAt(hip, knee, ankle) — straight leg ≈ 180°,
 * deep squat ≈ 70-90°.
 * For elbow: angleAt(shoulder, elbow, wrist) — full extension ≈ 180°,
 * curl peak ≈ 30-60°.
 */
export function angleAt(p1, p2, p3) {
  if (!p1 || !p2 || !p3) return null;
  const v1x = p1.x - p2.x;
  const v1y = p1.y - p2.y;
  const v2x = p3.x - p2.x;
  const v2y = p3.y - p2.y;
  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.hypot(v1x, v1y);
  const mag2 = Math.hypot(v2x, v2y);
  if (mag1 === 0 || mag2 === 0) return null;
  const cos = Math.min(1, Math.max(-1, dot / (mag1 * mag2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Default "is the user framed correctly" check — full body visible.
 * Used as the fallback when no analyzer-specific list is provided.
 */
export const FULL_BODY_KEYPOINTS = [
  'left_shoulder', 'right_shoulder',
  'left_hip', 'right_hip',
  'left_knee', 'right_knee',
  'left_ankle', 'right_ankle',
];

export const LOWER_BODY_KEYPOINTS = [
  'left_hip', 'right_hip',
  'left_knee', 'right_knee',
  'left_ankle', 'right_ankle',
];

export const UPPER_BODY_KEYPOINTS = [
  'left_shoulder', 'right_shoulder',
  'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist',
];

/**
 * Returns true if every keypoint in `names` is detected with at least
 * `minScore` confidence.
 *
 * MoveNet emits "best guess" keypoints at 0.3-0.4 even when out of frame,
 * so we use 0.4 as the floor and let the caller debounce the result over
 * multiple frames to filter out single-frame flickers.
 */
export function areKeypointsVisible(keypoints, names = FULL_BODY_KEYPOINTS, minScore = 0.4) {
  const map = getKeypointMap(keypoints, minScore);
  return names.every((n) => map[n]);
}

export function isFullBodyVisible(keypoints, minScore = 0.4) {
  return areKeypointsVisible(keypoints, FULL_BODY_KEYPOINTS, minScore);
}
