/*userId	Note owner
paperId	Optional paper reference
documentId	Optional uploaded-document reference
projectId	Optional research-project reference
title	Note title
content	Note content
tags	User-defined categories
isPinned	Pin to top of note lists
isArchived	Hidden from default lists
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
        trim: true,
        default: 'Untitled Note',
    },
    content: {
        type: String,
        default: '',
    },
    tags: {
        type: [String],
        default: [],
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } // Automatically adds createdAt and updatedAt fields
});

/*
 * Note lists are always read as "this user's notes,
 * newest activity first", so the compound index
 * matches the actual access pattern.
 */
noteSchema.index({ userId: 1, updatedAt: -1 });
noteSchema.index({ userId: 1, projectId: 1 });
noteSchema.index({ userId: 1, paperId: 1 });

module.exports = mongoose.model('Note', noteSchema);