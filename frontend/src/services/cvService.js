import api from './api';

/**
 * Send 1+ keyframes to the backend for LLM form analysis. Multi-frame
 * payloads let the LLM see motion (descent → bottom → ascent), which
 * dramatically improves the specificity of cues.
 */
export async function analyzeFrame(payload) {
  const { data } = await api.post('/cv/analyze-frame', payload, { timeout: 18000 });
  return data;
}

/**
 * Convert a coaching cue string to spoken audio (OpenAI TTS).
 * Returns a Blob URL the caller can plug into an <audio> element.
 */
export async function speakCue(text, { voice = 'nova', speed = 1.05 } = {}) {
  const response = await api.post(
    '/cv/speak',
    { text, voice, speed },
    { responseType: 'blob', timeout: 12000 }
  );
  return URL.createObjectURL(response.data);
}
