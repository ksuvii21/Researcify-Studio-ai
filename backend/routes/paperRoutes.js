// routes/paperRoutes.js

const express = require('express');
const router = express.Router();
const {
    searchPapers,
    getPapers,
    getPaperById,
    createPaper,
    updatePaper,
    deletePaper,
    toggleFavorite
} = require('../controllers/paperController');
const verifyToken = require('../middleware/auth');

// Public external search endpoint
router.get('/papers/search', searchPapers);

// All saved-paper routes require authentication
router.use(verifyToken);

// Saved papers collection
router
    .route('/papers')
    .get(getPapers)
    .post(createPaper);

// Declared before the generic '/papers/:id' handlers so
// 'favorite' is never swallowed as an :id value.
router.patch('/papers/:id/favorite', toggleFavorite);

// Single saved paper
router
    .route('/papers/:id')
    .get(getPaperById)
    .patch(updatePaper)
    .delete(deletePaper);

module.exports = router;