export interface Preset {
  id: string;
  name: string;
  category: 'Cinematic' | 'Zoom' | 'Dynamic' | 'Transition';
  description: string;
  k1: { scale: number; tx: number; ty: number };
  k2: { scale: number; tx: number; ty: number };
  k3: { scale: number; tx: number; ty: number };
}

export const PRESETS: Preset[] = [
  // --- CINEMATIC (8 variants) ---
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

  // --- ZOOM (8 variants) ---
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

  // --- DYNAMIC (8 variants) ---
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

  // --- TRANSITION (8 variants) ---
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
