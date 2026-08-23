const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// 1. Basic GET route
app.get('/', (req, res) => {
    res.send('Hello, World! Your server is up and running.');
});

//2. Sample JSON API Route
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running', message: 'Server is healthy', timestamp: new Date() });
});

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'true', message: 'ResearchFlow API is running', timestamp: new Date() });
});