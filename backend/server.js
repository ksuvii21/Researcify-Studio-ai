const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/authRoutes');

// Mount using the exact versioned prefix requested
app.use('/api/v1/auth', authRoutes);

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
    res.json({ status: 'true', message: 'Researchify Studio API is running', timestamp: new Date() });
});