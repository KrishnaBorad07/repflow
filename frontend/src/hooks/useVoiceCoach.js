import { useCallback, useEffect, useRef } from 'react';
import { speakCue } from '../services/cvService';

/**
 * Plays an LLM-coach cue as spoken audio via OpenAI TTS.
 *
 * Behaviour:
 *   • Same cue text within `dedupMs` is suppressed (no parroting).
 *   • A new cue interrupts the currently-playing one — the latest cue is
 *     always the most relevant (the previous rep is over).
 *   • Mute disables network calls AND stops any in-flight playback.
 *
 * Returns a function `speak(text)` you can call when a new cue arrives.
 */
export default function useVoiceCoach({ enabled = true, voice = 'nova', dedupMs = 9000 } = {}) {
  const audioRef = useRef(null);
  const lastUrlRef = useRef(null);
  const lastTextRef = useRef('');
  const lastSpokeAtRef = useRef(0);
  const inFlightRef = useRef(false);
  const enabledRef = useRef(enabled);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
      audioRef.current = null;
    }
    if (lastUrlRef.current) {
      URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = null;
    }
  }, []);

  // Stop in-flight audio when voice gets disabled mid-cue.
  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);

  // Cleanup on unmount.
  useEffect(() => stop, [stop]);

  const speak = useCallback(async (text) => {
    if (!enabledRef.current || !text || !text.trim()) return;
    const now = Date.now();
    if (text === lastTextRef.current && now - lastSpokeAtRef.current < dedupMs) return;
    if (inFlightRef.current) return;            // single in-flight TTS at a time
    inFlightRef.current = true;
    try {
      const url = await speakCue(text, { voice });
      // Re-check enabled — user may have muted while we were waiting on TTS.
      if (!enabledRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      stop(); // interrupt any audio still playing from a previous cue
      const audio = new Audio(url);
      audio.volume = 0.95;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
        if (lastUrlRef.current === url) lastUrlRef.current = null;
      };
      audioRef.current = audio;
      lastUrlRef.current = url;
      lastTextRef.current = text;
      lastSpokeAtRef.current = now;
      audio.play().catch((err) => {
        // Autoplay can be blocked until first user gesture — mute resolves it.
        console.warn('Voice coach autoplay blocked:', err);
      });
    } catch (err) {
      console.warn('Voice coach speak failed:', err);
    } finally {
      inFlightRef.current = false;
    }
  }, [voice, dedupMs, stop]);

  return { speak, stop };
}
