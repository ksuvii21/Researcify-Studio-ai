/*userId	Note owner
paperId	Optional paper reference
documentId	Optional uploaded-document reference
projectId	Optional research-project reference
title	Note title
content	Note content
tags	User-defined categories
createdAt	Creation timestamp
updatedAt	Modification timestamp*/

const mongoose = require('mongoose'); //Written by myself

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
        index: true, // Index for faster queries
    },
    paperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper',
        default: null,
        index: true, // Index for faster queries
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadedDocument',
        default: null,
        index: true, // Index for faster queries
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResearchProject',
        default: null,
        index: true, // Index for faster queries
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Note', noteSchema);