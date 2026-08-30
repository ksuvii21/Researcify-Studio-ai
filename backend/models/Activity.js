/*The Activity Model records relevant user interactions for dashboard analytics and personalization.

It may contain userId, activityType, query, paperId, documentId, projectId, and timestamp.

Activities can include searches, paper views, saves, uploads, AI analyses, and project interactions. 
This information can later support recommendations and research analytics.  */

const mongoose = require('mongoose'); //Written by myself

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster queries
    },
    activityType: {
        type: String,
        enum: ['Search', 'Paper View', 'Save', 'Upload', 'AI Analysis', 'Project Interaction'],
        required: true,
    },
    query: {
        type: String,
        default: '',
        trim: true,
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
}, 
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

activitySchema.index({ userId: 1, activityType: 1, createdAt: -1 }); // Index for faster queries on user activities

module.exports = mongoose.model('Activity', activitySchema);


/*User
 ├── Saved Papers ────── Paper
 ├── Collections ─────── Papers
 ├── Uploaded Documents
 │       └── Document Chunks ── Vector Index
 ├── Notes
 ├── Research Projects
 │       ├── Papers
 │       ├── Documents
 │       ├── Notes
 │       ├── AI Conversations
 │       └── Research Outputs
 └── Activity History*/
