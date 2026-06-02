/**
 * Workout audio helpers — TTS coaching cues and short tones.
 *
 * Both stay in-browser (no audio assets required):
 *   • Web Speech API for spoken cues
 *   • Web Audio API generates tones on the fly
 *
 * Mute state persists in localStorage so the user's choice carries
 * across sessions. Calling `setMuted(true)` also cancels any in-flight
 * speech so the gym stays quiet immediately.
 */

const STORAGE_KEY = 'repflow_audio_muted';

let muted = (() => {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; }
  catch { return false; }
})();
let lastSpokenAt = 0;
let lastSpokenText = '';
let audioCtx = null;

const listeners = new Set();

function getCtx() {
  if (audioCtx) return audioCtx;
  const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

export const isMuted = () => muted;

export function setMuted(value) {
  muted = !!value;
  try { localStorage.setItem(STORAGE_KEY, muted ? '1' : '0'); } catch {}
  if (muted && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  listeners.forEach((cb) => cb(muted));
}

export function subscribeMuted(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Speak text via Web Speech API.
 *
 * NOTE — voice is currently disabled by default. The user can re-enable
 * it with setVoiceEnabled(true). Cues should be displayed visually for
 * now; we'll bring voice back once the LLM coach text is dialed in.
 */
let voiceEnabled = false;

export function setVoiceEnabled(value) {
  voiceEnabled = !!value;
  if (!voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
export const isVoiceEnabled = () => voiceEnabled;

export function speak(text, { throttleMs = 3500, interrupt = false } = {}) {
  if (!voiceEnabled || muted || !text) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const now = Date.now();
  if (text === lastSpokenText && now - lastSpokenAt < throttleMs) return;

  const synth = window.speechSynthesis;
  if (interrupt) synth.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  u.pitch = 1.0;
  u.volume = 0.95;
  synth.speak(u);

  lastSpokenAt = now;
  lastSpokenText = text;
}

/**
 * Play a short sine-wave chime. Used for rep ticks and rest-end alerts.
 */
export function chime(freq = 880, duration = 0.15, volume = 0.18) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.value = volume;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext can fail before any user gesture — silent fallthrough.
  }
}

// ──── Presets ────

export const repTick = () => chime(660, 0.08, 0.14);
export const setCompleteSound = () => {
  chime(660, 0.12, 0.18);
  setTimeout(() => chime(880, 0.18, 0.2), 130);
};
export const restEndSound = () => {
  chime(880, 0.2, 0.22);
  setTimeout(() => chime(880, 0.2, 0.22), 240);
};
