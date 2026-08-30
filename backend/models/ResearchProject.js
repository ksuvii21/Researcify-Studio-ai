/* The ResearchProject Model becomes particularly important in the Major Project. 
It represents a complete workspace for a particular research topic, dissertation, publication, or academic project.

Major Fields
Field	Purpose
_id	Project identifier
userId	Project owner
title	Research project title
description	Project description
researchQuestion	Primary research question
paperIds	Selected papers
documentIds	Uploaded documents
status	Active, Completed, Archived
createdAt	Creation timestamp
updatedAt	Modification timestamp
Related notes, AI conversations, literature reviews, and analyses can reference the project rather than being embedded directly inside it.*/

const mongoose = require('mongoose'); //Written by myself

const researchProjectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster queries
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    researchQuestion: {
        type: String,
        default: '',
        trim: true,
    },
    paperIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper',
      },
    ],
    documentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadedDocument',
      },
    ],
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Archived'],
        default: 'Active',
    },
}, 
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

researchProjectSchema.index({ userId: 1, title: 1 }, { unique: true }); // Prevents a user from creating duplicate project titles

module.exports = mongoose.model('ResearchProject', researchProjectSchema);