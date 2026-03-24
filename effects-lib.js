/**
 * BACTERIA v2.0 - Effects Library
 * 50+ UNIQUE effects inspired by top TikTok car editors
 * Categories: shake, glitch, color, overlay, distort, stylize, utility
 */

const EFFECTS_LIBRARY = [
  // ========== SHAKE EFFECTS (8) ==========
  {
    id: 'shake_subtle', name: 'Subtle Shake', category: 'shake',
    desc: 'Micro camera shake for realism', icon: '〰️',
    params: { amplitude: { min: 0.5, max: 5, default: 2, unit: 'px' }, frequency: { min: 1, max: 30, default: 12, unit: 'Hz' } },
    preview: 'linear-gradient(135deg, #1a1a2e, #16213e)'
  },
  {
    id: 'shake_impact', name: 'Impact Shake', category: 'shake',
    desc: 'Heavy shake on beat drop', icon: '💥',
    params: { amplitude: { min: 5, max: 50, default: 25, unit: 'px' }, decay: { min: 0.1, max: 2, default: 0.8, unit: 's' } },
    preview: 'linear-gradient(135deg, #ff1a57, #cc0044)'
  },
  {
    id: 'shake_rumble', name: 'Engine Rumble', category: 'shake',
    desc: 'Low-frequency vibration effect', icon: '🔊',
    params: { lowFreq: { min: 1, max: 10, default: 4, unit: 'Hz' }, intensity: { min: 1, max: 20, default: 8, unit: 'px' } },
    preview: 'linear-gradient(135deg, #4a00e0, #8e2de2)'
  },
  {
    id: 'shake_handheld', name: 'Handheld Cam', category: 'shake',
    desc: 'Natural camera movement', icon: '🎥',
    params: { randomness: { min: 0.1, max: 1, default: 0.4 }, drift: { min: 0, max: 10, default: 2, unit: 'px/s' } },
    preview: 'linear-gradient(135deg, #11998e, #38ef7d)'
  },
  {
    id: 'shake_zoom', name: 'Zoom Shake', category: 'shake',
    desc: 'Scale + position shake combo', icon: '🔍',
    params: { scaleAmp: { min: 0.01, max: 0.2, default: 0.05 }, posAmp: { min: 1, max: 30, default: 10, unit: 'px' } },
    preview: 'linear-gradient(135deg, #fc4a1a, #f7b733)'
  },
  {
    id: 'shake_directional', name: 'Directional Shake', category: 'shake',
    desc: 'Shake in specific direction', icon: '↕️',
    params: { direction: { type: 'select', options: ['horizontal', 'vertical', 'diagonal'], default: 'horizontal' }, amplitude: { min: 1, max: 40, default: 15, unit: 'px' } },
    preview: 'linear-gradient(135deg, #00c6ff, #0072ff)'
  },
  {
    id: 'shake_random', name: 'Chaotic Shake', category: 'shake',
    desc: 'Unpredictable movement pattern', icon: '🌀',
    params: { chaos: { min: 0.1, max: 1, default: 0.7 }, maxOffset: { min: 5, max: 60, default: 30, unit: 'px' } },
    preview: 'linear-gradient(135deg, #ff00cc, #333399)'
  },
  {
    id: 'shake_bass', name: 'Bass Shake', category: 'shake',
    desc: 'Audio-reactive low-end shake', icon: '🔈',
    params: { threshold: { min: 0.1, max: 1, default: 0.4 }, multiplier: { min: 0.5, max: 5, default: 2 } },
    preview: 'linear-gradient(135deg, #654ea3, #da98b4)'
  },

  // ========== GLITCH EFFECTS (9) ==========
  {
    id: 'glitch_rgb', name: 'RGB Split', category: 'glitch',
    desc: 'Classic chromatic aberration', icon: '🌈',
    params: { offset: { min: 0, max: 20, default: 5, unit: 'px' }, channels: { type: 'multi', options: ['R','G','B'], default: ['R','B'] } },
    preview: 'repeating-linear-gradient(45deg, #ff000022, #ff000022 2px, #00ff0022 2px, #00ff0022 4px, #0000ff22 4px, #0000ff22 6px)'
  },
  {
    id: 'glitch_scanline', name: 'Scanline Glitch', category: 'glitch',
    desc: 'CRT-style horizontal artifacts', icon: '📺',
    params: { density: { min: 1, max: 20, default: 4, unit: 'px' }, opacity: { min: 0.1, max: 1, default: 0.3 } },
    preview: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)'
  },
  {
    id: 'glitch_block', name: 'Block Shift', category: 'glitch',
    desc: 'Digital block displacement', icon: '🧱',
    params: { blockSize: { min: 10, max: 200, default: 50, unit: 'px' }, shiftMax: { min: 5, max: 100, default: 30, unit: 'px' } },
    preview: 'linear-gradient(135deg, #2b2b2b, #4a4a4a)'
  },
  {
    id: 'glitch_noise', name: 'Static Noise', category: 'glitch',
    desc: 'TV static overlay effect', icon: '📡',
    params: { density: { min: 0.01, max: 0.5, default: 0.1 }, speed: { min: 1, max: 60, default: 24, unit: 'fps' } },
    preview: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)'
  },
  {
    id: 'glitch_chromatic', name: 'Chromatic Wave', category: 'glitch',
    desc: 'Flowing color separation', icon: '🌊',
    params: { waveSpeed: { min: 0.1, max: 5, default: 1, unit: 'px/frame' }, intensity: { min: 1, max: 30, default: 10, unit: 'px' } },
    preview: 'linear-gradient(90deg, transparent, rgba(255,0,0,0.3), transparent, rgba(0,0,255,0.3), transparent)'
  },
  {
    id: 'glitch_datamosh', name: 'Datamosh', category: 'glitch',
    desc: 'Compression artifact simulation', icon: '🗜️',
    params: { blockiness: { min: 4, max: 64, default: 16 }, corruption: { min: 0.01, max: 0.3, default: 0.05 } },
    preview: 'linear-gradient(135deg, #1a1a2e, #4a4a6a, #1a1a2e)'
  },
  {
    id: 'glitch_pixelate', name: 'Pixel Glitch', category: 'glitch',
    desc: 'Sudden pixelation bursts', icon: '🔲',
    params: { pixelSize: { min: 2, max: 50, default: 10, unit: 'px' }, duration: { min: 0.1, max: 2, default: 0.3, unit: 's' } },
    preview: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)'
  },
  {
    id: 'glitch_tearing', name: 'Screen Tear', category: 'glitch',
    desc: 'Horizontal frame tearing', icon: '✂️',
    params: { tearHeight: { min: 5, max: 100, default: 30, unit: 'px' }, offset: { min: -50, max: 50, default: 15, unit: 'px' } },
    preview: 'linear-gradient(180deg, #000 45%, #ff0055 45%, #ff0055 55%, #000 55%)'
  },
  {
    id: 'glitch_strobe', name: 'Strobe Glitch', category: 'glitch',
    desc: 'Flashing glitch bursts', icon: '⚡',
    params: { flashColor: { type: 'color', default: '#ffffff' }, frequency: { min: 1, max: 20, default: 8, unit: 'Hz' } },
    preview: 'radial-gradient(circle, #fff 0%, transparent 70%)'
  },

  // ========== COLOR EFFECTS (10) ==========
  {
    id: 'color_cyberpunk', name: 'Cyberpunk Grade', category: 'color',
    desc: 'Neon pink/blue cinematic look', icon: '🌃',
    params: { pinkBoost: { min: 0, max: 100, default: 40, unit: '%' }, blueBoost: { min: 0, max: 100, default: 60, unit: '%' }, contrast: { min: 80, max: 200, default: 130, unit: '%' } },
    preview: 'linear-gradient(135deg, #ff1a57, #00f0ff)'
  },
  {
    id: 'color_vintage', name: 'Vintage Film', category: 'color',
    desc: 'Warm faded film aesthetic', icon: '🎞️',
    params: { warmth: { min: 0, max: 50, default: 25, unit: '%' }, fade: { min: 0, max: 100, default: 30, unit: '%' }, grain: { min: 0, max: 1, default: 0.2 } },
    preview: 'linear-gradient(135deg, #d4a574, #8b7355)'
  },
  {
    id: 'color_neon', name: 'Neon Boost', category: 'color',
    desc: 'Hyper-saturated neon pop', icon: '💡',
    params: { saturation: { min: 100, max: 500, default: 250, unit: '%' }, glowRadius: { min: 0, max: 50, default: 15, unit: 'px' } },
    preview: 'radial-gradient(circle, #ff00ff88, transparent 70%), radial-gradient(circle, #00ffff88, transparent 70%)'
  },
  {
    id: 'color_grayscale', name: 'B&W Drama', category: 'color',
    desc: 'High-contrast monochrome', icon: '⚫',
    params: { contrast: { min: 100, max: 300, default: 180, unit: '%' }, tint: { type: 'color', default: 'transparent' } },
    preview: 'linear-gradient(135deg, #000, #fff)'
  },
  {
    id: 'color_sepia', name: 'Sepia Tone', category: 'color',
    desc: 'Classic brown vintage tint', icon: '🟤',
    params: { intensity: { min: 0, max: 100, default: 70, unit: '%' }, warmth: { min: 0, max: 50, default: 20, unit: '%' } },
    preview: 'linear-gradient(135deg, #704214, #c19a6b)'
  },
  {
    id: 'color_invert', name: 'Negative', category: 'color',
    desc: 'Full color inversion effect', icon: '🔄',
    params: { blendMode: { type: 'select', options: ['normal', 'difference', 'exclusion'], default: 'normal' }, opacity: { min: 0, max: 1, default: 1 } },
    preview: 'conic-gradient(from 0deg, #fff, #000, #fff)'
  },
  {
    id: 'color_solarize', name: 'Solarize', category: 'color',
    desc: 'Partial inversion threshold', icon: '☀️',
    params: { threshold: { min: 0, max: 255, default: 128 }, blend: { min: 0, max: 1, default: 0.8 } },
    preview: 'linear-gradient(135deg, #ffcc00, #6600cc)'
  },
  {
    id: 'color_posterize', name: 'Posterize', category: 'color',
    desc: 'Reduce color levels artistically', icon: '🎨',
    params: { levels: { min: 2, max: 32, default: 6, unit: 'levels' }, dither: { type: 'boolean', default: true } },
    preview: 'repeating-linear-gradient(45deg, #ff6b6b, #ff6b6b 25%, #4ecdc4 25%, #4ecdc4 50%)'
  },
  {
    id: 'color_channel_mix', name: 'Channel Mixer', category: 'color',
    desc: 'Custom RGB channel control', icon: '🎚️',
    params: { redOut: { min: -200, max: 200, default: 100, unit: '%' }, greenOut: { min: -200, max: 200, default: 100, unit: '%' }, blueOut: { min: -200, max: 200, default: 100, unit: '%' } },
    preview: 'linear-gradient(135deg, #ff000088, #00ff0088, #0000ff88)'
  },
  {
    id: 'color_lut', name: 'Custom LUT', category: 'color',
    desc: 'Load .cube color lookup table', icon: '🧊',
    params: { lutFile: { type: 'file', accept: '.cube' }, intensity: { min: 0, max: 1, default: 1 } },
    preview: 'linear-gradient(135deg, #ff9a9e, #fad0c4, #a1c4fd)'
  },

  // ========== OVERLAY EFFECTS (8) ==========
  {
    id: 'overlay_vignette', name: 'Cinematic Vignette', category: 'overlay',
    desc: 'Darkened edges for focus', icon: '⭕',
    params: { intensity: { min: 0, max: 1, default: 0.6 }, roundness: { min: 0, max: 1, default: 0.8 }, feather: { min: 0.1, max: 1, default: 0.5 } },
    preview: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 120%)'
  },
  {
    id: 'overlay_film_grain', name: 'Film Grain', category: 'overlay',
    desc: 'Analog film texture overlay', icon: '🎥',
    params: { density: { min: 0.01, max: 0.3, default: 0.08 }, size: { min: 0.5, max: 5, default: 1.5, unit: 'px' }, animated: { type: 'boolean', default: true } },
    preview: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)'
  },
  {
    id: 'overlay_light_leak', name: 'Light Leak', category: 'overlay',
    desc: 'Warm lens flare artifacts', icon: '✨',
    params: { color: { type: 'color', default: '#ff6b35' }, intensity: { min: 0, max: 1, default: 0.4 }, position: { type: 'position', default: 'top-right' } },
    preview: 'radial-gradient(ellipse at top right, rgba(255,107,53,0.4), transparent 70%)'
  },
  {
    id: 'overlay_dust', name: 'Film Dust', category: 'overlay',
    desc: 'Vintage scratch & dust particles', icon: '🌫️',
    params: { density: { min: 1, max: 100, default: 20, unit: 'particles' }, size: { min: 1, max: 10, default: 3, unit: 'px' }, speed: { min: 0.1, max: 5, default: 1, unit: 'px/frame' } },
    preview: 'radial-gradient(circle, rgba(200,200,200,0.6) 1px, transparent 2px)'
  },
  {
    id: 'overlay_chromatic_aberration', name: 'Lens CA', category: 'overlay',
    desc: 'Realistic lens color fringing', icon: '🔮',
    params: { amount: { min: 0, max: 10, default: 2, unit: 'px' }, samples: { min: 1, max: 5, default: 3 } },
    preview: 'linear-gradient(90deg, rgba(255,0,0,0.2), transparent 30%, transparent 70%, rgba(0,0,255,0.2))'
  },
  {
    id: 'overlay_bloom', name: 'Bloom Glow', category: 'overlay',
    desc: 'Soft light bloom on highlights', icon: '🌟',
    params: { threshold: { min: 0, max: 1, default: 0.7 }, intensity: { min: 0, max: 2, default: 0.8 }, radius: { min: 1, max: 50, default: 20, unit: 'px' } },
    preview: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent 70%)'
  },
  {
    id: 'overlay_lens_flare', name: 'Lens Flare', category: 'overlay',
    desc: 'Dynamic light source flare', icon: '☀️',
    params: { brightness: { min: 0, max: 2, default: 0.9 }, position: { type: 'position', default: 'center' }, anamorphic: { type: 'boolean', default: false } },
    preview: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 40%)'
  },
  {
    id: 'overlay_halation', name: 'Film Halation', category: 'overlay',
    desc: 'Red fringe around bright areas', icon: '🔴',
    params: { intensity: { min: 0, max: 1, default: 0.5 }, spread: { min: 1, max: 30, default: 10, unit: 'px' }, color: { type: 'color', default: '#ff3333' } },
    preview: 'radial-gradient(circle, rgba(255,51,51,0.3), transparent 60%)'
  },

  // ========== DISTORT EFFECTS (7) ==========
  {
    id: 'distort_fisheye', name: 'Fisheye Lens', category: 'distort',
    desc: 'Extreme wide-angle curvature', icon: '🐟',
    params: { strength: { min: 0, max: 1, default: 0.4 }, zoom: { min: 0.5, max: 2, default: 1.2 } },
    preview: 'radial-gradient(circle, #000 0%, #333 70%, #000 100%)'
  },
  {
    id: 'distort_warp', name: 'Liquid Warp', category: 'distort',
    desc: 'Fluid wave distortion effect', icon: '🌊',
    params: { amplitude: { min: 0, max: 50, default: 15, unit: 'px' }, frequency: { min: 0.1, max: 5, default: 1, unit: 'Hz' }, speed: { min: 0.1, max: 3, default: 1 } },
    preview: 'repeating-linear-gradient(45deg, #00f0ff22, transparent 10px, #ff1a5722 20px)'
  },
  {
    id: 'distort_bulge', name: 'Bulge Pinch', category: 'distort',
    desc: 'Localized convex/concave warp', icon: '🔍',
    params: { radius: { min: 10, max: 300, default: 100, unit: 'px' }, strength: { min: -1, max: 1, default: 0.5 }, position: { type: 'position', default: 'center' } },
    preview: 'radial-gradient(circle, rgba(0,240,255,0.2), transparent 60%)'
  },
  {
    id: 'distort_ripple', name: 'Water Ripple', category: 'distort',
    desc: 'Concentric wave distortion', icon: '💧',
    params: { rings: { min: 1, max: 20, default: 5 }, amplitude: { min: 1, max: 30, default: 10, unit: 'px' }, speed: { min: 0.1, max: 5, default: 2 } },
    preview: 'repeating-radial-gradient(circle at center, transparent 0, transparent 10px, rgba(0,240,255,0.1) 10px, rgba(0,240,255,0.1) 11px)'
  },
  {
    id: 'distort_swirl', name: 'Vortex Swirl', category: 'distort',
    desc: 'Spiral rotation distortion', icon: '🌀',
    params: { angle: { min: -720, max: 720, default: 180, unit: 'deg' }, radius: { min: 10, max: 300, default: 150, unit: 'px' } },
    preview: 'conic-gradient(from 0deg, transparent, rgba(183,42,255,0.2), transparent)'
  },
  {
    id: 'distort_wave', name: 'Sine Wave', category: 'distort',
    desc: 'Horizontal sine wave displacement', icon: '〰️',
    params: { amplitude: { min: 0, max: 50, default: 20, unit: 'px' }, wavelength: { min: 10, max: 300, default: 100, unit: 'px' }, speed: { min: 0, max: 10, default: 2 } },
    preview: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,26,87,0.1) 50px, rgba(255,26,87,0.1) 100px)'
  },
  {
    id: 'distort_polar', name: 'Polar Coordinates', category: 'distort',
    desc: 'Cartesian to polar transform', icon: '🎯',
    params: { mode: { type: 'select', options: ['rect-to-polar', 'polar-to-rect'], default: 'rect-to-polar' }, offset: { min: 0, max: 360, default: 0, unit: 'deg' } },
    preview: 'conic-gradient(from 0deg, #ff1a57, #00f0ff, #ffea00, #ff1a57)'
  },

  // ========== STYLIZE EFFECTS (5) ==========
  {
    id: 'stylize_edge', name: 'Edge Detect', category: 'stylize',
    desc: 'Sobel edge detection outline', icon: '✏️',
    params: { threshold: { min: 0, max: 255, default: 100 }, color: { type: 'color', default: '#00f0ff' }, invert: { type: 'boolean', default: false } },
    preview: 'linear-gradient(135deg, transparent 49%, #00f0ff 50%, transparent 51%)'
  },
  {
    id: 'stylize_emboss', name: 'Emboss Relief', category: 'stylize',
    desc: '3D embossed texture effect', icon: '🔺',
    params: { angle: { min: 0, max: 360, default: 135, unit: 'deg' }, depth: { min: 1, max: 10, default: 3 }, contrast: { min: 50, max: 300, default: 150, unit: '%' } },
    preview: 'linear-gradient(135deg, #333, #fff, #333)'
  },
  {
    id: 'stylize_oil', name: 'Oil Paint', category: 'stylize',
    desc: 'Artistic oil painting filter', icon: '🖌️',
    params: { brushSize: { min: 1, max: 20, default: 5, unit: 'px' }, detail: { min: 1, max: 10, default: 4 } },
    preview: 'radial-gradient(circle, #8b4513, #d2691e, #8b4513)'
  },
  {
    id: 'stylize_sketch', name: 'Pencil Sketch', category: 'stylize',
    desc: 'Hand-drawn sketch conversion', icon: '✏️',
    params: { detail: { min: 1, max: 10, default: 6 }, darkness: { min: 0, max: 1, default: 0.7 } },
    preview: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 10px)'
  },
  {
    id: 'stylize_cartoon', name: 'Cartoonize', category: 'stylize',
    desc: 'Cel-shaded cartoon effect', icon: '🎬',
    params: { levels: { min: 2, max: 16, default: 6 }, edgeStrength: { min: 0, max: 1, default: 0.6 } },
    preview: 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #ffe66d)'
  },

  // ========== UTILITY EFFECTS (3) ==========
  {
    id: 'util_zoom', name: 'Dynamic Zoom', category: 'utility',
    desc: 'Keyframable scale animation', icon: '🔎',
    params: { startScale: { min: 0.1, max: 3, default: 1 }, endScale: { min: 0.1, max: 3, default: 1.5 }, easing: { type: 'select', options: ['linear','easeIn','easeOut','easeInOut'], default: 'easeInOut' } },
    preview: 'linear-gradient(135deg, #00f0ff44, transparent 70%)'
  },
  {
    id: 'util_rotation', name: 'Rotation Spin', category: 'utility',
    desc: 'Continuous or keyframed rotation', icon: '🔄',
    params: { angle: { min: -1440, max: 1440, default: 360, unit: 'deg' }, speed: { min: 0.1, max: 10, default: 1, unit: 'rev/s' }, direction: { type: 'select', options: ['cw','ccw'], default: 'cw' } },
    preview: 'conic-gradient(from 0deg, transparent, #ff1a5788, transparent)'
  },
  {
    id: 'util_opacity', name: 'Fade Control', category: 'utility',
    desc: 'Opacity animation over time', icon: '👁️',
    params: { startOpacity: { min: 0, max: 1, default: 1 }, endOpacity: { min: 0, max: 1, default: 0 }, duration: { min: 0.1, max: 10, default: 1, unit: 's' } },
    preview: 'linear-gradient(180deg, rgba(255,255,255,0.8), transparent)'
  }
];

// Helper: Get effect by ID
function getEffect(id) {
  return EFFECTS_LIBRARY.find(e => e.id === id);
}

// Helper: Filter effects by category
function getEffectsByCategory(category) {
  if (category === 'all') return EFFECTS_LIBRARY;
  return EFFECTS_LIBRARY.filter(e => e.category === category);
}

// Helper: Search effects
function searchEffects(query) {
  const q = query.toLowerCase();
  return EFFECTS_LIBRARY.filter(e => 
    e.name.toLowerCase().includes(q) || 
    e.desc.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q)
  );
}

// Export for engine
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EFFECTS_LIBRARY, getEffect, getEffectsByCategory, searchEffects };
}
