const mongoose= require('mongoose'); //Written by myself but updated with Gemini

/*
 * A document is a file the user uploaded.
 *
 * The bytes live on disk (see config/documentUpload.js);
 * this collection stores only metadata, ownership,
 * relationships and processing state.
 */
const uploadedDocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster queries
    },
    /*
     * Canonical project relationship for documents.
     *
     * A document belongs to at most one project, so it
     * is stored here rather than in
     * ResearchProject.documentIds. That array is kept
     * for compatibility but is no longer written to.
     */
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
    description: {
        type: String,
        default: '',
        trim: true,
    },
    originalFileName: {
        type: String,
        required: true,
    },
    /*
     * Server-generated filename. Never derived from the
     * user-supplied name, so a malicious upload cannot
     * influence the path on disk.
     */
    storedName: {
        type: String,
        default: '',
    },
    mimeType: {
        type: String,
        default: '',
    },
    /*
     * API route that serves the file to its owner:
     *   GET /api/v1/documents/:id/download
     *
     * It is derived from the generated _id, so it is set
     * by createDocument after the record exists and is not
     * required at creation time. Storage adapters that
     * move to object storage can remap this without
     * touching the rest of the pipeline.
     */
    fileUrl: {
        type: String,
        default: "",
    },
    /*
     * Absolute path on disk. Used for deletion and, in
     * 8D.5, for streaming the file back to its owner.
     */
    storagePath: {
        type: String,
        default: '',
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
    /*
     * RAG processing lifecycle.
     *
     *   Uploaded   -> file is safely stored, not read yet
     *   Extracting -> file -> text
     *   Chunking   -> text -> RecordChunks
     *   Ready      -> can participate in RAG
     *   Failed     -> processing failed (see processingError)
     *
     * A successful upload is NOT the same as successful
     * processing, so new documents start at 'Uploaded'.
     * Nothing advances these states yet: extraction and
     * chunking arrive in 8G.
     */
    processingStatus: {
        type: String,
        enum: [
            'Uploaded',
            'Extracting',
            'Chunking',
            'Ready',
            'Failed',
        ],
        default: 'Uploaded',
        index: true, // Index for faster queries
    },
    processingError: {
        type: String,
        default: '',
    },
    /*
     * When processing last finished (successfully or not).
     * null means the document has never been processed.
     */
    processedAt: {
        type: Date,
        default: null,
    },
    /*
     * Bumped whenever extraction/chunking/embedding logic
     * changes, so documents processed under an older
     * pipeline can be identified and reprocessed later
     * without guessing from timestamps.
     */
    processingVersion: {
        type: Number,
        default: 1,
    },
    extractedTextAvailable: {
        type: Boolean,
        default: false,
    },
    extractedCharacterCount: {
        type: Number,
        default: 0,
    },
    chunkCount: {
        type: Number,
        default: 0,
    },
    /*
     * SHA-256 of the stored bytes. Enables integrity
     * checking, duplicate detection and a future
     * processing cache. Duplicates are deliberately NOT
     * rejected on upload: the same paper can legitimately
     * be filed in more than one context.
     */
    fileHash: {
        type: String,
        default: '',
        index: true, // Index for faster queries
    },
    aiSummary: {
        type: String,
        default: '',
    },

},
{
    timestamps: {createdAt: 'uploadedAt', updatedAt: 'updatedAt'}, // Automatically adds uploadedAt and updatedAt fields
});

uploadedDocumentSchema.index({ userId: 1, updatedAt: -1 });
uploadedDocumentSchema.index({ userId: 1, projectId: 1 });

module.exports = mongoose.model('UploadedDocument', uploadedDocumentSchema);