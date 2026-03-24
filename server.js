/**
 * BACTERIA v2.0 - Backend Server
 * Fully working auth + project storage + static file serving
 * Deploy-ready for Render, Railway, Fly.io
 */

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { join, dirname } = require('path');
const { readFile, writeFile, mkdir, access } = require('fs').promises;
const crypto = require('crypto');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Required for Render/Railway

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from current directory
const staticDir = join(__dirname);
app.use(express.static(staticDir, {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ========== IN-MEMORY STORAGE ==========
// Replace with real DB (PostgreSQL/MongoDB) for production
const store = {
  users: new Map(),      // username -> { id, email, passwordHash, createdAt, projects: [] }
  sessions: new Map(),   // token -> { username, expires }
  projects: new Map()    // projectId -> { id, name, owner, data, createdAt, updatedAt }
};

// ========== HELPER FUNCTIONS ==========
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const session = store.sessions.get(token);
  if (!session || session.expires < Date.now()) {
    store.sessions.delete(token);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  // Refresh session expiry
  session.expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  store.sessions.set(token, session);
  
  req.username = session.username;
  next();
}

function formatDate(date) {
  return new Date(date).toISOString();
}

// ========== AUTH ROUTES ==========

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if username exists
    if (store.users.has(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    
    // Create user
    const user = {
      id: crypto.randomUUID(),
      username,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      createdAt: formatDate(new Date()),
      projects: []
    };
    
    store.users.set(username, user);
    
    // Create session
    const token = generateToken();
    store.sessions.set(token, {
      username,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Response (never send password)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = store.users.get(username);
    
    if (!user) {
      // Don't reveal if user exists or not
      await new Promise(resolve => setTimeout(resolve, 100)); // Prevent timing attacks
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session
    const token = generateToken();
    store.sessions.set(token, {
      username,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (token) {
    store.sessions.delete(token);
  }
  
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = store.users.get(req.username);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    success: true,
    user: {
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      projectCount: user.projects.length
    }
  });
});

// ========== PROJECT ROUTES ==========

// Create project
app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const { name, data } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const projectId = crypto.randomUUID();
    
    const project = {
      id: projectId,
      name: name.trim(),
      owner: req.username,
      data: data || {},
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date()),
      version: '2.0'
    };
    
    store.projects.set(projectId, project);
    
    // Add to user's project list
    const user = store.users.get(req.username);
    if (user) {
      user.projects.push(projectId);
    }
    
    res.status(201).json({
      success: true,
      message: 'Project created',
      project: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// List user's projects
app.get('/api/projects', requireAuth, (req, res) => {
  const user = store.users.get(req.username);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const projects = user.projects
    .map(id => store.projects.get(id))
    .filter(p => p) // Remove undefined
    .map(({ id, name, createdAt, updatedAt }) => ({
      id, name, createdAt, updatedAt
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  res.json({
    success: true,
    count: projects.length,
    projects
  });
});

// Get single project
app.get('/api/projects/:id', requireAuth, (req, res) => {
  const project = store.projects.get(req.params.id);
  
  if (!project || project.owner !== req.username) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json({
    success: true,
    project
  });
});

// Update project
app.put('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const project = store.projects.get(req.params.id);
    
    if (!project || project.owner !== req.username) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const { name, data } = req.body;
    
    if (name) project.name = name.trim();
    if (data !== undefined) project.data = data;
    
    project.updatedAt = formatDate(new Date());
    store.projects.set(req.params.id, project);
    
    res.json({
      success: true,
      message: 'Project updated',
      project: {
        id: project.id,
        name: project.name,
        updatedAt: project.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/api/projects/:id', requireAuth, (req, res) => {
  const project = store.projects.get(req.params.id);
  
  if (!project || project.owner !== req.username) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Remove from user's project list
  const user = store.users.get(req.username);
  if (user) {
    user.projects = user.projects.filter(id => id !== req.params.id);
  }
  
  // Delete project
  store.projects.delete(req.params.id);
  
  res.json({
    success: true,
    message: 'Project deleted'
  });
});

// Export project as .bacteria file (download)
app.get('/api/projects/:id/export', requireAuth, (req, res) => {
  const project = store.projects.get(req.params.id);
  
  if (!project || project.owner !== req.username) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const filename = `${project.name.replace(/[^a-z0-9]/gi, '_')}.bacteria`;
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  res.json(project);
});

// ========== UTILITY ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Effects list (for reference - effects are client-side)
app.get('/api/effects', (req, res) => {
  res.json({
    success: true,
    message: 'Effects library is client-side for performance',
    count: 50,
    categories: ['shake', 'glitch', 'color', 'overlay', 'distort', 'stylize', 'utility']
  });
});

// File upload endpoint (for future media storage)
app.post('/api/upload', requireAuth, (req, res) => {
  // Placeholder - implement with multer + cloud storage in production
  res.status(501).json({ 
    error: 'File upload not implemented',
    message: 'Use client-side File API for .bacteria exports'
  });
});

// ========== SPA FALLBACK ==========
// Serve index.html for all other routes (for client-side routing)
app.get('*', (req, res) => {
  // Don't intercept API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(join(staticDir, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ========== SERVER STARTUP ==========
async function startServer() {
  try {
    // Ensure projects directory exists for future file storage
    const projectsDir = join(__dirname, 'projects');
    try {
      await access(projectsDir);
    } catch {
      await mkdir(projectsDir, { recursive: true });
      console.log('✓ Created projects directory');
    }
    
    server.listen(PORT, HOST, () => {
      const url = `http://localhost:${PORT}`;
      const publicUrl = process.env.RENDER_EXTERNAL_URL || 
                       process.env.RAILWAY_PUBLIC_DOMAIN || 
                       url;
      
      console.log('');
      console.log('🦠  BACTERIA v2.0 Server Started');
      console.log('═══════════════════════════════');
      console.log(`🌐  Editor:  ${publicUrl}`);
      console.log(`🔌  API:     ${publicUrl}/api`);
      console.log(`🔍  Health:  ${publicUrl}/api/health`);
      console.log(`👥  Users:   ${store.users.size} registered`);
      console.log(`📁  Projects: ${store.projects.size} created`);
      console.log(`⚡  Port:    ${PORT}`);
      console.log(`🔧  Env:     ${process.env.NODE_ENV || 'development'}`);
      console.log('═══════════════════════════════');
      console.log('');
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ========== GRACEFUL SHUTDOWN ==========
function gracefulShutdown(signal) {
  console.log(`\n🛑  Received ${signal}. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('✓ HTTP server closed');
    
    // Clear sessions (in production, save to DB first)
    store.sessions.clear();
    console.log('✓ Sessions cleared');
    
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ========== START ==========
startServer();

// Export for testing (optional)
module.exports = { app, server, store };
