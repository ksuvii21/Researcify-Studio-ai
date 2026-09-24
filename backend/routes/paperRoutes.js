// routes/paperRoutes.js

const express = require('express');
const router = express.Router();
const {
    searchPapers,
    getPaperById,
    savePaper,
    getSavedPapers,
    removeSavedPaper
} = require('../controllers/paperController');
const verifyToken = require('../middleware/auth');

// Public or protected search endpoint (using verifyToken if search requires login)
router.get('/papers/search', searchPapers);

// Get specific paper details
router.get('/papers/:id', getPaperById);

// Library routes require authentication middleware for all endpoints below
router.use(verifyToken);

// Save a paper
router.post('/library', savePaper);

// Retrieve all saved papers for the user
router.get('/library', getSavedPapers);

// Remove a saved paper by its unique ID
router.delete('/library/:paperId', removeSavedPaper);

module.exports = router;