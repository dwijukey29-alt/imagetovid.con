/**
 * Keyforge Spline Studio Audio Engine
 * Continuous, decoupled global audio timeline
 */

export interface AudioTrack {
  id: string;
  name: string;
  size?: string;
  duration: number; // in seconds
  audioBuffer: AudioBuffer; // Decoded buffer
  role?: 'bg' | 'sfx'; // 'bg' = Continuous Background Music, 'sfx' = Repeating Slide Sound Effect
}

/**
 * Concatenates a series of AudioBuffers into a single continuous stream
 */
export function concatenateAudioBuffers(ctx: BaseAudioContext, buffers: AudioBuffer[]): AudioBuffer {
  if (buffers.length === 0) {
    // Return a silent 1-second buffer
    return ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  }
  if (buffers.length === 1) return buffers[0];

  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
  const numberOfChannels = Math.max(...buffers.map(b => b.numberOfChannels));
  const combinedBuffer = ctx.createBuffer(numberOfChannels, totalLength, ctx.sampleRate);

  for (let c = 0; c < numberOfChannels; c++) {
    const combinedData = combinedBuffer.getChannelData(c);
    let offset = 0;
    for (const b of buffers) {
      if (c < b.numberOfChannels) {
        combinedData.set(b.getChannelData(c), offset);
      } else {
        combinedData.set(b.getChannelData(0), offset); // Fallback to channel 0
      }
      offset += b.length;
    }
  }
  return combinedBuffer;
}

/**
 * Compiles custom uploaded tracks into a single concatenated or mixed repeating loop.
 * Supports continuous background tracks and repeating sound effects.
 */
export async function compileCombinedBuffer(
  audioCtx: BaseAudioContext,
  tracks: AudioTrack[],
  options?: {
    totalDuration?: number;   // Total length of compiled buffer in seconds
    repeatInterval?: number;  // Interval in seconds to repeat sfx
    stretchToFit?: boolean;   // stretch sfx to fit repeatInterval
  }
): Promise<AudioBuffer | null> {
  const activeTracks = tracks.filter((t) => !!t.audioBuffer);
  if (activeTracks.length === 0) return null;

  // 1. Determine total length of the target buffer in samples
  const sampleRate = audioCtx.sampleRate;
  const durationSec = options?.totalDuration && options.totalDuration > 0
    ? options.totalDuration
    : Math.max(15, ...activeTracks.map((t) => t.duration)); // default fallback duration

  const targetLength = Math.floor(sampleRate * durationSec);
  const numberOfChannels = Math.max(...activeTracks.map((t) => t.audioBuffer.numberOfChannels));
  const targetBuffer = audioCtx.createBuffer(numberOfChannels, targetLength, sampleRate);

  // 3. Mix tracks into the target buffer based on their role
  for (const track of activeTracks) {
    const b = track.audioBuffer;
    const role = track.role || (track.duration > 10 ? 'bg' : 'sfx'); // Smart fallback logic

    if (role === 'bg') {
      // BACKGROUND MUSIC: Loops continuously to fill targetLength
      let destOffset = 0;
      while (destOffset < targetLength) {
        const copyLength = Math.min(b.length, targetLength - destOffset);
        const channels = Math.min(b.numberOfChannels, targetBuffer.numberOfChannels);
        for (let c = 0; c < channels; c++) {
          const srcData = b.getChannelData(c);
          const destData = targetBuffer.getChannelData(c);
          for (let i = 0; i < copyLength; i++) {
            destData[destOffset + i] += srcData[i];
          }
        }
        destOffset += b.length;
      }
    } else {
      // SOUND EFFECT (SFX): Triggers repeatedly at every repeatInterval
      const intervalSec = options?.repeatInterval && options.repeatInterval > 0
        ? options.repeatInterval
        : 3; // Default 3s repeat interval
      
      const intervalSamples = Math.floor(intervalSec * sampleRate);

      let triggerOffset = 0;
      while (triggerOffset < targetLength) {
        let processedSfxBuffer = b;
        if (options?.stretchToFit) {
          processedSfxBuffer = resampleBuffer(audioCtx, b, intervalSamples);
        }

        const copyLength = Math.min(processedSfxBuffer.length, targetLength - triggerOffset);
        const channels = Math.min(processedSfxBuffer.numberOfChannels, targetBuffer.numberOfChannels);
        for (let c = 0; c < channels; c++) {
          const srcData = processedSfxBuffer.getChannelData(c);
          const destData = targetBuffer.getChannelData(c);
          for (let i = 0; i < copyLength; i++) {
            destData[triggerOffset + i] += srcData[i];
          }
        }

        triggerOffset += intervalSamples;
      }
    }
  }

  // 3. Normalize the output buffer to prevent digital clipping/distortion
  let maxVal = 0;
  for (let c = 0; c < targetBuffer.numberOfChannels; c++) {
    const data = targetBuffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      const absVal = Math.abs(data[i]);
      if (absVal > maxVal) {
        maxVal = absVal;
      }
    }
  }

  if (maxVal > 1.0) {
    const scale = 0.95 / maxVal;
    for (let c = 0; c < targetBuffer.numberOfChannels; c++) {
      const data = targetBuffer.getChannelData(c);
      for (let i = 0; i < data.length; i++) {
        data[i] *= scale;
      }
    }
  }

  return targetBuffer;
}

function resampleBuffer(ctx: BaseAudioContext, buffer: AudioBuffer, targetLength: number): AudioBuffer {
  if (buffer.length === targetLength) return buffer;
  const resampled = ctx.createBuffer(buffer.numberOfChannels, targetLength, ctx.sampleRate);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const srcData = buffer.getChannelData(c);
    const destData = resampled.getChannelData(c);
    const ratio = buffer.length / targetLength;
    for (let i = 0; i < targetLength; i++) {
      const srcIndex = i * ratio;
      const indexLow = Math.floor(srcIndex);
      const indexHigh = Math.min(buffer.length - 1, indexLow + 1);
      const weight = srcIndex - indexLow;
      destData[i] = srcData[indexLow] * (1 - weight) + srcData[indexHigh] * weight;
    }
  }
  return resampled;
}

/**
 * Renders the entire continuous global audio timeline into a single, seamless AudioBuffer
 * matching the exact Total Video Duration (Total Slides x Slide Duration).
 */
export async function renderOfflineCompilation(
  sourceBuffer: AudioBuffer | null,
  totalVideoDuration: number,
  volume: number,
  fadeIn: boolean,
  fadeOut: boolean,
  sampleRate: number = 44100
): Promise<AudioBuffer> {
  // If there is no background audio selected, compile a completely silent background cushion
  if (!sourceBuffer) {
    const offlineCtx = new OfflineAudioContext(1, Math.floor(sampleRate * totalVideoDuration), sampleRate);
    return await offlineCtx.startRendering();
  }

  const offlineCtx = new OfflineAudioContext(
    sourceBuffer.numberOfChannels,
    Math.floor(sampleRate * totalVideoDuration),
    sampleRate
  );

  const sourceNode = offlineCtx.createBufferSource();
  sourceNode.buffer = sourceBuffer;
  sourceNode.loop = true; // Loop continuously if shorter than the video

  const gainNode = offlineCtx.createGain();
  gainNode.gain.setValueAtTime(volume, 0);

  // Apply elegant cinematic fade operations
  if (fadeIn) {
    const fadeInTime = Math.min(1.5, totalVideoDuration * 0.15);
    gainNode.gain.setValueAtTime(0.0001, 0);
    gainNode.gain.exponentialRampToValueAtTime(volume, fadeInTime);
  }

  if (fadeOut) {
    const fadeOutTime = Math.min(2.0, totalVideoDuration * 0.2);
    const fadeStart = totalVideoDuration - fadeOutTime;
    gainNode.gain.setValueAtTime(volume, fadeStart);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, totalVideoDuration);
  }

  sourceNode.connect(gainNode);
  gainNode.connect(offlineCtx.destination);

  sourceNode.start(0);

  return await offlineCtx.startRendering();
}

/**
 * Stateful Controller for the Global Decoupled Real-time Audio Stream
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private combinedBuffer: AudioBuffer | null = null;

  private startTime: number = 0; // Context currentTime when playback started
  private startOffset: number = 0; // Logical position offset in seconds in the combined buffer
  private isPlaying: boolean = false;

  private volume: number = 0.8;
  private fadeIn: boolean = true;
  private fadeOut: boolean = true;

  constructor() {}

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  getContext() {
    this.init();
    return this.ctx!;
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  setFadeOptions(fadeIn: boolean, fadeOut: boolean) {
    this.fadeIn = fadeIn;
    this.fadeOut = fadeOut;
  }

  setCombinedBuffer(buffer: AudioBuffer | null, currentGlobalTime?: number) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }
    this.combinedBuffer = buffer;
    if (currentGlobalTime !== undefined) {
      this.startOffset = currentGlobalTime;
    }
    if (wasPlaying && buffer) {
      this.play(this.startOffset);
    }
  }

  play(offsetInSeconds: number = 0) {
    this.init();
    const ctx = this.ctx!;
    if (!this.combinedBuffer) return;

    if (this.isPlaying) {
      this.pause();
    }

    this.isPlaying = true;
    this.startOffset = offsetInSeconds % this.combinedBuffer.duration;
    this.startTime = ctx.currentTime;

    this.sourceNode = ctx.createBufferSource();
    this.sourceNode.buffer = this.combinedBuffer;
    this.sourceNode.loop = true;

    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);

    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    // Play continuously from current playhead offset
    this.sourceNode.start(0, this.startOffset);
  }

  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.ctx && this.startTime > 0) {
      const elapsed = this.ctx.currentTime - this.startTime;
      this.startOffset = (this.startOffset + elapsed) % (this.combinedBuffer?.duration || 1);
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch (e) {}
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  stop() {
    this.pause();
    this.startOffset = 0;
  }

  seek(globalTime: number) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }
    this.startOffset = globalTime;
    if (wasPlaying) {
      this.play(this.startOffset);
    }
  }

  getCurrentTime(): number {
    if (!this.isPlaying) return this.startOffset;
    if (!this.ctx) return 0;
    const elapsed = this.ctx.currentTime - this.startTime;
    return (this.startOffset + elapsed) % (this.combinedBuffer?.duration || 1);
  }
}
