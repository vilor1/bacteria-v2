// BACTERIA EFFECTS LIBRARY - 50+ EFFECTS
// Inspired by Jynxx, Infinity, Rxwalq

const EFFECTS = [
    // TRANSFORMS
    { id: 'shake_s', name: 'Shake Small', type: 'transform', params: { amp: 2 } },
    { id: 'shake_m', name: 'Shake Medium', type: 'transform', params: { amp: 10 } },
    { id: 'shake_h', name: 'Shake Heavy', type: 'transform', params: { amp: 30 } },
    { id: 'zoom_in', name: 'Zoom In', type: 'transform', params: { scale: 1.2 } },
    { id: 'zoom_out', name: 'Zoom Out', type: 'transform', params: { scale: 0.8 } },
    { id: 'wide_angle', name: 'Wide Angle', type: 'transform', params: { scale: 1.4, skew: 0.1 } },
    { id: 'fisheye', name: 'Fisheye', type: 'distortion', params: { strength: 0.2 } },
    { id: 'rotate_cw', name: 'Rotate CW', type: 'transform', params: { angle: 5 } },
    { id: 'rotate_ccw', name: 'Rotate CCW', type: 'transform', params: { angle: -5 } },
    { id: 'skew_x', name: 'Skew X', type: 'transform', params: { skewX: 20 } },
    
    // COLOR GRADING
    { id: 'bright_up', name: 'Brightness +', type: 'filter', params: { brightness: 150 } },
    { id: 'bright_down', name: 'Brightness -', type: 'filter', params: { brightness: 50 } },
    { id: 'contrast_high', name: 'Contrast High', type: 'filter', params: { contrast: 200 } },
    { id: 'contrast_low', name: 'Contrast Low', type: 'filter', params: { contrast: 50 } },
    { id: 'sat_high', name: 'Saturation +', type: 'filter', params: { saturate: 300 } },
    { id: 'sat_low', name: 'Saturation -', type: 'filter', params: { saturate: 0 } },
    { id: 'hue_red', name: 'Hue Red', type: 'filter', params: { hueRotate: 0 } },
    { id: 'hue_blue', name: 'Hue Blue', type: 'filter', params: { hueRotate: 180 } },
    { id: 'invert', name: 'Invert', type: 'filter', params: { invert: 100 } },
    { id: 'grayscale', name: 'Grayscale', type: 'filter', params: { grayscale: 100 } },
    { id: 'sepia', name: 'Sepia', type: 'filter', params: { sepia: 100 } },
    { id: 'thermal', name: 'Thermal', type: 'custom', action: 'thermal' },
    { id: 'matrix', name: 'Matrix', type: 'custom', action: 'matrix' },
    { id: 'cyberpunk', name: 'Cyberpunk', type: 'custom', action: 'cyberpunk' },
    { id: 'night_vision', name: 'Night Vision', type: 'custom', action: 'nightVision' },
    { id: 'deep_fried', name: 'Deep Fried', type: 'custom', action: 'deepFried' },
    
    // OVERLAYS & GLITCH
    { id: 'flash_w', name: 'Flash White', type: 'overlay', params: { color: '#ffffff', opacity: 0.8 } },
    { id: 'flash_r', name: 'Flash Red', type: 'overlay', params: { color: '#ff0000', opacity: 0.6 } },
    { id: 'flash_b', name: 'Flash Blue', type: 'overlay', params: { color: '#0000ff', opacity: 0.6 } },
    { id: 'strobe', name: 'Strobe', type: 'overlay', params: { frequency: 5 } },
    { id: 'vignette', name: 'Vignette', type: 'overlay', params: { strength: 0.8 } },
    { id: 'grain', name: 'Grain', type: 'overlay', params: { amount: 0.2 } },
    { id: 'scanlines', name: 'Scanlines', type: 'overlay', params: { density: 4 } },
    { id: 'rgb_split', name: 'RGB Split', type: 'custom', action: 'rgbSplit' },
    { id: 'glitch_h', name: 'Horizontal Glitch', type: 'custom', action: 'glitchHorizontal' },
    { id: 'pixelate', name: 'Pixelate', type: 'custom', action: 'pixelate' },
    { id: 'noise', name: 'Noise', type: 'custom', action: 'noise' },
    { id: 'vhs', name: 'VHS Tracking', type: 'custom', action: 'vhs' },
    { id: 'datamosh', name: 'Datamosh', type: 'custom', action: 'datamosh' },
    
    // BLUR & SHARP
    { id: 'blur_g', name: 'Gaussian Blur', type: 'filter', params: { blur: 10 } },
    { id: 'blur_m', name: 'Motion Blur', type: 'custom', action: 'motionBlur' },
    { id: 'sharpen', name: 'Sharpen', type: 'custom', action: 'sharpen' },
    { id: 'emboss', name: 'Emboss', type: 'custom', action: 'emboss' },
    
    // STYLIZED
    { id: 'edge', name: 'Edge Detect', type: 'custom', action: 'edgeDetect' },
    { id: 'solarize', name: 'Solarize', type: 'filter', params: { invert: 50 } }, // Approx
    { id: 'posterize', name: 'Posterize', type: 'custom', action: 'posterize' },
    { id: 'xray', name: 'X-Ray', type: 'custom', action: 'xray' },
    { id: 'comic', name: 'Comic Book', type: 'custom', action: 'comic' },
    { id: 'crt', name: 'CRT Curve', type: 'custom', action: 'crt' },
    { id: 'wobble', name: 'Wobble', type: 'transform', params: { wobble: true } },
    { id: 'pulse', name: 'Pulse Zoom', type: 'transform', params: { pulse: true } },
    { id: 'spin', name: 'Spin', type: 'transform', params: { spin: true } },
    { id: 'skew_y', name: 'Skew Y', type: 'transform', params: { skewY: 20 } },
    { id: 'mirror', name: 'Mirror X', type: 'transform', params: { mirrorX: true } },
    { id: 'negative', name: 'Negative', type: 'filter', params: { invert: 100 } }
];

// Helper to apply CSS filters string
function getFilterString(effect) {
    if (effect.type !== 'filter') return '';
    const p = effect.params;
    let str = '';
    if (p.brightness) str += `brightness(${p.brightness}%) `;
    if (p.contrast) str += `contrast(${p.contrast}%) `;
    if (p.saturate) str += `saturate(${p.saturate}%) `;
    if (p.hueRotate !== undefined) str += `hue-rotate(${p.hueRotate}deg) `;
    if (p.invert) str += `invert(${p.invert}%) `;
    if (p.grayscale) str += `grayscale(${p.grayscale}%) `;
    if (p.sepia) str += `sepia(${p.sepia}%) `;
    if (p.blur) str += `blur(${p.blur}px) `;
    return str;
}
