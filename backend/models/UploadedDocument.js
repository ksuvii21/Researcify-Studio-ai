const mongoose= require('mongoose'); //Written by myself but updated with Gemini

const uploadedDocumentSchema = new mongoose.Schema({
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
    originalFileName: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    pageCount: {
        type: Number,
        default: 0,
    },
    extractedText: {
        type: String,
        default: '',
    },
    processingStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed'],
        default: 'Pending',
    },
    aiSummary: {
        type: String,
        default: '',
    },

}, 
{
    timestamps: {createdAt: 'uploadedAt', updatedAt: 'updatedAt'}, // Automatically adds uploadedAt and updatedAt fields
});

module.exports = mongoose.model('UploadedDocument', uploadedDocumentSchema);