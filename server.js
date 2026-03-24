/**
 * BACTERIA v2.0 - Backend Server
 * Handles auth, project storage, and API endpoints
 */

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { join } = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(join(__dirname), { 
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// In-memory storage (replace with DB in production)
const users = new Map();
const projects = new Map();
const sessions = new Map();

// ========== AUTH ROUTES ==========
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    if (users.has(username)) {
      return res.status(409).json({ error: 'Username taken' });
    }
    
    // Hash password (use bcrypt in production)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    const user = {
      id: crypto.randomUUID(),
      username,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
      projects: []
    };
    
    users.set(username, user);
    
    // Create session
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { username, expires: Date.now() + 7*24*60*60*1000 });
    
    res.status(201).json({ 
      success: true, 
      token, 
      user: { username, email } 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.get(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { username, expires: Date.now() + 7*24*60*60*1000 });
    
    res.json({ 
      success: true, 
      token, 
      user: { username, email: user.email } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// Middleware to protect routes
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Invalid session' });
  }
  
  req.user = session.username;
  next();
};

// ========== PROJECT ROUTES ==========
app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const { name, data } = req.body;
    const projectId = crypto.randomUUID();
    
    const project = {
      id: projectId,
      name,
      owner: req.user,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    projects.set(projectId, project);
    
    // Add to user's project list
    const user = users.get(req.user);
    if (user) {
      user.projects.push(projectId);
    }
    
    res.status(201).json({ success: true, project: { id: projectId, name } });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/projects', requireAuth, (req, res) => {
  const user = users.get(req.user);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const userProjects = user.projects
    .map(id => projects.get(id))
    .filter(p => p)
    .map(({ id, name, updatedAt }) => ({ id, name, updatedAt }));
  
  res.json({ success: true, projects: userProjects });
});

app.get('/api/projects/:id', requireAuth, (req, res) => {
  const project = projects.get(req.params.id);
  if (!project || project.owner !== req.user) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json({ success: true, project });
});

app.put('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const project = projects.get(req.params.id);
    if (!project || project.owner !== req.user) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    project.data = req.body.data;
    project.updatedAt = new Date().toISOString();
    
    res.json({ success: true, project: { id: project.id, updatedAt: project.updatedAt } });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/projects/:id', requireAuth, (req, res) => {
  const project = projects.get(req.params.id);
  if (!project || project.owner !== req.user) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  projects.delete(req.params.id);
  
  const user = users.get(req.user);
  if (user) {
    user.projects = user.projects.filter(id => id !== req.params.id);
  }
  
  res.json({ success: true });
});

// ========== UTILITY ROUTES ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', uptime: process.uptime() });
});

app.get('/api/effects', (req, res) => {
  // In production, serve from effects-lib.js or database
  res.json({ success: true, count: 50, message: 'Effects loaded client-side' });
});

// ========== FALLBACK FOR SPA ==========
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// ========== START SERVER ==========
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🦠 BACTERIA v2.0 server running on http://localhost:${PORT}`);
  console.log(`✨ Editor: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
