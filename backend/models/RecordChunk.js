/*Document Chunk Model / Vector Record
For RAG functionality, research documents will be divided into smaller contextual chunks. Each chunk must remain traceable to its original source.

Major Fields
Field	Purpose
chunkId	Unique chunk identifier
documentId	Original document
userId	Authorized owner
projectId	Associated project where applicable
content	Chunk text
pageNumber	Original page
section	Document section
embedding	Vector representation or vector reference
The embeddings may be stored in a dedicated vector database, while MongoDB maintains corresponding metadata and ownership information.*/

const mongoose = require('mongoose'); //Written by myself

const recordChunkSchema = new mongoose.Schema({
    chunkId: {
        type: String,
        required: true,
        unique: true,
        index: true, // Index for faster queries
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadedDocument',
        required: true,
        index: true, // Index for faster queries
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster queries
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResearchProject',
        default: null,
        index: true, // Index for faster queries
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    pageNumber: {
        type: Number,
        required: true,
    },
    section: {
        type: String,
        default: null,
        trim: true,
    },
    embedding: {
        type: [Number],
        required: true,
    },
}, 
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

recordChunkSchema.index({ documentId: 1, pageNumber: 1, section: 1 });

module.exports = mongoose.model('RecordChunk', recordChunkSchema);