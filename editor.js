// BACTERIA EDITOR ENGINE

class BacteriaEditor {
    constructor() {
        this.canvas = document.getElementById('preview-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.video = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.effects = []; // Array of { start, end, effectId, params }
        this.animationId = null;
        this.lastFrameTime = 0;
        
        this.initUI();
    }

    initUI() {
        // Populate Effects List
        const list = document.getElementById('effects-list');
        EFFECTS.forEach(ef => {
            const div = document.createElement('div');
            div.className = 'effect-item';
            div.innerText = ef.name;
            div.onclick = () => this.addEffect(ef.id);
            list.appendChild(div);
        });

        // Event Listeners
        document.getElementById('video-upload').addEventListener('change', (e) => this.loadVideo(e.target.files[0]));
        document.getElementById('seek-bar').addEventListener('input', (e) => this.seek(e.target.value));
        document.getElementById('project-load').addEventListener('change', (e) => this.loadProject(e.target.files[0]));
        
        // Auth Mock
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('auth-modal').classList.remove('active');
            document.getElementById('editor-ui').style.display = 'flex';
            document.getElementById('username-display').innerText = "EDITOR_01";
        });
    }

    loadVideo(file) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        this.video = document.createElement('video');
        this.video.src = url;
        this.video.onloadedmetadata = () => {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.duration = this.video.duration;
            document.getElementById('seek-bar').max = this.duration;
            this.renderFrame();
        };
    }

    addEffect(effectId) {
        const effect = EFFECTS.find(e => e.id === effectId);
        if (!effect) return;
        
        // Add to timeline at current time
        this.effects.push({
            start: this.currentTime,
            end: this.currentTime + 2, // Default 2 sec duration
            effect: effect
        });
        this.renderTimeline();
    }

    renderTimeline() {
        const track = document.getElementById('timeline');
        track.innerHTML = '';
        this.effects.forEach((ef, i) => {
            const block = document.createElement('div');
            block.className = 'timeline-block';
            block.style.left = (ef.start / this.duration * 100) + '%';
            block.style.width = ((ef.end - ef.start) / this.duration * 100) + '%';
            block.innerText = ef.effect.name;
            block.onclick = () => {
                this.currentTime = ef.start;
                this.video.currentTime = ef.start;
                this.renderFrame();
            };
            track.appendChild(block);
        });
    }

    togglePlay() {
        if (this.isPlaying) {
            this.video.pause();
            this.isPlaying = false;
            document.getElementById('play-btn').innerText = "PLAY";
            cancelAnimationFrame(this.animationId);
        } else {
            this.video.play();
            this.isPlaying = true;
            document.getElementById('play-btn').innerText = "PAUSE";
            this.loop();
        }
    }

    stopVideo() {
        this.video.pause();
        this.video.currentTime = 0;
        this.currentTime = 0;
        this.isPlaying = false;
        document.getElementById('play-btn').innerText = "PLAY";
        cancelAnimationFrame(this.animationId);
        this.renderFrame();
    }

    seek(val) {
        if (!this.video) return;
        this.currentTime = parseFloat(val);
        this.video.currentTime = this.currentTime;
        this.renderFrame();
    }

    loop() {
        if (!this.isPlaying) return;
        this.currentTime = this.video.currentTime;
        document.getElementById('seek-bar').value = this.currentTime;
        document.getElementById('timecode').innerText = new Date(this.currentTime * 1000).toISOString().substr(11, 8);
        
        this.renderFrame();
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    renderFrame() {
        if (!this.video || this.video.readyState < 2) return;

        // 1. Draw Base Frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        
        // Find active effects
        const activeEffects = this.effects.filter(ef => this.currentTime >= ef.start && this.currentTime <= ef.end);

        // Apply Transforms
        activeEffects.forEach(ef => {
            const p = ef.effect.params;
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            
            if (ef.effect.type === 'transform') {
                this.ctx.translate(cx, cy);
                if (p.amp) { // Shake
                    const dx = (Math.random() - 0.5) * p.amp;
                    const dy = (Math.random() - 0.5) * p.amp;
                    this.ctx.translate(dx, dy);
                }
                if (p.scale) this.ctx.scale(p.scale, p.scale);
                if (p.angle) this.ctx.rotate(p.angle * Math.PI / 180);
                if (p.skewX) this.ctx.transform(1, 0, Math.tan(p.skewX * Math.PI / 180), 1, 0, 0);
                if (p.mirrorX) this.ctx.scale(-1, 1);
                this.ctx.translate(-cx, -cy);
            }
        });

        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        // Apply Filters (CSS style)
        let filterString = "";
        activeEffects.forEach(ef => {
            if (ef.effect.type === 'filter') {
                filterString += getFilterString(ef.effect);
            }
        });
        if (filterString) {
            // Re-draw with filter (simplified approach for demo)
            // In a real app, we'd use an offscreen canvas for performance
            this.ctx.filter = filterString;
            // Note: Applying filter to existing canvas content is tricky without offscreen.
            // For this demo, we assume the video draw had the filter or we skip complex chaining for brevity.
            // Instead, let's apply custom pixel manipulations below.
            this.ctx.filter = 'none'; 
        }

        // Apply Custom Effects (Pixel Manipulation)
        if (activeEffects.length > 0) {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            activeEffects.forEach(ef => {
                const action = ef.effect.action;
                if (action === 'rgbSplit') this.applyRGBSplit(data, this.canvas.width, this.canvas.height);
                if (action === 'noise') this.applyNoise(data);
                if (action === 'thermal') this.applyThermal(data);
                // ... add more custom pixel logic here
            });
            
            this.ctx.putImageData(imageData, 0, 0);
        }

        // Apply Overlays
        activeEffects.forEach(ef => {
            if (ef.effect.type === 'overlay') {
                const p = ef.effect.params;
                if (p.color) {
                    this.ctx.fillStyle = p.color;
                    this.ctx.globalAlpha = p.opacity || 0.5;
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.globalAlpha = 1.0;
                }
                if (ef.effect.id === 'scanlines') {
                    this.ctx.fillStyle = "rgba(0,0,0,0.5)";
                    for(let i=0; i<this.canvas.height; i+=4) {
                        this.ctx.fillRect(0, i, this.canvas.width, 1);
                    }
                }
            }
        });
    }

    // --- Custom Effect Algorithms (Simplified) ---
    applyRGBSplit(data, w, h) {
        // Simple shift simulation
        for (let i = 0; i < data.length; i += 4) {
            if (i % 10 === 0) {
                data[i] = data[i+4]; // Shift R
            }
        }
    }
    applyNoise(data) {
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 50;
            data[i] += noise;
            data[i+1] += noise;
            data[i+2] += noise;
        }
    }
    applyThermal(data) {
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i+1] + data[i+2]) / 3;
            data[i] = avg * 2; // Red
            data[i+1] = avg * 0.5; // Green low
            data[i+2] = avg * 0.1; // Blue low
        }
    }

    // --- File I/O ---
    saveProject() {
        const project = {
            version: "1.0",
            effects: this.effects,
            duration: this.duration
        };
        const blob = new Blob([JSON.stringify(project)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "project.bacteria";
        a.click();
    }

    loadProject(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const project = JSON.parse(e.target.result);
            this.effects = project.effects;
            this.duration = project.duration;
            this.renderTimeline();
            alert("Project Loaded! Please ensure source video is available.");
        };
        reader.readAsText(file);
    }
}

// Initialize
const editor = new BacteriaEditor();

// Global helpers for HTML
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    if(tab === 'login') {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    } else {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    }
}
function togglePlay() { editor.togglePlay(); }
function stopVideo() { editor.stopVideo(); }
function saveProject() { editor.saveProject(); }
function logout() { location.reload(); }
