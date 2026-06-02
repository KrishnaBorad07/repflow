import { useCallback, useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

/**
 * Real-time pose detection hook backed by MoveNet Lightning.
 *
 * Model and TF backend are loaded lazily and shared across hook instances —
 * the model bundle is ~10 MB so we only fetch it once per page session.
 *
 * The hook does NOT own the video element; it estimates poses against the
 * one passed in via `videoRef`. Each frame's keypoints are pushed through
 * the `onPose` callback so the consumer can draw or analyze without forcing
 * a React re-render at 30 fps (state would be too expensive).
 *
 * Usage:
 *   const { isModelLoading, isActive, start, stop, error } = usePoseDetection({
 *     videoRef,
 *     enabled: cameraActive,
 *     onPose: (keypoints) => drawSkeleton(canvas, keypoints),
 *   });
 */

let detectorPromise = null;

async function getDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      return poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
    })();
  }
  return detectorPromise;
}

export default function usePoseDetection({ videoRef, enabled = false, onPose } = {}) {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const onPoseRef = useRef(onPose);
  const enabledRef = useRef(enabled);

  // Keep refs current so the RAF closure doesn't go stale across re-renders.
  useEffect(() => { onPoseRef.current = onPose; }, [onPose]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsActive(false);
  }, []);

  const loop = useCallback(async () => {
    if (!enabledRef.current) {
      stop();
      return;
    }

    const video = videoRef?.current;
    const detector = detectorRef.current;

    // Wait for the video to have at least one decoded frame before estimating.
    if (detector && video && video.readyState >= 2 && !video.paused) {
      try {
        const poses = await detector.estimatePoses(video, { maxPoses: 1, flipHorizontal: false });
        const keypoints = poses?.[0]?.keypoints ?? [];
        if (onPoseRef.current) onPoseRef.current(keypoints);
      } catch (err) {
        // Don't kill the loop on a single bad frame — log and continue.
        console.warn('Pose estimation frame failed:', err);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [stop, videoRef]);

  const start = useCallback(async () => {
    if (rafRef.current) return; // already running
    setError(null);
    try {
      if (!detectorRef.current) {
        setIsModelLoading(true);
        detectorRef.current = await getDetector();
        setIsModelLoading(false);
      }
      setIsActive(true);
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      console.error('Failed to start pose detection:', err);
      setError(err?.message || 'Failed to load pose model');
      setIsModelLoading(false);
      setIsActive(false);
    }
  }, [loop]);

  // Auto-start/stop in response to `enabled` flips.
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { isModelLoading, isActive, error, start, stop };
}
