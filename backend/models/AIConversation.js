/*The AIConversation Model stores conversations between researchers and 
AI features such as Chat with Paper, Multi-Paper Chat, and the Research Assistant.

Important fields include u
serId, projectId, documentIds, title, conversationType, messages, createdAt, and updatedAt.

Each message may contain the user query, AI response, timestamp, and references to retrieved source chunks. 
Maintaining these references supports citation-aware and evidence-grounded responses. */

const mongoose = require('mongoose'); //Written by myself

const aiConversationSchema = new mongoose.Schema({
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
    documentIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UploadedDocument',
        },
    ],
    title: {
        type: String,
        required: true,
        trim: true,
    },
    conversationType: {
        type: String,
        enum: ['Chat with Paper', 'Multi Paper Chat', 'Research Assistant'],
        required: true,
    },
    messages: [
        {
            role: {
                type: String,
                enum: ['user', 'assistant', 'system'],
                required: true,
            },
            content: {
                type: String,
                required: true,
                trim: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            references: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'DocumentChunk',
                },
            ],
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('AIConversation', aiConversationSchema);