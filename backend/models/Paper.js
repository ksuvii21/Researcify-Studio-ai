const mongoose = require('mongoose'); //Written by myself but updated with Gemini

const paperSchema = new mongoose.Schema({ 
    externalId: {
        type: String,
        required: true,
        index: true, // Index for faster queries
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    authors: {
        type: [String],
        default: [],
    },
    abstract: {
        type: String,
        default: '',
    },
    publicationYear: {
        type: Number,
    },
    journal: {
        type: String,
        default: null,
    },
    doi: {
        type: String,
        sparse: true,
        index: true, // Index for faster queries
    },
    keywords: {
        type: [String],
        default: [],
    },
    citationCount: {
        type: Number,
        default: 0,
    },
    source: {
        type: String,
        required: true,
    },
    paperUrl: {
        type: String,
        default: null,
    },
    pdfUrl: {
        type: String,
        default: null,
    }, 
},
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Paper', paperSchema);