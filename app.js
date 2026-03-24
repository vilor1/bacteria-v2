/**
 * BACTERIA v2.0 - Frontend Application
 * Complete editor engine with auth, video, effects, timeline
 * Fully compatible with server.js API
 */

// ========== GLOBAL STATE ==========
const App = {
  user: null,
  token: null,
  video: null,
  canvas: null,
  ctx: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  fps: 60,
  effects: new Map(),
  tracks: { video: [], effects: [] },
  project: { name: 'Untitled', version: '2.0' },
  settings: {
    zoom: 3,
    theme: 'dark',
    resolution: { width: 1280, height: 720 }
  }
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Get canvas
  App.canvas = document.getElementById('main-canvas');
  App.ctx = App.canvas.getContext('2d', { alpha: false, desynchronized: true });
  
  // Setup canvas resolution
  setupCanvas();
  
  // Load saved session
  loadSession();
  
  // Bind all UI events
  bindEvents();
  
  // Populate effects grid
  renderEffectsGrid(EFFECTS_LIBRARY);
  
  // Render timeline ruler
  renderTimelineRuler();
  
  // Check auth status
  if (App.token) {
    validateSession();
  }
  
  console.log('🦠 BACTERIA v2.0 initialized');
}

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const viewport = document.getElementById('preview-viewport');
  
  if (!viewport) return;
  
  const rect = viewport.getBoundingClientRect();
  App.canvas.width = rect.width * dpr;
  App.canvas.height = rect.height * dpr;
  App.canvas.style.width = `${rect.width}px`;
  App.canvas.style.height = `${rect.height}px`;
  App.ctx.scale(dpr, dpr);
  App.ctx.imageSmoothingEnabled = true;
  App.ctx.imageSmoothingQuality = 'high';
  
  // Draw placeholder
  drawPlaceholder();
}

function drawPlaceholder() {
  const ctx = App.ctx;
  const w = App.canvas.width / (window.devicePixelRatio || 1);
  const h = App.canvas.height / (window.devicePixelRatio || 1);
  
  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, w, h);
  
  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  const gridSize = 50;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  
  // Logo text
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = 'bold 48px Space Grotesk';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BACTERIA', w / 2, h / 2 - 30);
  
  ctx.font = '16px Space Grotesk';
  ctx.fillText('Import a video to start editing', w / 2, h / 2 + 20);
}

// ========== SESSION MANAGEMENT ==========
function loadSession() {
  const savedToken = localStorage.getItem('bacteria_token');
  const savedUser = localStorage.getItem('bacteria_user');
  const savedTheme = localStorage.getItem('bacteria_theme');
  
  if (savedToken && savedUser) {
    App.token = savedToken;
    App.user = JSON.parse(savedUser);
  }
  
  if (savedTheme) {
    App.settings.theme = savedTheme;
    if (savedTheme === 'light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    }
  }
}

function saveSession() {
  if (App.token && App.user) {
    localStorage.setItem('bacteria_token', App.token);
    localStorage.setItem('bacteria_user', JSON.stringify(App.user));
  }
}

function clearSession() {
  localStorage.removeItem('bacteria_token');
  localStorage.removeItem('bacteria_user');
  App.token = null;
  App.user = null;
}

async function validateSession() {
  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      throw new Error('Session invalid');
    }
    
    const data = await res.json();
    if (data.success) {
      showEditor();
      updateUserBadge(data.user.username);
    } else {
      clearSession();
      showAuth();
    }
  } catch (error) {
    console.error('Session validation failed:', error);
    clearSession();
    showAuth();
  }
}

// ========== AUTHENTICATION ==========
function bindAuthEvents() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      const tabName = e.target.dataset.tab;
      document.getElementById('login-form').classList.toggle('hidden', tabName !== 'login');
      document.getElementById('signup-form').classList.toggle('hidden', tabName !== 'signup');
    });
  });
  
  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin();
  });
  
  // Signup form
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSignup();
  });
  
  // Logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

async function handleLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  
  if (!username || !password) {
    showToast('Please enter username and password', 'error');
    return;
  }
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    App.token = data.token;
    App.user = data.user;
    saveSession();
    
    showToast(`Welcome back, ${username}!`, 'success');
    showEditor();
    updateUserBadge(username);
    
  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message || 'Login failed', 'error');
  }
}

async function handleSignup() {
  const username = document.getElementById('signup-user').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-pass').value;
  
  if (!username || !email || !password) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    
    App.token = data.token;
    App.user = data.user;
    saveSession();
    
    showToast('Account created successfully!', 'success');
    showEditor();
    updateUserBadge(username);
    
  } catch (error) {
    console.error('Signup error:', error);
    showToast(error.message || 'Signup failed', 'error');
  }
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  clearSession();
  showAuth();
  showToast('Logged out successfully', 'info');
}

function showAuth() {
  document.getElementById('auth-layer').classList.remove('hidden');
  document.getElementById('editor-app').classList.add('hidden');
}

function showEditor() {
  document.getElementById('auth-layer').classList.add('hidden');
  document.getElementById('editor-app').classList.remove('hidden');
  
  // Resize canvas after showing editor
  setTimeout(() => setupCanvas(), 100);
}

function updateUserBadge(username) {
  document.getElementById('user-display').textContent = username.toUpperCase().slice(0, 12);
}

// ========== API HELPERS ==========
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(App.token && { 'Authorization': `Bearer ${App.token}` })
  };
}

async function apiRequest(endpoint, options = {}) {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
}

// ========== VIDEO MANAGEMENT ==========
function bindVideoEvents() {
  // Import video
  document.getElementById('import-media').addEventListener('click', () => {
    document.getElementById('video-input').click();
  });
  
  document.getElementById('video-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadVideo(file);
    e.target.value = ''; // Reset for re-import
  });
  
  // Playback controls
  document.getElementById('play-btn').addEventListener('click', togglePlay);
  document.getElementById('stop-btn').addEventListener('click', stopVideo);
  document.getElementById('seek-bar').addEventListener('input', seekVideo);
  
  // Preview quality
  document.getElementById('preview-1080').addEventListener('click', () => setPreviewQuality(1080));
  document.getElementById('preview-720').addEventListener('click', () => setPreviewQuality(720));
  document.getElementById('preview-480').addEventListener('click', () => setPreviewQuality(480));
}

async function loadVideo(file) {
  if (!file) return;
  
  try {
    const url = URL.createObjectURL(file);
    App.video = document.createElement('video');
    App.video.src = url;
    App.video.crossOrigin = 'anonymous';
    App.video.muted = true;
    App.video.playsInline = true;
    
    await new Promise((resolve, reject) => {
      App.video.onloadedmetadata = () => {
        App.duration = App.video.duration;
        document.getElementById('seek-end').textContent = formatTime(App.duration);
        document.getElementById('res-badge').textContent = `${App.video.videoWidth}×${App.video.videoHeight}`;
        resolve();
      };
      App.video.onerror = reject;
      App.video.load();
    });
    
    // Update timeline
    document.getElementById('video-placeholder').style.display = 'none';
    const trackContent = document.getElementById('video-track-content');
    
    // Remove existing clip if any
    const existingClip = trackContent.querySelector('.media-clip');
    if (existingClip) existingClip.remove();
    
    const clip = document.createElement('div');
    clip.className = 'media-clip';
    clip.id = 'main-video-clip';
    clip.innerHTML = `
      <span class="clip-name">${file.name}</span>
      <span class="clip-duration">${formatTime(App.duration)}</span>
    `;
    trackContent.appendChild(clip);
    
    // Update ruler
    renderTimelineRuler();
    
    // Draw first frame
    renderFrame();
    
    showToast(`Loaded: ${file.name}`, 'success');
    
  } catch (error) {
    console.error('Video load error:', error);
    showToast('Failed to load video', 'error');
  }
}

function togglePlay() {
  if (!App.video) {
    showToast('Import a video first', 'info');
    return;
  }
  
  App.isPlaying = !App.isPlaying;
  document.getElementById('play-btn').textContent = App.isPlaying ? '⏸ PAUSE' : '▶ PLAY';
  
  if (App.isPlaying) {
    App.video.play().catch(err => {
      console.warn('Playback error:', err);
      App.isPlaying = false;
      document.getElementById('play-btn').textContent = '▶ PLAY';
    });
    requestAnimationFrame(renderLoop);
  } else {
    App.video.pause();
  }
}

function stopVideo() {
  if (!App.video) return;
  
  App.isPlaying = false;
  App.video.pause();
  App.video.currentTime = 0;
  App.currentTime = 0;
  
  document.getElementById('play-btn').textContent = '▶ PLAY';
  document.getElementById('seek-bar').value = 0;
  document.getElementById('timecode').textContent = '00:00:00:00';
  
  renderFrame();
}

function seekVideo(e) {
  if (!App.video || !App.duration) return;
  
  const percent = parseFloat(e.target.value);
  App.currentTime = (percent / 100) * App.duration;
  App.video.currentTime = App.currentTime;
  
  document.getElementById('timecode').textContent = formatTime(App.currentTime, true);
  renderFrame();
}

function setPreviewQuality(quality) {
  document.querySelectorAll('.preview-controls .btn-sm').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`preview-${quality}`).classList.add('active');
  
  // Update resolution badge
  const resolutions = {
    1080: '1920×1080',
    720: '1280×720',
    480: '854×480'
  };
  document.getElementById('res-badge').textContent = resolutions[quality];
  
  showToast(`${quality}p preview`, 'info');
}

function renderLoop() {
  if (!App.isPlaying || !App.video) return;
  
  App.currentTime = App.video.currentTime;
  const percent = (App.currentTime / App.duration) * 100;
  
  document.getElementById('seek-bar').value = percent;
  document.getElementById('timecode').textContent = formatTime(App.currentTime, true);
  
  renderFrame();
  
  requestAnimationFrame(renderLoop);
}

// ========== RENDERING ENGINE ==========
function renderFrame() {
  if (!App.video || App.video.readyState < 2) return;
  
  const ctx = App.ctx;
  const dpr = window.devicePixelRatio || 1;
  const w = App.canvas.width / dpr;
  const h = App.canvas.height / dpr;
  
  // Clear canvas
  ctx.clearRect(0, 0, w, h);
  
  // Save context state
  ctx.save();
  
  // Draw video frame
  ctx.drawImage(App.video, 0, 0, w, h);
  
  // Apply active effects
  App.effects.forEach((effectData, effectId) => {
    const { effect, params, start, end } = effectData;
    
    if (App.currentTime >= start && App.currentTime <= end) {
      applyEffect(ctx, effect, params, w, h, App.currentTime - start);
    }
  });
  
  // Restore context
  ctx.restore();
  
  // Update HUD
  document.getElementById('active-effects').textContent = App.effects.size;
}

function applyEffect(ctx, effect, params, w, h, elapsed) {
  // Apply effects based on category
  switch (effect.category) {
    case 'shake':
      applyShakeEffect(ctx, effect, params, elapsed);
      break;
    case 'color':
      applyColorEffect(ctx, effect, params);
      break;
    case 'overlay':
      applyOverlayEffect(ctx, effect, params, w, h);
      break;
    case 'glitch':
      applyGlitchEffect(ctx, effect, params, w, h, elapsed);
      break;
    case 'distort':
      applyDistortEffect(ctx, effect, params, w, h, elapsed);
      break;
  }
}

function applyShakeEffect(ctx, effect, params, elapsed) {
  const amp = params.amplitude?.default || 10;
  const freq = params.frequency?.default || 12;
  
  const x = (Math.random() - 0.5) * amp * 2;
  const y = (Math.random() - 0.5) * amp * 2;
  
  ctx.translate(x, y);
}

function applyColorEffect(ctx, effect, params) {
  let filter = '';
  
  if (params.saturation) {
    filter += `saturate(${params.saturation.default}%) `;
  }
  if (params.contrast) {
    filter += `contrast(${params.contrast.default}%) `;
  }
  if (params.brightness) {
    filter += `brightness(${params.brightness.default}%) `;
  }
  if (params.hueRotate) {
    filter += `hue-rotate(${params.hueRotate.default}deg) `;
  }
  if (params.invert) {
    filter += `invert(${params.invert.default}%) `;
  }
  if (params.grayscale) {
    filter += `grayscale(${params.grayscale.default}%) `;
  }
  if (params.sepia) {
    filter += `sepia(${params.sepia.default}%) `;
  }
  if (params.blur) {
    filter += `blur(${params.blur.default}px) `;
  }
  
  if (filter) {
    ctx.filter = filter.trim();
  }
}

function applyOverlayEffect(ctx, effect, params, w, h) {
  if (effect.id === 'overlay_vignette') {
    const intensity = params.intensity?.default || 0.6;
    const gradient = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.min(w, h) * 0.8);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }
  
  if (effect.id === 'glitch_strobe' || effect.id === 'overlay_flash') {
    const freq = params.frequency?.default || 8;
    if (Math.floor(elapsed * freq) % 2 === 0) {
      const color = params.flashColor?.default || '#ffffff';
      const opacity = params.opacity?.default || 0.3;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }
}

function applyGlitchEffect(ctx, effect, params, w, h, elapsed) {
  if (effect.id === 'glitch_rgb') {
    const offset = params.offset?.default || 5;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    
    // Simple RGB shift simulation
    for (let i = 0; i < data.length; i += 4) {
      if (i % 3 === 0) {
        data[i] = data[Math.min(i + offset * 4, data.length - 4)];
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
}

function applyDistortEffect(ctx, effect, params, w, h, elapsed) {
  // Placeholder for distortion effects
  // Full implementation would require WebGL shaders
}

// ========== EFFECTS MANAGEMENT ==========
function bindEffectsEvents() {
  // Search
  document.getElementById('effect-search').addEventListener('input', (e) => {
    filterEffects(e.target.value);
  });
  
  // Category filter
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterByCategory(e.target.dataset.cat);
    });
  });
  
  // Refresh
  document.getElementById('refresh-effects').addEventListener('click', () => {
    renderEffectsGrid(EFFECTS_LIBRARY);
    showToast('Effects refreshed', 'info');
  });
  
  // Properties panel
  document.getElementById('close-properties').addEventListener('click', () => {
    document.getElementById('properties-panel').classList.add('hidden');
  });
  
  document.getElementById('apply-params').addEventListener('click', applyEffectParams);
  document.getElementById('reset-params').addEventListener('click', resetEffectParams);
}

function renderEffectsGrid(effects) {
  const grid = document.getElementById('effects-grid');
  grid.innerHTML = '';
  
  effects.forEach(effect => {
    const card = document.createElement('div');
    card.className = 'effect-card';
    card.dataset.id = effect.id;
    card.innerHTML = `
      <div class="effect-preview" style="background: ${effect.preview}"></div>
      <div class="effect-name">${effect.icon || '✨'} ${effect.name}</div>
      <div class="effect-tags">
        <span class="effect-tag">${effect.category}</span>
      </div>
    `;
    card.addEventListener('click', () => addEffect(effect));
    grid.appendChild(card);
  });
}

function filterEffects(query) {
  const q = query.toLowerCase().trim();
  
  if (!q) {
    renderEffectsGrid(EFFECTS_LIBRARY);
    return;
  }
  
  const filtered = EFFECTS_LIBRARY.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.desc.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q)
  );
  
  renderEffectsGrid(filtered);
}

function filterByCategory(category) {
  if (category === 'all') {
    renderEffectsGrid(EFFECTS_LIBRARY);
  } else {
    const filtered = EFFECTS_LIBRARY.filter(e => e.category === category);
    renderEffectsGrid(filtered);
  }
}

function addEffect(effect) {
  if (!App.video) {
    showToast('Import a video first', 'info');
    return;
  }
  
  const effectId = `${effect.id}_${Date.now()}`;
  const params = JSON.parse(JSON.stringify(effect.params)); // Deep copy
  
  const effectData = {
    effect,
    params,
    keyframes: [],
    start: App.currentTime,
    end: Math.min(App.currentTime + 3, App.duration || 3)
  };
  
  App.effects.set(effectId, effectData);
  
  // Add to timeline
  addEffectToTimeline(effectId, effect.name, effectData.start, effectData.end);
  
  // Show properties
  showEffectProperties(effect, params, effectId);
  
  // Update HUD
  document.getElementById('active-effects').textContent = App.effects.size;
  
  showToast(`Added: ${effect.name}`, 'success');
}

function addEffectToTimeline(effectId, name, start, end) {
  const trackContent = document.getElementById('effects-track-content');
  
  const clip = document.createElement('div');
  clip.className = 'effect-clip';
  clip.dataset.id = effectId;
  clip.style.left = `${(start / App.duration) * 100}%`;
  clip.style.width = `${((end - start) / App.duration) * 100}%`;
  clip.innerHTML = `<span class="clip-name">${name}</span>`;
  
  clip.addEventListener('click', () => {
    const effectData = App.effects.get(effectId);
    if (effectData) {
      showEffectProperties(effectData.effect, effectData.params, effectId);
      seekToTime(start);
    }
  });
  
  // Double click to delete
  clip.addEventListener('dblclick', () => {
    if (confirm(`Remove ${name}?`)) {
      App.effects.delete(effectId);
      clip.remove();
      document.getElementById('active-effects').textContent = App.effects.size;
      showToast('Effect removed', 'info');
    }
  });
  
  trackContent.appendChild(clip);
}

function showEffectProperties(effect, params, effectId) {
  const panel = document.getElementById('properties-panel');
  document.getElementById('prop-effect-name').textContent = effect.name;
  document.getElementById('prop-effect-desc').textContent = effect.desc || 'No description';
  
  const container = document.getElementById('params-container');
  container.innerHTML = '';
  container.dataset.effectId = effectId;
  
  // Store current effect ID for apply
  App.currentEffectId = effectId;
  
  Object.entries(params).forEach(([key, config]) => {
    const group = document.createElement('div');
    group.className = 'param-group';
    
    if (config.type === 'select') {
      group.innerHTML = `
        <div class="param-label">
          <span>${key}</span>
          <span class="param-value" id="val-${key}">${config.default}</span>
        </div>
        <select class="param-input" data-param="${key}">
          ${config.options.map(opt => `<option value="${opt}" ${opt === config.default ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      `;
    } else if (config.type === 'color') {
      group.innerHTML = `
        <div class="param-label">
          <span>${key}</span>
        </div>
        <input type="color" class="param-input" data-param="${key}" value="${config.default}"/>
      `;
    } else if (config.type === 'boolean') {
      group.innerHTML = `
        <div class="param-label">
          <span>${key}</span>
          <label class="toggle-switch">
            <input type="checkbox" data-param="${key}" ${config.default ? 'checked' : ''}/>
            <span class="slider"></span>
          </label>
        </div>
      `;
    } else {
      // Numeric slider
      const step = (config.max - config.min) / 100;
      group.innerHTML = `
        <div class="param-label">
          <span>${key}${config.unit ? ` (${config.unit})` : ''}</span>
          <span class="param-value" id="val-${key}">${config.default}</span>
        </div>
        <input type="range" class="param-slider" data-param="${key}" 
               min="${config.min}" max="${config.max}" step="${step}" 
               value="${config.default}"/>
      `;
    }
    
    container.appendChild(group);
  });
  
  // Bind param changes
  container.querySelectorAll('.param-slider, .param-input, select').forEach(input => {
    input.addEventListener('input', (e) => {
      const key = e.target.dataset.param;
      const value = e.target.type === 'range' || e.target.type === 'number' 
        ? parseFloat(e.target.value) 
        : e.target.value;
      
      const valueEl = document.getElementById(`val-${key}`);
      if (valueEl) {
        valueEl.textContent = typeof value === 'number' ? value.toFixed(2) : value;
      }
    });
  });
  
  panel.classList.remove('hidden');
}

function applyEffectParams() {
  const effectId = App.currentEffectId;
  if (!effectId) return;
  
  const effectData = App.effects.get(effectId);
  if (!effectData) return;
  
  const container = document.getElementById('params-container');
  const inputs = container.querySelectorAll('.param-slider, .param-input, select');
  
  inputs.forEach(input => {
    const key = input.dataset.param;
    const value = input.type === 'checkbox' ? input.checked 
      : (input.type === 'range' || input.type === 'number' ? parseFloat(input.value) : input.value);
    
    if (effectData.params[key]) {
      effectData.params[key].default = value;
    }
  });
  
  App.effects.set(effectId, effectData);
  renderFrame();
  
  showToast('Effect updated', 'success');
}

function resetEffectParams() {
  const effectId = App.currentEffectId;
  if (!effectId) return;
  
  const effectData = App.effects.get(effectId);
  if (!effectData) return;
  
  // Reset to original defaults from EFFECTS_LIBRARY
  const originalEffect = EFFECTS_LIBRARY.find(e => e.id === effectData.effect.id);
  if (originalEffect) {
    effectData.params = JSON.parse(JSON.stringify(originalEffect.params));
    App.effects.set(effectId, effectData);
    showEffectProperties(effectData.effect, effectData.params, effectId);
    renderFrame();
    showToast('Parameters reset', 'info');
  }
}

function seekToTime(time) {
  if (!App.video) return;
  App.currentTime = time;
  App.video.currentTime = time;
  const percent = (time / App.duration) * 100;
  document.getElementById('seek-bar').value = percent;
  document.getElementById('timecode').textContent = formatTime(time, true);
  renderFrame();
}

// ========== TIMELINE ==========
function bindTimelineEvents() {
  // Zoom
  document.getElementById('timeline-zoom').addEventListener('input', (e) => {
    App.settings.zoom = parseFloat(e.target.value);
    document.getElementById('zoom-display').textContent = `${App.settings.zoom}x`;
    renderTimelineRuler();
  });
  
  document.getElementById('zoom-in').addEventListener('click', () => {
    const slider = document.getElementById('timeline-zoom');
    slider.value = Math.min(parseFloat(slider.value) + 1, 10);
    slider.dispatchEvent(new Event('input'));
  });
  
  document.getElementById('zoom-out').addEventListener('click', () => {
    const slider = document.getElementById('timeline-zoom');
    slider.value = Math.max(parseFloat(slider.value) - 1, 1);
    slider.dispatchEvent(new Event('input'));
  });
  
  // Project export/import
  document.getElementById('export-project').addEventListener('click', exportProject);
  document.getElementById('import-project').addEventListener('click', () => {
    document.getElementById('project-input').click();
  });
  document.getElementById('project-input').addEventListener('change', importProject);
}

function renderTimelineRuler() {
  const ruler = document.getElementById('timeline-ruler');
  ruler.innerHTML = '';
  
  if (!App.duration) {
    ruler.innerHTML = '<div class="ruler-mark">00:00</div>';
    return;
  }
  
  const zoom = App.settings.zoom;
  const interval = Math.max(1, Math.floor(5 / zoom));
  const marks = Math.ceil(App.duration / interval) * interval;
  
  for (let i = 0; i <= marks && i <= App.duration; i += interval) {
    const mark = document.createElement('div');
    mark.className = 'ruler-mark';
    mark.style.minWidth = `${60 * zoom}px`;
    mark.textContent = formatTime(i);
    ruler.appendChild(mark);
  }
}

// ========== PROJECT MANAGEMENT ==========
async function exportProject() {
  if (!App.video) {
    showToast('No video loaded', 'error');
    return;
  }
  
  const projectName = document.getElementById('project-name').value.trim() || 'Untitled';
  
  const project = {
    name: projectName,
    version: '2.0',
    createdAt: new Date().toISOString(),
    video: {
      name: App.video.src.split('/').pop() || 'video.mp4',
      duration: App.duration
    },
    effects: Array.from(App.effects.entries()).map(([id, data]) => ({
      id,
      effectId: data.effect.id,
      effectName: data.effect.name,
      params: data.params,
      start: data.start,
      end: data.end
    })),
    settings: App.settings
  };
  
  // Create .bacteria file
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}.bacteria`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Project exported!', 'success');
  
  // Also save to server if logged in
  if (App.token) {
    try {
      await apiRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: projectName, data: project })
      });
      document.getElementById('auto-save-status').textContent = '✓ Saved to cloud';
      setTimeout(() => {
        document.getElementById('auto-save-status').textContent = '✓ Ready';
      }, 3000);
    } catch (error) {
      console.error('Cloud save failed:', error);
    }
  }
}

async function importProject(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const project = JSON.parse(text);
    
    if (!project.version || project.version !== '2.0') {
      throw new Error('Invalid project file version');
    }
    
    App.project = project;
    document.getElementById('project-name').value = project.name || 'Untitled';
    
    // Clear current effects
    App.effects.clear();
    document.getElementById('effects-track-content').innerHTML = '';
    
    // Load effects
    if (project.effects) {
      project.effects.forEach(ef => {
        const originalEffect = EFFECTS_LIBRARY.find(e => e.id === ef.effectId);
        if (originalEffect) {
          App.effects.set(ef.id, {
            effect: originalEffect,
            params: ef.params,
            start: ef.start,
            end: ef.end
          });
          addEffectToTimeline(ef.id, ef.effectName, ef.start, ef.end);
        }
      });
    }
    
    document.getElementById('active-effects').textContent = App.effects.size;
    
    showToast(`Loaded: ${project.name}`, 'success');
    
  } catch (error) {
    console.error('Import error:', error);
    showToast('Failed to load project', 'error');
  }
  
  e.target.value = '';
}

// ========== UTILITY FUNCTIONS ==========
function formatTime(seconds, withFrames = false) {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * App.fps);
  
  if (withFrames) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
  }
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });
  
  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function bindThemeEvents() {
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('theme-light');
  document.body.classList.toggle('theme-dark', !isLight);
  
  App.settings.theme = isLight ? 'light' : 'dark';
  localStorage.setItem('bacteria_theme', App.settings.theme);
  
  showToast(`Theme: ${isLight ? '☀️ Light' : '🌙 Dark'}`, 'info');
}

function bindHelpEvents() {
  document.getElementById('help-btn')?.addEventListener('click', () => {
    document.getElementById('help-modal').classList.remove('hidden');
  });
  
  document.getElementById('close-help')?.addEventListener('click', () => {
    document.getElementById('help-modal').classList.add('hidden');
  });
  
  document.getElementById('help-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'help-modal') {
      document.getElementById('help-modal').classList.add('hidden');
    }
  });
}

function bindKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 's':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          exportProject();
        }
        break;
      case 'e':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          exportProject();
        }
        break;
      case 'escape':
        document.getElementById('properties-panel').classList.add('hidden');
        document.getElementById('help-modal').classList.add('hidden');
        break;
      case '?':
        document.getElementById('help-modal').classList.toggle('hidden');
        break;
    }
  });
}

function bindProjectEvents() {
  // Auto-save project name
  document.getElementById('project-name').addEventListener('change', (e) => {
    App.project.name = e.target.value.trim() || 'Untitled';
    document.getElementById('auto-save-status').textContent = '✓ Saved';
    setTimeout(() => {
      document.getElementById('auto-save-status').textContent = '✓ Ready';
    }, 2000);
  });
}

// ========== BIND ALL EVENTS ==========
function bindEvents() {
  bindAuthEvents();
  bindVideoEvents();
  bindEffectsEvents();
  bindTimelineEvents();
  bindThemeEvents();
  bindHelpEvents();
  bindKeyboardShortcuts();
  bindProjectEvents();
  
  // Window resize
  window.addEventListener('resize', () => {
    setTimeout(setupCanvas, 100);
  });
}

// ========== EXPORT FOR DEBUGGING ==========
window.BACTERIA = {
  App,
  showToast,
  renderFrame,
  addEffect,
  exportProject,
  importProject
};

console.log('🦠 BACTERIA v2.0 - Ready to edit!');
