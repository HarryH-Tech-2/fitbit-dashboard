export type SoundName = 'interval-start' | 'interval-end' | 'countdown-beep' | 'workout-complete';

const SOUND_URLS: Record<SoundName, string> = {
  'interval-start': '/sounds/interval-start.mp3',
  'interval-end': '/sounds/interval-end.mp3',
  'countdown-beep': '/sounds/countdown-beep.mp3',
  'workout-complete': '/sounds/workout-complete.mp3',
};

let audioContext: AudioContext | null = null;
const bufferCache = new Map<SoundName, AudioBuffer>();

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export async function unlockAudio(): Promise<void> {
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

export async function preloadSounds(): Promise<void> {
  const ctx = getContext();
  await Promise.all(
    (Object.entries(SOUND_URLS) as [SoundName, string][]).map(async ([name, url]) => {
      if (bufferCache.has(name)) return;
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        bufferCache.set(name, audioBuffer);
      } catch {
        // Sound file not available, fail silently
      }
    }),
  );
}

export function playSound(name: SoundName): void {
  const ctx = getContext();
  const buffer = bufferCache.get(name);
  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}

/** Generate a simple beep tone as fallback */
export function playBeep(frequency = 880, duration = 0.15): void {
  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.3;
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}
