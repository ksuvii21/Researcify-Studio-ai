const mongoose = require('mongoose'); //Written by myself but updated with Gemini

/*
 * A Collection is an organizational container.
 *
 * It groups existing Papers and UploadedDocuments; it does
 * NOT own copies of them. Deleting a collection deletes only
 * the collection record, and deleting a paper/document only
 * removes its id from any collection that referenced it
 * (see collectionService and paperService/documentService).
 *
 * Notes are deliberately NOT collectable yet: papers and
 * documents are research *sources*, while notes are
 * user-authored research *output*. Keeping those concepts
 * separate keeps the UI and later RAG context selection
 * cleaner. This can be revisited if there is a genuine need.
 *
 * Relationship with the retired Library model:
 *   Paper      -> canonical saved research source
 *                 (paper preferences live on Paper.isFavorite)
 *   Collection -> organization (this model)
 *   ResearchProject -> research context
 *
 * A separate per-user "saved paper" model used to exist.
 * It was removed in 8E because it duplicated Paper and
 * would have become a second source of truth for the same
 * paper. Its only unique concept was a Saved/Reading/Read
 * status, which nothing in the UI consumes; if reading
 * state is ever genuinely needed it should be added
 * explicitly to Paper rather than by reviving a model.
 */
const collectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for faster queries
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxlength: 1000,
    },
    /*
     * Arrays are the correct shape here, unlike documents
     * with a project. A paper may belong to many collections
     * and a document may belong to many collections, so the
     * many-to-many relationship is stored once, here, rather
     * than duplicated onto Paper/UploadedDocument as a
     * second source of truth.
     */
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
    isPinned: {
        type: Boolean,
        default: false,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
},
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

collectionSchema.index({ userId: 1, updatedAt: -1 });

/*
 * Prevents a user from creating duplicate collection names.
 *
 * The collation makes the uniqueness case-insensitive, so
 * "Machine Learning", "machine learning" and "MACHINE
 * LEARNING" cannot become three collections for the same
 * user. Two different users may still each own a collection
 * with the same name, because userId is part of the key.
 */
collectionSchema.index(
  { userId: 1, name: 1 },
  {
    unique: true,
    collation: {
      locale: 'en',
      strength: 2,
    },
  }
);

module.exports = mongoose.model('Collection', collectionSchema);