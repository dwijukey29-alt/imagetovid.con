import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Music, 
  Volume2, 
  Video, 
  Download, 
  Check,
  Eye,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { 
  AudioTrack, 
  AudioManager, 
  compileCombinedBuffer, 
  renderOfflineCompilation 
} from './audio';

interface ImageItem {
  id: string;
  url: string;
  name: string;
  size: string;
  presetId: string;
  imgEl: HTMLImageElement;
}

import { Preset, PRESETS as ALL_PRESETS } from './presets';

const PRESETS: Preset[] = ALL_PRESETS;
const UNUSED_LEGACY_PRESETS: any[] = [
  // --- CINEMATIC (8 variants: Slow, smooth drone sweeps & tilt dynamics) ---
  {
    id: 'c-slow-drift',
    name: 'Classic Pan-Drift',
    category: 'Cinematic',
    description: 'Ultra-slow horizontal crane glide from left to right',
    k1: { scale: 1.05, tx: -15, ty: 0 },
    k2: { scale: 1.15, tx: 0, ty: 0 },
    k3: { scale: 1.25, tx: 15, ty: 0 }
  },
  {
    id: 'c-rising-drone',
    name: 'Rising Drone Crane',
    category: 'Cinematic',
    description: 'Slow vertical elevation shift mimicking upward camera rise',
    k1: { scale: 1.05, tx: 0, ty: 15 },
    k2: { scale: 1.18, tx: 0, ty: 0 },
    k3: { scale: 1.3, tx: 0, ty: -15 }
  },
  {
    id: 'c-descending-orbit',
    name: 'Descending Orbit Sweep',
    category: 'Cinematic',
    description: 'Slow helical camera downward arc with widening view field',
    k1: { scale: 1.25, tx: 12, ty: -12 },
    k2: { scale: 1.15, tx: 0, ty: 0 },
    k3: { scale: 1.05, tx: -12, ty: 12 }
  },
  {
    id: 'c-diagonal-glide',
    name: 'Diagonal Vector Glide',
    category: 'Cinematic',
    description: 'Sweeping continuous glide from lower-left to top-right',
    k1: { scale: 1.1, tx: -16, ty: 16 },
    k2: { scale: 1.18, tx: 0, ty: 0 },
    k3: { scale: 1.25, tx: 16, ty: -16 }
  },
  {
    id: 'c-panoramic-sweep',
    name: 'Panoramic Horizon Scan',
    category: 'Cinematic',
    description: 'Wide continuous panorama scan optimized for broad environments',
    k1: { scale: 1.22, tx: -22, ty: 0 },
    k2: { scale: 1.1, tx: 0, ty: 3 },
    k3: { scale: 1.22, tx: 22, ty: 0 }
  },
  {
    id: 'c-crane-tilt',
    name: 'Vertical Crane Tilt',
    category: 'Cinematic',
    description: 'Slow vertical pivot starting overhead tilting downwards',
    k1: { scale: 1.0, tx: 0, ty: -22 },
    k2: { scale: 1.12, tx: 0, ty: -6 },
    k3: { scale: 1.25, tx: 0, ty: 12 }
  },
  {
    id: 'c-serene-reveal',
    name: 'Slow Serene Reveal',
    category: 'Cinematic',
    description: 'Gentle diagonal scale-up revealing subtle frame corners',
    k1: { scale: 1.0, tx: 6, ty: 6 },
    k2: { scale: 1.14, tx: 0, ty: 3 },
    k3: { scale: 1.28, tx: -6, ty: 0 }
  },
  {
    id: 'c-mystic-horizon',
    name: 'Mystic Horizon Tilt',
    category: 'Cinematic',
    description: 'Atmospheric slow scale-up and leftward landscape pan',
    k1: { scale: 1.16, tx: -10, ty: -10 },
    k2: { scale: 1.16, tx: 0, ty: 0 },
    k3: { scale: 1.16, tx: 10, ty: 10 }
  },

  // --- ZOOM (8 variants: Dramatic scaling profiles, fast / slow) ---
  {
    id: 'z-push-in',
    name: 'Epic Center Push-In',
    category: 'Zoom',
    description: 'Steady, highly smooth forward cinematic focal zoom',
    k1: { scale: 1.0, tx: 0, ty: 0 },
    k2: { scale: 1.35, tx: 0, ty: 0 },
    k3: { scale: 1.7, tx: 0, ty: 0 }
  },
  {
    id: 'z-pull-out',
    name: 'Dramatic Center Pull-Out',
    category: 'Zoom',
    description: 'Smooth backwards zoom revealing complete scene backdrop',
    k1: { scale: 1.7, tx: 0, ty: 0 },
    k2: { scale: 1.35, tx: 0, ty: 0 },
    k3: { scale: 1.0, tx: 0, ty: 0 }
  },
  {
    id: 'z-vortex-spin',
    name: 'Vortex Deep Zoom',
    category: 'Zoom',
    description: 'High-speed diagonal vortex zoom focusing into frame',
    k1: { scale: 0.95, tx: -6, ty: -6 },
    k2: { scale: 1.45, tx: 0, ty: 0 },
    k3: { scale: 1.9, tx: 6, ty: 6 }
  },
  {
    id: 'z-subtle-breathing',
    name: 'Harmonic Breathing',
    category: 'Zoom',
    description: 'Very gentle cyclical scaling resembling natural breathing',
    k1: { scale: 1.0, tx: 0, ty: 0 },
    k2: { scale: 1.22, tx: 0, ty: 0 },
    k3: { scale: 1.0, tx: 0, ty: 0 }
  },
  {
    id: 'z-offset-focus',
    name: 'Diagonal Offset Zoom',
    category: 'Zoom',
    description: 'Zooming towards upper-right quadrant focal point',
    k1: { scale: 1.1, tx: 0, ty: 0 },
    k2: { scale: 1.38, tx: 12, ty: -12 },
    k3: { scale: 1.65, tx: 24, ty: -24 }
  },
  {
    id: 'z-macro-detail',
    name: 'Macro Corner Probe',
    category: 'Zoom',
    description: 'Deep high-impact zoom targeting lower-left texture detail',
    k1: { scale: 1.15, tx: 0, ty: 0 },
    k2: { scale: 1.48, tx: -18, ty: 18 },
    k3: { scale: 1.8, tx: -36, ty: 36 }
  },
  {
    id: 'z-parallax-pulse',
    name: 'Double-Beat Parallax',
    category: 'Zoom',
    description: 'Dynamic double pulse pattern for textured dimensions',
    k1: { scale: 1.05, tx: 0, ty: 0 },
    k2: { scale: 1.18, tx: 0, ty: 0 },
    k3: { scale: 1.38, tx: 0, ty: 0 }
  },
  {
    id: 'z-cinematic-snap',
    name: 'Cinematic Snap-Back',
    category: 'Zoom',
    description: 'Rapid start scaling that slowly eases back to wide',
    k1: { scale: 1.55, tx: 0, ty: 0 },
    k2: { scale: 1.42, tx: 0, ty: 0 },
    k3: { scale: 1.1, tx: 0, ty: 0 }
  },

  // --- DYNAMIC (8 variants: High energy shifts, shakes, rebounds) ---
  {
    id: 'd-action-jolt',
    name: 'Energetic Action Jolt',
    category: 'Dynamic',
    description: 'Rapid speed expansion with localized shake offsets',
    k1: { scale: 1.0, tx: 0, ty: 0 },
    k2: { scale: 1.48, tx: 12, ty: -12 },
    k3: { scale: 1.18, tx: -6, ty: 6 }
  },
  {
    id: 'd-whip-pan',
    name: 'Action Whip Pan Right',
    category: 'Dynamic',
    description: 'Extreme acceleration sweep sliding rapidly rightward',
    k1: { scale: 1.25, tx: -28, ty: 0 },
    k2: { scale: 1.12, tx: 18, ty: 0 },
    k3: { scale: 1.25, tx: 35, ty: 0 }
  },
  {
    id: 'd-seismic-tremor',
    name: 'Seismic Earth Shake',
    category: 'Dynamic',
    description: 'Heavy physical vibration simulation across X and Y axes',
    k1: { scale: 1.22, tx: -6, ty: 6 },
    k2: { scale: 1.38, tx: 14, ty: -14 },
    k3: { scale: 1.22, tx: -12, ty: 12 }
  },
  {
    id: 'd-elastic-rebound',
    name: 'Snappy Elastic Bounce',
    category: 'Dynamic',
    description: 'Intense pop scaling with high energy elasticity',
    k1: { scale: 1.0, tx: 0, ty: 0 },
    k2: { scale: 1.55, tx: 0, ty: 0 },
    k3: { scale: 1.12, tx: 0, ty: 0 }
  },
  {
    id: 'd-sidewinder',
    name: 'Sidewinder Slalom',
    category: 'Dynamic',
    description: 'S-curve slalom drift with alternating tilts',
    k1: { scale: 1.15, tx: -18, ty: -12 },
    k2: { scale: 1.28, tx: 18, ty: 0 },
    k3: { scale: 1.15, tx: -18, ty: 12 }
  },
  {
    id: 'd-glitch-jolt',
    name: 'Spasmodic Glitch Jolt',
    category: 'Dynamic',
    description: 'Rapid micro scale jumps simulating camera interference',
    k1: { scale: 1.12, tx: 10, ty: -10 },
    k2: { scale: 1.55, tx: -14, ty: 14 },
    k3: { scale: 1.12, tx: 5, ty: -5 }
  },
  {
    id: 'd-hyper-lapse',
    name: 'Hyperlapse Drift',
    category: 'Dynamic',
    description: 'High velocity diagonal acceleration tunnel effect',
    k1: { scale: 1.0, tx: -12, ty: -12 },
    k2: { scale: 1.35, tx: 6, ty: 6 },
    k3: { scale: 1.65, tx: 24, ty: 24 }
  },
  {
    id: 'd-sonic-boom',
    name: 'Sonic Blast Compression',
    category: 'Dynamic',
    description: 'Instant maximum expansion with heavy vertical bounce',
    k1: { scale: 1.0, tx: 0, ty: 0 },
    k2: { scale: 1.7, tx: 0, ty: 18 },
    k3: { scale: 1.32, tx: 0, ty: -18 }
  },

  // --- TRANSITION (8 variants: Sliding wipes, vignettes, loops) ---
  {
    id: 't-cross-slide',
    name: 'Horizontal Cross Slide',
    category: 'Transition',
    description: 'Linear horizontal cut sweep perfect for video pacing',
    k1: { scale: 1.16, tx: -24, ty: 0 },
    k2: { scale: 1.16, tx: 0, ty: 0 },
    k3: { scale: 1.16, tx: 24, ty: 0 }
  },
  {
    id: 't-vignette-zoom',
    name: 'Vignette Zoom Transition',
    category: 'Transition',
    description: 'Upward slide focus with deep central scaling',
    k1: { scale: 1.1, tx: 0, ty: -18 },
    k2: { scale: 1.22, tx: 0, ty: 0 },
    k3: { scale: 1.45, tx: 0, ty: 18 }
  },
  {
    id: 't-diagonal-cut',
    name: 'Diagonal Cut Slide',
    category: 'Transition',
    description: 'Corner-to-corner linear slide cut across the frame',
    k1: { scale: 1.14, tx: -18, ty: -18 },
    k2: { scale: 1.14, tx: 0, ty: 0 },
    k3: { scale: 1.14, tx: 18, ty: 18 }
  },
  {
    id: 't-soft-drift',
    name: 'Soft Floating Lift',
    category: 'Transition',
    description: 'Slow vertical lift transition with zero horizontal variance',
    k1: { scale: 1.12, tx: 0, ty: -12 },
    k2: { scale: 1.12, tx: 0, ty: 0 },
    k3: { scale: 1.12, tx: 0, ty: 12 }
  },
  {
    id: 't-fade-zoom',
    name: 'Dissolve Exit Sweep',
    category: 'Transition',
    description: 'Zoom out sweeping horizontally to mimic cross fades',
    k1: { scale: 1.45, tx: -12, ty: 0 },
    k2: { scale: 1.22, tx: 0, ty: 0 },
    k3: { scale: 1.0, tx: 12, ty: 0 }
  },
  {
    id: 't-pan-glide',
    name: 'Panoramic Leftward Glide',
    category: 'Transition',
    description: 'Right-to-left sweep slide mimicking panning cuts',
    k1: { scale: 1.16, tx: 24, ty: 0 },
    k2: { scale: 1.16, tx: 0, ty: 0 },
    k3: { scale: 1.16, tx: -24, ty: 0 }
  },
  {
    id: 't-rising-split',
    name: 'Upward Split Slide',
    category: 'Transition',
    description: 'Speedy vertical upward slide for dynamic transitions',
    k1: { scale: 1.22, tx: 0, ty: 24 },
    k2: { scale: 1.16, tx: 0, ty: 0 },
    k3: { scale: 1.22, tx: 0, ty: -24 }
  },
  {
    id: 't-infinity-loop',
    name: 'Infinity Drift Loop',
    category: 'Transition',
    description: 'Figure-8 continuous floating spline camera path',
    k1: { scale: 1.16, tx: -18, ty: -6 },
    k2: { scale: 1.28, tx: 0, ty: 6 },
    k3: { scale: 1.16, tx: 18, ty: -6 }
  }
];

// Sample landscapes from Unsplash
const SAMPLE_LANDSCAPES = [
  { id: 's1', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=85', name: 'Cosmic Temple Stardust.jpg', size: '1.2 MB' },
  { id: 's2', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=85', name: 'Aurora Borealis Boreas.jpg', size: '1.5 MB' }
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

const getCanvasDims = (resolution: string) => {
  if (resolution === '9:16') return { w: 1080, h: 1920 };
  if (resolution === '1:1') return { w: 1080, h: 1080 };
  return { w: 1920, h: 1080 };
};

const pickMimeType = () => {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return 'video/webm';
};

const fmtSize = (bytes: number) => {
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return Math.round(bytes / 1024) + ' KB';
};

export default function App() {
  // App configurations
  const [images, setImages] = useState<ImageItem[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [isDraggingAudio, setIsDraggingAudio] = useState<boolean>(false);
  const [isDraggingImages, setIsDraggingImages] = useState<boolean>(false);
  
  // Custom audio repeat & timer settings
  const [audioRepeatInterval, setAudioRepeatInterval] = useState<number>(3); // seconds
  const [syncAudioWithSlideDuration, setSyncAudioWithSlideDuration] = useState<boolean>(true);
  const [audioStretchToFit, setAudioStretchToFit] = useState<boolean>(false);

  // Custom audio playback controls
  const [volume, setVolume] = useState<number>(0.8);
  const [fadeIn, setFadeIn] = useState<boolean>(true);
  const [fadeOut, setFadeOut] = useState<boolean>(true);
  const [reactivity, setReactivity] = useState<boolean>(true);

  // Global settings
  const [activeCategory, setActiveCategory] = useState<'Cinematic' | 'Zoom' | 'Dynamic' | 'Transition'>('Cinematic');
  const [easing, setEasing] = useState<'hermite' | 'segmented' | 'linear' | 'bounce'>('hermite');
  const [duration, setDuration] = useState<number>(3); // slide duration in seconds
  const [resolution, setResolution] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [fps, setFps] = useState<number>(30);
  const [watermark, setWatermark] = useState<string>('3-KEYFRAME CINEMATIC GLIDE');
  const [showLogoWatermark, setShowLogoWatermark] = useState<boolean>(false);
  const [motionBlur, setMotionBlur] = useState<boolean>(true);

  // Real-time timeline playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [globalTime, setGlobalTime] = useState<number>(0); // Global timeline in seconds

  // Compilation States
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderEta, setRenderEta] = useState<string>('Calculating...');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const globalTimeRef = useRef<number>(0);

  // Sync globalTime with ref to avoid useEffect dependency churn
  useEffect(() => {
    globalTimeRef.current = globalTime;
  }, [globalTime]);

  // Calculated variables
  const totalVideoDuration = images.length * duration;
  const totalAudioDuration = audioTracks.reduce((sum, track) => sum + track.duration, 0);
  const activeSlideIndex = images.length > 0 ? Math.floor(globalTime / duration) % images.length : 0;
  const localTime = images.length > 0 ? (globalTime / duration) % 1 : 0;

  // Initialize Audio Manager
  useEffect(() => {
    if (!audioManagerRef.current) {
      audioManagerRef.current = new AudioManager();
    }
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.stop();
      }
    };
  }, []);

  // Compile real-time background audio buffer whenever tracks, sync mode, stretching or intervals change
  useEffect(() => {
    const updateBuffer = async () => {
      if (!audioManagerRef.current) return;
      const ctx = audioManagerRef.current.getContext();
      const interval = syncAudioWithSlideDuration ? duration : audioRepeatInterval;
      const totalDur = images.length > 0 ? images.length * duration : 15;
      const combinedBuffer = await compileCombinedBuffer(ctx, audioTracks, {
        totalDuration: totalDur,
        repeatInterval: interval,
        stretchToFit: audioStretchToFit
      });
      audioManagerRef.current.setCombinedBuffer(combinedBuffer, globalTimeRef.current);
    };
    updateBuffer();
  }, [audioTracks, duration, audioRepeatInterval, syncAudioWithSlideDuration, audioStretchToFit, images.length]);

  // Sync real-time volume & envelope settings to the Audio Manager
  useEffect(() => {
    if (audioManagerRef.current) {
      audioManagerRef.current.setVolume(volume);
      audioManagerRef.current.setFadeOptions(fadeIn, fadeOut);
    }
  }, [volume, fadeIn, fadeOut]);

  // Decoupled Continuous Animation Timeline Ticker Loop
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;

    let lastTime = performance.now();
    let animationFrameId: number;

    const tick = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setGlobalTime((prev) => {
        let next = prev + delta;
        if (next >= totalVideoDuration) {
          next = next % totalVideoDuration;
          if (audioManagerRef.current) {
            audioManagerRef.current.seek(next);
          }
        }
        return next;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    // Play/resume global continuous audio stream
    if (audioManagerRef.current) {
      audioManagerRef.current.play(globalTime);
    }

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioManagerRef.current) {
        audioManagerRef.current.pause();
      }
    };
  }, [isPlaying, images.length, duration, totalVideoDuration]);

  // Real-time Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dim = getCanvasDims(resolution);
    const activeImage = images[activeSlideIndex];
    if (activeImage) {
      renderFrame(ctx, dim, activeImage, localTime);
    }
  }, [globalTime, resolution, watermark, showLogoWatermark, motionBlur, reactivity, volume, images, activeSlideIndex, localTime]);

  // Image load helper
  const loadImgEl = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.referrerPolicy = 'no-referrer';
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('Failed to load ' + url));
      im.src = url;
    });
  };

  // Add images to timeline
  const addImages = async (list: { id: string; url: string; name: string; size: string }[], autoCyclePresets = true) => {
    const loadedList: ImageItem[] = [];
    let startIdx = images.length;
    
    for (const item of list) {
      try {
        const imgEl = await loadImgEl(item.url);
        const preset = PRESETS[startIdx % PRESETS.length];
        const uniqueId = `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        loadedList.push({
          id: uniqueId,
          url: item.url,
          name: item.name,
          size: item.size,
          presetId: preset.id,
          imgEl
        });
        startIdx++;
      } catch (err) {
        console.error('Failed to pre-load image frame:', err);
      }
    }

    setImages((prev) => {
      const updated = [...prev, ...loadedList];
      return updated;
    });
  };

  // Load Unsplash pack
  const loadSamplePack = () => {
    addImages(SAMPLE_LANDSCAPES);
  };

  // Handle uploaded local image files
  const handleImageFiles = (files: FileList) => {
    const fileItems = Array.from(files).filter(f => f.type.startsWith('image/')).map((f, i) => ({
      id: 'img-' + Date.now() + '-' + i,
      url: URL.createObjectURL(f),
      name: f.name,
      size: fmtSize(f.size)
    }));
    addImages(fileItems);
  };

  // Handle drag and drop files
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFiles(e.dataTransfer.files);
    }
  };

  const processAudioFiles = async (files: FileList) => {
    if (!audioManagerRef.current) return;
    const ctx = audioManagerRef.current.getContext();

    const validFiles = Array.from(files).filter(f => {
      const name = f.name.toLowerCase();
      return name.endsWith('.mp3') || name.endsWith('.wav') || f.type.startsWith('audio/');
    });

    if (validFiles.length === 0) return;

    for (const file of validFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const newTrack: AudioTrack = {
          id: 'audio-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: fmtSize(file.size),
          duration: parseFloat(audioBuffer.duration.toFixed(1)),
          audioBuffer,
          role: audioBuffer.duration > 10 ? 'bg' : 'sfx'
        };

        setAudioTracks((prev) => [...prev, newTrack]);
      } catch (err) {
        console.error('Failed to decode audio file:', file.name, err);
      }
    }
  };

  const handleAudioDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(true);
  };

  const handleAudioDragLeave = () => {
    setIsDraggingAudio(false);
  };

  const handleAudioDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processAudioFiles(e.dataTransfer.files);
    }
  };

  const handlePreviewTrack = (track: AudioTrack) => {
    if (!audioManagerRef.current) return;
    const ctx = audioManagerRef.current.getContext();
    if (!track.audioBuffer) return;

    const src = ctx.createBufferSource();
    src.buffer = track.audioBuffer;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.7, ctx.currentTime);
    src.connect(gainNode);
    gainNode.connect(ctx.destination);
    src.start(0);

    setTimeout(() => {
      try {
        src.stop();
      } catch (e) {}
    }, track.duration * 1000);
  };

  // Reorder slides
  const moveSlide = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Delete slide
  const deleteSlide = (id: string) => {
    setImages((prev) => prev.filter(img => img.id !== id));
    setGlobalTime(0);
    if (audioManagerRef.current) {
      audioManagerRef.current.seek(0);
    }
  };

  // Bind motion preset to the currently active slide
  const selectPresetForActiveSlide = (presetId: string) => {
    if (images.length === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      copy[activeSlideIndex] = {
        ...copy[activeSlideIndex],
        presetId
      };
      return copy;
    });
  };



  // Interpolation math for 3-keyframe sweep
  const interpolate = (a: number, b: number, c: number, t: number, method: string) => {
    t = Math.max(0, Math.min(1, t));
    if (method === 'linear') {
      return t < 0.5 ? lerp(a, b, t * 2) : lerp(b, c, (t - 0.5) * 2);
    }
    if (method === 'segmented') {
      return t < 0.5 ? lerp(a, b, smoothstep(t * 2)) : lerp(b, c, smoothstep((t - 0.5) * 2));
    }
    if (method === 'bounce') {
      const eased = t < 0.5
        ? smoothstep(t * 2) * 1.08 - 0.04 * Math.sin(t * 2 * Math.PI)
        : smoothstep((t - 0.5) * 2);
      return t < 0.5 ? lerp(a, b, Math.max(0, Math.min(1, eased))) : lerp(b, c, eased);
    }
    // Hermite quadratic curve sweep
    const it = 1 - t;
    return it * it * a + 2 * it * t * b + t * t * c;
  };

  // General draw framework
  const renderFrame = (
    ctx: CanvasRenderingContext2D,
    dim: { w: number; h: number },
    image: ImageItem,
    t: number
  ) => {
    ctx.clearRect(0, 0, dim.w, dim.h);
    ctx.fillStyle = '#020617'; // Deep space slate-950
    ctx.fillRect(0, 0, dim.w, dim.h);

    if (!image || !image.imgEl) return;

    const preset = PRESETS.find(p => p.id === image.presetId) || PRESETS[0];

    const computeFrameParams = (tt: number) => {
      let scale = interpolate(preset.k1.scale, preset.k2.scale, preset.k3.scale, tt, easing);
      const tx = interpolate(preset.k1.tx, preset.k2.tx, preset.k3.tx, tt, easing);
      const ty = interpolate(preset.k1.ty, preset.k2.ty, preset.k3.ty, tt, easing);

      if (reactivity) {
        let bump = 0;
        if (preset.category === 'Dynamic') {
          bump = Math.max(0, Math.sin(tt * Math.PI) * 0.15 * Math.exp(-tt * 4));
        } else if (preset.category === 'Transition') {
          bump = Math.max(0, Math.sin(tt * Math.PI) * 0.12);
        } else if (preset.category === 'Zoom') {
          bump = Math.max(0, Math.sin((tt % 0.5) * Math.PI * 8)) * 0.08 * (tt % 0.5 < 0.2 ? 1 : 0);
        } else {
          bump = Math.pow(Math.sin(tt * Math.PI), 2) * 0.08;
        }
        scale += bump * volume;
      }
      return { scale, tx, ty };
    };

    const drawPass = (tt: number, alpha: number) => {
      const f = computeFrameParams(tt);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(dim.w / 2, dim.h / 2);
      ctx.scale(f.scale, f.scale);
      ctx.translate((f.tx * dim.w) / 200, (f.ty * dim.h) / 200);

      const fit = Math.max(dim.w / image.imgEl.naturalWidth, dim.h / image.imgEl.naturalHeight);
      const drawW = image.imgEl.naturalWidth * fit;
      const drawH = image.imgEl.naturalHeight * fit;
      ctx.drawImage(image.imgEl, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    };

    if (motionBlur) {
      drawPass(Math.max(0, t - 0.012), 0.22);
      drawPass(t, 0.6);
      drawPass(Math.min(1, t + 0.012), 0.22);
    } else {
      drawPass(t, 1.0);
    }

    // Subtitles text overlay
    if (watermark) {
      ctx.save();
      ctx.font = `600 ${Math.round(dim.w * 0.016)}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.textBaseline = 'bottom';
      ctx.fillText(watermark, dim.w * 0.025, dim.h * 0.97);
      ctx.restore();
    }

    // Brand logo watermark overlay
    if (showLogoWatermark) {
      ctx.save();
      const w = dim.w * 0.16;
      const h = w * 0.28;
      const x = dim.w - w - dim.w * 0.02;
      const y = dim.h - h - dim.h * 0.03;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#6366f1'; // Premium Indigo Accent
      ctx.font = `700 ${Math.round(h * 0.32)}px sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText('KEYFORGE SPLINE', x + w * 0.08, y + h * 0.42);
      ctx.font = `700 ${Math.round(h * 0.26)}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('STUDIO', x + w * 0.08, y + h * 0.74);
      ctx.restore();
    }

    // Decorative cinematic border
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.lineWidth = Math.max(1, dim.w * 0.001);
    ctx.strokeRect(dim.w * 0.02, dim.h * 0.02, dim.w * 0.96, dim.h * 0.96);
  };

  // ASYNCHRONOUS OFFLINE AUDIO COMPILATION & VIDEO RENDER ENGINE
  const handleExportVideo = async () => {
    if (images.length === 0 || isRendering) return;

    setIsPlaying(false);
    if (audioManagerRef.current) {
      audioManagerRef.current.stop();
    }

    setIsRendering(true);
    setRenderProgress(0);
    setRenderEta('Compiling high-fidelity master track...');
    setDownloadUrl(null);

    try {
      const dim = getCanvasDims(resolution);
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = dim.w;
      exportCanvas.height = dim.h;
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) throw new Error('Failed to create canvas context');

      const totalVideoDuration = images.length * duration;

      // 1. Compile background audio loops
      const realTimeCtx = audioManagerRef.current?.getContext() || new AudioContext();
      const interval = syncAudioWithSlideDuration ? duration : audioRepeatInterval;
      const sourceBuffer = await compileCombinedBuffer(realTimeCtx, audioTracks, {
        totalDuration: totalVideoDuration,
        repeatInterval: interval,
        stretchToFit: audioStretchToFit
      });

      // 2. RENDER THE CONTINUOUS AUDIO TIMELINE INTO A SINGLE, SEAMLESS AUDIO BUFFER
      const compiledAudioBuffer = await renderOfflineCompilation(
        sourceBuffer,
        totalVideoDuration,
        volume,
        fadeIn,
        fadeOut,
        realTimeCtx.sampleRate
      );

      // 3. Setup synchronizer pipeline
      const recordAudioCtx = new AudioContext();
      const recordingDest = recordAudioCtx.createMediaStreamDestination();

      const bufferSource = recordAudioCtx.createBufferSource();
      bufferSource.buffer = compiledAudioBuffer;
      bufferSource.connect(recordingDest);

      const canvasStream = exportCanvas.captureStream(fps);

      // Mux both continuous visual + continuous uncut audio track streams
      const recordedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...recordingDest.stream.getAudioTracks()
      ]);

      const mimeType = pickMimeType();
      const mediaRecorder = new MediaRecorder(recordedStream, {
        mimeType,
        videoBitsPerSecond: 10000000 // Professional-grade 10Mbps bandwidth
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const stopPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }));
        };
      });

      // Synchronize stream kick-off
      mediaRecorder.start();
      bufferSource.start(0);

      const frameDuration = 1 / fps;
      const totalFrames = Math.round(totalVideoDuration * fps);
      const startRenderTime = performance.now();

      await new Promise<void>((resolve) => {
        let frameIndex = 0;
        const tick = () => {
          const now = performance.now();
          const elapsedReal = (now - startRenderTime) / 1000;

          // Determine the target frame index based on actual elapsed real-time
          const targetFrameIndex = Math.floor(elapsedReal * fps);

          // Render any pending frames up to the target frame index
          while (frameIndex <= targetFrameIndex && frameIndex < totalFrames) {
            const currentVideoTime = frameIndex * frameDuration;
            const slideFloat = currentVideoTime / duration;
            const slideIdx = Math.min(images.length - 1, Math.floor(slideFloat));
            const localT = slideFloat - slideIdx;

            renderFrame(exportCtx, dim, images[slideIdx], localT);
            frameIndex++;
          }

          if (frameIndex >= totalFrames) {
            // Buffer slightly for the final frames to be fully committed to MediaRecorder
            setTimeout(() => {
              try {
                mediaRecorder.stop();
                bufferSource.stop();
              } catch (e) {
                console.warn('Error during recording teardown:', e);
              }
              resolve();
            }, 100);
            return;
          }

          const progress = Math.min(100, Math.round((frameIndex / totalFrames) * 100));
          setRenderProgress(progress);

          const remaining = Math.max(0, totalVideoDuration - elapsedReal);
          setRenderEta(`~${remaining.toFixed(1)}s remaining`);

          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });

      const outputBlob = await stopPromise;
      const url = URL.createObjectURL(outputBlob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Compilation crashed:', err);
      setRenderEta('Compilation failed');
    } finally {
      setIsRendering(false);
    }
  };

  // Load sample content on mount to maximize visual delight
  useEffect(() => {
    loadSamplePack();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">🎬</div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">ImageToVid.com</h1>
              <p className="text-[10px] text-slate-500">Convert your images into beautiful videos with music</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[11px] font-bold text-indigo-400 font-mono">
              {easing.toUpperCase()} STYLE
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Structured by Steps */}
      <div className="max-w-7xl mx-auto px-4 w-full py-6 flex flex-col gap-8">
        
        {/* STEP 1: DRAG & DROP PHOTO INGESTION AREA */}
        <section id="step-image-uploader" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-extrabold text-xs">1</span>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Upload Images</h2>
              </div>
            </div>
            {images.length > 0 && (
              <span className="text-[10px] bg-indigo-500/15 text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-500/25">
                {images.length} IMAGES SELECTED
              </span>
            )}
          </div>

          <div 
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingImages(true);
            }}
            onDragLeave={() => setIsDraggingImages(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingImages(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleImageFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
              isDraggingImages 
                ? 'border-indigo-500 bg-indigo-950/30 text-indigo-300 shadow-xl shadow-indigo-950/20' 
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-950/30 text-slate-400'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-transform duration-300 ${
              isDraggingImages ? 'bg-indigo-500/25 border-indigo-500 text-indigo-400 scale-110' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-300">
                {isDraggingImages ? 'Let go to upload images!' : 'Drag & drop image files here, or click to browse files'}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
            className="hidden"
          />
        </section>

        {/* STEP 2: MEDIA STRIP STORYBOARD TIMELINE */}
        <section id="step-media-strip" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-extrabold text-xs">2</span>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Storyboard Timeline</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={loadSamplePack}
                className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 text-xs font-extrabold rounded-lg transition-all"
              >
                ✨ Load Sample pack
              </button>
              {images.length > 0 && (
                <button
                  onClick={() => {
                    setImages([]);
                    setGlobalTime(0);
                  }}
                  className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-950/30 text-xs font-extrabold rounded-lg transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Storyboard Track */}
          <div className="relative">
            {images.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-800 bg-slate-950/10 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-950/20 transition-all flex flex-col items-center justify-center"
              >
                <p className="text-xs font-bold text-slate-400">Timeline is empty.</p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto py-1.5 px-1 scrollbar-thin">
                {images.map((img, idx) => {
                  const isSelected = activeSlideIndex === idx;
                  const activePreset = PRESETS.find(p => p.id === img.presetId);
                  return (
                    <div
                      key={img.id}
                      onClick={() => {
                        setGlobalTime(idx * duration);
                        if (audioManagerRef.current) {
                          audioManagerRef.current.seek(idx * duration);
                        }
                      }}
                      className={`relative flex-shrink-0 w-40 bg-slate-950/60 border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-indigo-500 ring-2 ring-indigo-500/25 bg-slate-900/60 shadow-xl shadow-indigo-950/30' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                      }`}
                    >
                      {/* Thumbnail frame */}
                      <div className="relative aspect-[16/9] bg-slate-900 border-b border-slate-900/80 group overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/90 text-[8.5px] font-mono text-slate-200 border border-slate-800">
                          Slide {idx + 1}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-md">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Info & Micro controls */}
                      <div className="p-2">
                        <div className="text-[10.5px] font-bold text-slate-200 truncate" title={img.name}>
                          {img.name}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[8.5px] px-1.5 py-0.2 bg-slate-900 text-indigo-400 rounded font-bold border border-slate-800">
                            {activePreset ? activePreset.name : 'No Motion'}
                          </span>
                          <span className="text-[8.5px] font-mono text-slate-500">{img.size}</span>
                        </div>

                        {/* Slide Navigation & Reorder controls */}
                        <div className="flex items-center justify-between border-t border-slate-900 mt-2 pt-2">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSlide(idx, 'left');
                              }}
                              disabled={idx === 0}
                              className="w-5 h-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSlide(idx, 'right');
                              }}
                              disabled={idx === images.length - 1}
                              className="w-5 h-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(img.id);
                            }}
                            className="w-5 h-5 bg-slate-900 hover:bg-red-950/60 hover:text-red-400 border border-slate-800 hover:border-red-500/35 rounded flex items-center justify-center text-slate-500 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* STEP 3: ADD MUSIC & SOUND EFFECTS */}
        <section id="step-audio-console" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-extrabold text-xs">3</span>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Add Music & Sound Effects</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Background Tracks Selector & Drop Zone */}
            <div className="lg:col-span-6 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 mb-1 flex items-center gap-1.5 font-sans">
                <Music className="w-3.5 h-3.5" />
                Upload Music or Audio Tracks
              </span>

              <div 
                onDragOver={handleAudioDragOver}
                onDragLeave={handleAudioDragLeave}
                onDrop={handleAudioDrop}
                onClick={() => audioInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                  isDraggingAudio 
                    ? 'border-indigo-500 bg-indigo-950/35 text-indigo-300' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-950/30 text-slate-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 border ${
                  isDraggingAudio ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 scale-105' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">
                    {isDraggingAudio ? 'Drop soundtrack/sound effects!' : 'Drag & drop audio here, or click to browse files'}
                  </p>
                </div>
              </div>
              <input
                ref={audioInputRef}
                type="file"
                multiple
                accept=".mp3,.wav,audio/mpeg,audio/wav,audio/x-wav"
                onChange={(e) => e.target.files && processAudioFiles(e.target.files)}
                className="hidden"
              />

              {/* Uploaded Audio Files Queue */}
              {audioTracks.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex items-center justify-between text-[10px] uppercase font-extrabold tracking-wider text-slate-500 border-b border-slate-850 pb-1.5 mb-1">
                    <span>Uploaded Audio Tracks ({audioTracks.length})</span>
                    <span className="font-mono text-indigo-400">Total Length: {totalAudioDuration.toFixed(1)}s</span>
                  </div>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {audioTracks.map((track, idx) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-850 bg-slate-950/40 hover:border-slate-800 transition-all gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[9.5px] font-mono text-slate-500 shrink-0 w-4 text-center">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-200 truncate" title={track.name}>
                              {track.name}
                            </div>
                            <div className="text-[9.5px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                              <span>{track.duration}s</span>
                              {track.size && <span>• {track.size}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Role toggle button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setAudioTracks((prev) =>
                                prev.map((t) =>
                                  t.id === track.id
                                    ? { ...t, role: (t.role || (t.duration > 10 ? 'bg' : 'sfx')) === 'bg' ? 'sfx' : 'bg' }
                                    : t
                                )
                              );
                            }}
                            className={`px-2 py-1 rounded text-[9px] font-extrabold uppercase border transition-all ${
                              (track.role || (track.duration > 10 ? 'bg' : 'sfx')) === 'bg'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                            }`}
                            title="Click to switch role between Background Music and Slide SFX"
                          >
                            {(track.role || (track.duration > 10 ? 'bg' : 'sfx')) === 'bg' ? '🎵 Music' : '✨ Slide SFX'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePreviewTrack(track);
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-indigo-400 rounded border border-slate-800 hover:border-indigo-500/25 text-xs transition-all"
                            title="Quick Preview"
                          >
                            🔊
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setAudioTracks(prev => prev.filter(t => t.id !== track.id));
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded border border-slate-800 hover:border-red-500/35 text-xs transition-all"
                            title="Delete Track"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AUDIO LOOP SETTINGS PANEL */}
            <div className="lg:col-span-6 flex flex-col gap-4 justify-between">
              
              {/* Core Timer & Repeating Settings */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col gap-3.5">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block border-b border-slate-850 pb-1.5">
                  ⏱ Audio Loop Settings
                </span>

                {/* Sync slide duration toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Sync with Slide Duration</span>
                    <span className="text-[9.5px] text-slate-500">Auto-repeat audio matching slide transition timing ({duration}s)</span>
                  </div>
                  <button
                    onClick={() => setSyncAudioWithSlideDuration(!syncAudioWithSlideDuration)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                      syncAudioWithSlideDuration ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        syncAudioWithSlideDuration ? 'translate-x-5.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Custom Repeat Interval Slider */}
                {!syncAudioWithSlideDuration ? (
                  <div className="flex flex-col gap-1.5 animate-fadeIn">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Custom Audio Loop Timer</span>
                      <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{audioRepeatInterval.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="15"
                      step="0.5"
                      value={audioRepeatInterval}
                      onChange={(e) => setAudioRepeatInterval(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-1.5 mt-1"
                    />
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850/80 mt-1">
                      {[2, 3, 5, 8, 12].map((val) => {
                        const isActive = audioRepeatInterval === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAudioRepeatInterval(val)}
                            className={`flex-1 py-1 rounded text-[10px] font-extrabold text-center transition-all ${
                              isActive
                                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                            }`}
                          >
                            {val}s
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[9.5px] text-slate-500">Audio plays and loops every {audioRepeatInterval.toFixed(1)} seconds</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 opacity-80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium font-bold">Audio Loop Timer (Synced)</span>
                      <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{duration.toFixed(1)}s</span>
                    </div>
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850/80 mt-1">
                      {[2, 3, 5, 8, 12].map((val) => {
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setSyncAudioWithSlideDuration(false);
                              setAudioRepeatInterval(val);
                            }}
                            className="flex-1 py-1 rounded text-[10px] font-extrabold text-center text-slate-500 hover:text-slate-300 hover:bg-slate-900/40 transition-all"
                          >
                            {val}s
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[9.5px] text-slate-500">Currently synced with slide duration. Click a button below to customize separately.</span>
                  </div>
                )}

                {/* Audio stretching and fit mode */}
                <div className="border-t border-slate-850 pt-3">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block mb-2">
                    Audio Loop Mode
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAudioStretchToFit(false)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                        !audioStretchToFit 
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 shadow-sm' 
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div>Normal Loop</div>
                      <div className="text-[8.5px] font-normal text-slate-500 mt-0.5">Play track normally and repeat</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioStretchToFit(true)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                        audioStretchToFit 
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 shadow-sm' 
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div>Adjust Speed</div>
                      <div className="text-[8.5px] font-normal text-slate-500 mt-0.5">Adjust audio speed to fit exact duration</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Volume & Modulation controls */}
              <div className="flex flex-col gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 flex justify-between items-center">
                    <span>Volume Mixer</span>
                    <span className="font-mono text-indigo-400 font-bold">{Math.round(volume * 100)}%</span>
                  </label>
                  <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-850">
                    <Volume2 className="w-4 h-4 text-slate-500" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button
                    onClick={() => setFadeIn(!fadeIn)}
                    className={`py-1.5 px-1 rounded-lg border text-[10.5px] font-bold text-center transition-all ${
                      fadeIn 
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    Fade In
                  </button>
                  <button
                    onClick={() => setFadeOut(!fadeOut)}
                    className={`py-1.5 px-1 rounded-lg border text-[10.5px] font-bold text-center transition-all ${
                      fadeOut 
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    Fade Out
                  </button>
                  <button
                    onClick={() => setReactivity(!reactivity)}
                    className={`py-1.5 px-1 rounded-lg border text-[10.5px] font-bold text-center transition-all ${
                      reactivity 
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    Reactivity
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* STEP 4: MOTION SETUP GRID & MASTER CANVAS CONSOLE */}
        <section id="step-motion-studio" className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* LEFT COLUMN: Preset Studio */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex flex-col gap-1 border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-extrabold text-[10px]">4</span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Choose Motion Effect</h2>
                </div>
              </div>

              {/* Category tabs */}
              <div className="grid grid-cols-2 gap-1 mb-3 p-1 bg-slate-950/60 rounded-xl border border-slate-850">
                {(['Cinematic', 'Zoom', 'Dynamic', 'Transition'] as const).map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold tracking-wider text-center transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/45'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Preset selectors for selected activeCategory */}
              <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {PRESETS.filter(p => p.category === activeCategory).slice(0, 4).map((preset, index) => {
                  const activeImage = images[activeSlideIndex];
                  const isSelected = activeImage?.presetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => selectPresetForActiveSlide(preset.id)}
                      className={`text-left w-full p-2 rounded-lg border transition-all duration-200 group flex items-start gap-2 ${
                        isSelected 
                          ? 'bg-indigo-950/45 border-indigo-500/60 shadow-md shadow-indigo-950/15' 
                          : 'bg-slate-950/30 border-slate-850 hover:border-slate-700 hover:bg-slate-900/30'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[9.5px] shrink-0 font-mono ${
                        isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-500 border border-slate-850'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="font-bold text-[11px] text-slate-200 truncate">{preset.name}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{preset.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] shrink-0 mt-0.5 shadow-sm">
                          <Check className="w-2 h-2" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Real-Time Playback Stage */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-2 shadow-2xl relative">
              
              {/* Canvas Frame Stage */}
              <div className={`relative rounded-xl overflow-hidden bg-[#060a16] shadow-inner ${
                resolution === '9:16' ? 'aspect-[9/16] max-h-[500px] mx-auto' : resolution === '1:1' ? 'aspect-square max-h-[460px] mx-auto' : 'aspect-[16/9]'
              }`}>
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain"
                />

                {images.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-slate-500 bg-slate-950/40 backdrop-blur-sm">
                    <FilmIcon className="w-12 h-12 text-slate-700 mb-2 animate-pulse" />
                    <p className="text-xs font-bold">Timeline is empty</p>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 flex items-center gap-2 shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SLIDE {activeSlideIndex + 1}/{images.length} • {Math.round(localTime * 100)}%
                  </div>
                )}
              </div>



              {/* Transport & Playback controls */}
              <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={images.length === 0}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      isPlaying 
                        ? 'bg-amber-600/20 border-amber-500/30 text-amber-400' 
                        : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    } disabled:opacity-30 disabled:pointer-events-none`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setGlobalTime(0);
                      if (audioManagerRef.current) {
                        audioManagerRef.current.seek(0);
                      }
                    }}
                    disabled={images.length === 0}
                    className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 disabled:opacity-30 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="text-[10.5px] font-mono text-slate-300 bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-xl">
                    {globalTime.toFixed(1)}s / {totalVideoDuration.toFixed(1)}s
                  </div>
                )}
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                  {resolution} @ {fps}FPS
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings Panel & Export Trigger */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 md:p-4 backdrop-blur-sm flex flex-col gap-3">
              <div className="border-b border-slate-800 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">⚙ Video Settings</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">Motion Style</label>
                  <select
                    value={easing}
                    onChange={(e: any) => setEasing(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none hover:border-slate-700 focus:border-indigo-500 transition-all"
                  >
                    <option value="hermite">Smooth Curve</option>
                    <option value="segmented">Gentle Ease</option>
                    <option value="linear">Linear Motion</option>
                    <option value="bounce">Elastic Bounce</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 col-span-2 border-t border-slate-800/60 pt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Slide Duration</label>
                    <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">{duration} Seconds</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[2, 3, 5, 8, 12].map((d) => {
                      const isActive = duration === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDuration(d);
                            setGlobalTime(0);
                            if (audioManagerRef.current) {
                              audioManagerRef.current.seek(0);
                            }
                          }}
                          className={`py-2 rounded-lg border text-xs font-bold text-center transition-all ${
                            isActive
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-[1.03]'
                              : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                          }`}
                        >
                          {d}s
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">Screen Format</label>
                  <select
                    value={resolution}
                    onChange={(e: any) => setResolution(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none hover:border-slate-700 transition-all"
                  >
                    <option value="16:9">Wide (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                    <option value="1:1">Square (1:1)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">Video Quality (FPS)</label>
                  <select
                    value={fps}
                    onChange={(e: any) => setFps(parseInt(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none hover:border-slate-700 transition-all"
                  >
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>

                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">Add Subtitles / Text</label>
                  <input
                    type="text"
                    value={watermark}
                    onChange={(e) => setWatermark(e.target.value)}
                    placeholder="Type subtitles here..."
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none hover:border-slate-700 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <input
                  type="checkbox"
                  id="logo-watermark-toggle"
                  checked={showLogoWatermark}
                  onChange={(e) => setShowLogoWatermark(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800 cursor-pointer"
                />
                <label htmlFor="logo-watermark-toggle" className="text-xs text-slate-300 font-medium cursor-pointer select-none">
                  Show Watermark Logo
                </label>
              </div>
            </div>

            {/* Cinematic Export Section */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 md:p-4 backdrop-blur-sm flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-400" />
                Export Video
              </h3>

              {isRendering ? (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 animate-pulse">Preparing Video...</span>
                    <span className="font-mono font-bold text-indigo-400">{renderProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Status: Exporting</span>
                    <span>{renderEta}</span>
                  </div>
                  <div className="flex items-start gap-2 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 text-[9.5px] text-slate-400 leading-normal">
                    <span className="text-amber-500 font-bold shrink-0">⚠️ Note:</span>
                    <span>Please keep this tab open and active while generating to ensure perfect timing.</span>
                  </div>
                </div>
              ) : downloadUrl ? (
                <div className="flex flex-col gap-3">
                  <a
                    href={downloadUrl}
                    download="slideshow_video.webm"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/15"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD VIDEO
                  </a>
                  <button
                    onClick={handleExportVideo}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    RE-GENERATE
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleExportVideo}
                  disabled={images.length === 0}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-extrabold text-xs tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-indigo-600/15"
                >
                  ✨ CREATE VIDEO
                </button>
              )}
            </div>
          </div>
        </section>


      </div>

      <footer className="py-6 mt-6 border-t border-slate-900 bg-slate-950/50 text-center">
        <p className="text-[10px] font-mono text-slate-600">Keyforge Spline Studio • Made with high-fidelity continuous audio pipelines • No frame limits</p>
      </footer>
    </div>
  );
}

// Simple fallback icon
function FilmIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M17 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h4" />
      <path d="M3 16.5h4" />
      <path d="M17 7.5h4" />
      <path d="M17 12h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}
