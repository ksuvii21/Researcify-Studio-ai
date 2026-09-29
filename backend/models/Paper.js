const mongoose = require('mongoose'); //Written by myself but updated with Gemini

const paperSchema = new mongoose.Schema({ 
    /*
     * Owner of this saved paper.
     *
     * NOTE: the previous version of this model had no
     * userId, which meant papers could not be scoped
     * per user. Ownership is required so that two
     * different users may save the same paper.
     */
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster queries
    },
    externalId: {
        type: String,
        default: null,
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
        trim: true,
    },
    year: {
        type: Number,
        default: null,
    },
    journal: {
        type: String,
        default: '',
        trim: true,
    },
    doi: {
        type: String,
        default: '',
        trim: true,
        sparse: true,
        index: true, // Index for faster queries
    },
    url: {
        type: String,
        default: '',
        trim: true,
    },
    source: {
        type: String,
        default: 'Manual',
        trim: true,
    },
    keywords: {
        type: [String],
        default: [],
    },
    citationCount: {
        type: Number,
        default: 0,
    },
    pdfUrl: {
        type: String,
        default: null,
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
},
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

/*
 * DOI is deliberately NOT globally unique: two
 * different users may legitimately save the same
 * published paper. Duplicate prevention happens
 * per-user inside paperService.createPaper.
 */
paperSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Paper', paperSchema);