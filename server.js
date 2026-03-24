// BACTERIA BACKEND (Node.js + Express)
// Requires: npm install express cors body-parser

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve frontend files

// Mock Database (In-memory for demo)
const users = [];
const projects = [];

// Auth Routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, token: 'bacteria_token_' + Date.now() });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/signup', (req, res) => {
    const { username, password, email } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'User exists' });
    }
    users.push({ username, password, email });
    res.json({ success: true });
});

// Project Storage
app.post('/api/save', (req, res) => {
    const { token, projectData, filename } = req.body;
    // In a real app, verify token here
    const filePath = path.join(__dirname, 'projects', filename);
    
    if (!fs.existsSync('projects')) fs.mkdirSync('projects');
    
    fs.writeFile(filePath, JSON.stringify(projectData), (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Project saved to server' });
    });
});

app.get('/api/projects', (req, res) => {
    // List projects
    const dir = path.join(__dirname, 'projects');
    if (!fs.existsSync(dir)) return res.json([]);
    const files = fs.readdirSync(dir);
    res.json(files);
});

app.listen(PORT, () => {
    console.log(`BACTERIA SERVER RUNNING ON http://localhost:${PORT}`);
    console.log(`Ready to edit like Jynxx & Infinity.`);
});
