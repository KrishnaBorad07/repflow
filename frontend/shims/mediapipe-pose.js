// Stub for @mediapipe/pose. We only run MoveNet, never BlazePose, so the
// runtime never actually invokes anything from this module — it just needs
// to satisfy the static `import { Pose } from '@mediapipe/pose'` that lives
// inside @tensorflow-models/pose-detection.
export class Pose {
  constructor() {
    throw new Error('BlazePose is not enabled in this build — use MoveNet.');
  }
}

export default { Pose };
