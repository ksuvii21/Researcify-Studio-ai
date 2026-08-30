const mongoose = require('mongoose'); //Written by myself but updated with Gemini

const librarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster queries
    },
    paperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper',
        required: true,
        index: true, // Index for faster queries
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['Saved', 'Reading', 'Read'],
        default: 'Saved',
    },
    savedAt: {
        type: Date,
        default: Date.now,
    },
});

librarySchema.index({ userId: 1, paperId: 1 }, { unique: true }); // Ensure a user can't save the same paper multiple times

module.exports = mongoose.model('Library', librarySchema);