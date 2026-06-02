import { useEffect, useRef, useState } from 'react';
import { analyzeFrame } from '../services/cvService';

/**
 * Periodic LLM-powered form check.
 *
 * Each tick captures a BURST of N frames spaced `frameIntervalMs` apart so
 * the LLM can see motion (descent → bottom → ascent), not just one still
 * pose. Multi-frame is the single biggest accuracy win for vision coaching.
 */
export default function useFormCoach({
  videoRef,
  enabled,
  exerciseName,
  setNumber,
  repCountRef,
  metricsRef,
  metricsHistoryRef,
  recentCuesRef,
  intervalMs = 3000,
  captureWidth = 768,
  framesPerCall = 3,
  frameIntervalMs = 400,
  onResult,
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const inFlightRef = useRef(false);
  const captureCanvasRef = useRef(null);
  const onResultRef = useRef(onResult);
  // Only block a rep after 2 consecutive bad verdicts — single bad frames are too noisy.
  const consecutiveBadRef = useRef(0);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  useEffect(() => {
    consecutiveBadRef.current = 0;
    if (!enabled || !exerciseName) return undefined;

    const captureFrame = async () => {
      const video = videoRef?.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return null;

      const aspect = video.videoHeight / video.videoWidth;
      const w = captureWidth;
      const h = Math.round(captureWidth * aspect);

      let canvas = captureCanvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        captureCanvasRef.current = canvas;
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(video, 0, 0, w, h);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.88)
      );
      if (!blob) return null;
      const dataUrl = await blobToBase64(blob);
      return dataUrl.split(',')[1] || dataUrl;
    };

    const tick = async () => {
      if (inFlightRef.current) return;
      const video = videoRef?.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      // Capture N frames spaced frameIntervalMs apart.
      const t0 = Date.now();
      const frames = [];
      for (let i = 0; i < framesPerCall; i++) {
        const b64 = await captureFrame();
        if (b64) frames.push({ image_b64: b64, t_offset_ms: Date.now() - t0 });
        if (i < framesPerCall - 1) {
          await new Promise((r) => setTimeout(r, frameIntervalMs));
        }
      }
      if (frames.length === 0) return;

      inFlightRef.current = true;
      setIsAnalyzing(true);
      try {
        const result = await analyzeFrame({
          frames,
          exercise_name: exerciseName,
          set_number: setNumber ?? null,
          rep_number: repCountRef?.current ?? null,
          metrics: metricsRef?.current ?? null,
          metrics_history: metricsHistoryRef?.current ?? null,
          recent_cues: recentCuesRef?.current ?? null,
        });
        // Debounce rep rejection: require 2 consecutive bad verdicts before blocking a rep.
        // A single blurry or misread frame should not reject a good rep.
        const adjustedResult = { ...result };
        if (result.should_count_rep === false) {
          consecutiveBadRef.current += 1;
          if (consecutiveBadRef.current < 2) {
            adjustedResult.should_count_rep = true;
          }
        } else {
          consecutiveBadRef.current = 0;
        }

        setLastResult(adjustedResult);
        setError(null);
        if (onResultRef.current) onResultRef.current(adjustedResult);
      } catch (err) {
        console.warn('Form coach call failed:', err);
        setError(err?.message || 'Form coach unavailable');
      } finally {
        inFlightRef.current = false;
        setIsAnalyzing(false);
      }
    };

    const initial = setTimeout(tick, 800);
    const id = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [
    enabled, exerciseName, setNumber, intervalMs, captureWidth,
    framesPerCall, frameIntervalMs,
    videoRef, repCountRef, metricsRef, metricsHistoryRef, recentCuesRef,
  ]);

  return { isAnalyzing, lastResult, error };
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
