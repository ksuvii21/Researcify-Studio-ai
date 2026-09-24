//Axios is a popular, open-source JavaScript library used to
//make HTTP requests from web browsers or 
// Node.js environments.
const axios = require('axios');
const Library = require('../models/Library');

// @desc Search academic papers from an external API (e.g., CrossRef, Semantic scholar, or arXiv) and normalize them
// @route GET /api/v1/papers/search?q=

exports.searchPapers = async (req, res) => {
    try{
        //Extract the search quey 'q' from the request query parameters
        const query = req.query.q;
        //Validate the query parameter
        if(!query || !query.trim()){
            return res.status(400).json({success: false, message: 'Search query is required.'});
        }
        //Calling CrossRef API as an example
        const externalApiResponse = await axios.get('https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=10');
        // Map and normalize the external API data into your project's consistent structure
        const normalizedPapers = externalApiResponse.data.message.items.map((item) => ({
            title: item.title ? item.title[0] : 'No Title Available',
            authors: item.author ? item.author.map(a => `${a.given || ''} ${a.family || ''}`.trim()) : [],
            abstract: item.abstract || 'No abstract available.',
            publicationYear: item.published?.['date-parts']?.[0]?.[0] || null,
            doi: item.DOI || null,
            source: 'CrossRef',
            availableUrls: item.URL ? [item.URL] : []
        }));

        // Return the successfully normalized search results
        res.status(200).json({
            success: true,
            message: 'Papers retrieved and normalized successfully',
            data: {
                papers: normalizedPapers
            }
        });
    }
    catch(err){
        // Catch network or external API errors and return 500
        res.status(500).json({
            success: false,
            message: 'Error fetching papers from external sources',
            error: error.message
        });
    }
};

// @desc    Retrieve detailed information for a single paper by its ID or DOI
// @route   GET /api/v1/papers/:id
exports.getPaperById = async (req, res) => {
    try {
        const paperId = req.params.id;

        // Fetch specific paper details from the external provider using the ID/DOI
        const externalApiResponse = await axios.get(`https://api.crossref.org/works/${paperId}`);
        const item = externalApiResponse.data.message;

        // Normalize the single paper data structure
        const paper = {
            title: item.title ? item.title[0] : 'No Title Available',
            authors: item.author ? item.author.map(a => `${a.given || ''} ${a.family || ''}`.trim()) : [],
            abstract: item.abstract || 'No abstract available.',
            publicationYear: item.published?.['date-parts']?.[0]?.[0] || null,
            doi: item.DOI || null,
            source: 'CrossRef',
            availableUrls: item.URL ? [item.URL] : []
        };

        res.status(200).json({
            success: true,
            message: 'Paper details retrieved successfully',
            data: {
                paper
            }
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: 'Paper not found',
            error: error.message
        });
    }
};

// @desc    Save a paper to the authenticated user's personal library
// @route   POST /api/v1/library
exports.savePaper = async (req, res) => {
    try {
        // Extract paper metadata from the request body
        const { title, authors, abstract, publicationYear, doi, source, availableUrls } = req.body;

        // Check if the paper is already saved by this user to avoid duplicates
        const existingEntry = await Library.findOne({ user: req.user.id, doi });
        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: 'Paper is already saved in your library.'
            });
        }

        // Create a new saved library record linked to the logged-in user
        const newSavedPaper = new Library({
            user: req.user.id, // Attached by verifyToken middleware
            title,
            authors,
            abstract,
            publicationYear,
            doi,
            source,
            availableUrls
        });

        // Save to database
        await newSavedPaper.save();

        res.status(201).json({
            success: true,
            message: 'Paper saved to library successfully',
            data: {
                savedPaper: newSavedPaper
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to save paper',
            error: error.message
        });
    }
};

// @desc    Retrieve all saved papers for the authenticated user
// @route   GET /api/v1/library
exports.getSavedPapers = async (req, res) => {
    try {
        // Query the database for all library records belonging to the current user
        const savedPapers = await Library.find({ user: req.user.id });

        res.status(200).json({
            success: true,
            message: 'Saved papers retrieved successfully',
            data: {
                papers: savedPapers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve saved papers',
            error: error.message
        });
    }
};

// @desc    Remove a saved paper from the user's library by its database record ID
// @route   DELETE /api/v1/library/:paperId
exports.removeSavedPaper = async (req, res) => {
    try {
        const { paperId } = req.params;

        // Find and delete the library record ensuring it belongs to the authenticated user
        const deletedPaper = await Library.findOneAndDelete({
            _id: paperId,
            user: req.user.id
        });

        if (!deletedPaper) {
            return res.status(404).json({
                success: false,
                message: 'Saved paper not found or unauthorized'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Paper removed from library successfully',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove saved paper',
            error: error.message
        });
    }
};