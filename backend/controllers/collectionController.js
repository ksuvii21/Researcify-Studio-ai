const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const collectionService = require("../services/collectionService");

const getUserId = (req) => req.user?.id || req.user?._id;

// -----------------------------------------------------
// Get Collections
// GET /api/v1/collections
// -----------------------------------------------------
exports.getCollections = asyncHandler(async (req, res) => {
  const collections = await collectionService.getCollections(
    getUserId(req),
    {
      search: req.query.search,
      pinned: req.query.pinned,
      archived: req.query.archived,
      sort: req.query.sort,
      order: req.query.order,
    }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      collections,
      "Collections fetched successfully."
    )
  );
});

// -----------------------------------------------------
// Get Single Collection
// GET /api/v1/collections/:id
// -----------------------------------------------------
exports.getCollectionById = asyncHandler(async (req, res) => {
  const collection = await collectionService.getCollectionById(
    getUserId(req),
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      collection,
      "Collection fetched successfully."
    )
  );
});

// -----------------------------------------------------
// Create Collection
// POST /api/v1/collections
// -----------------------------------------------------
exports.createCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.createCollection(
    getUserId(req),
    req.body
  );

  res.status(201).json(
    new ApiResponse(
      201,
      collection,
      "Collection created successfully."
    )
  );
});

// -----------------------------------------------------
// Update Collection
// PATCH /api/v1/collections/:id
// -----------------------------------------------------
exports.updateCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.updateCollection(
    getUserId(req),
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      collection,
      "Collection updated successfully."
    )
  );
});

// -----------------------------------------------------
// Delete Collection
// DELETE /api/v1/collections/:id
// -----------------------------------------------------
exports.deleteCollection = asyncHandler(async (req, res) => {
  await collectionService.deleteCollection(
    getUserId(req),
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(200, null, "Collection deleted successfully.")
  );
});

// -----------------------------------------------------
// Toggle Pin
// PATCH /api/v1/collections/:id/pin
// -----------------------------------------------------
exports.togglePin = asyncHandler(async (req, res) => {
  const collection = await collectionService.getCollectionById(
    getUserId(req),
    req.params.id
  );

  const updated = await collectionService.updateCollection(
    getUserId(req),
    req.params.id,
    {
      isPinned: !collection.isPinned,
    }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      updated,
      updated.isPinned
        ? "Collection pinned."
        : "Collection unpinned."
    )
  );
});

// -----------------------------------------------------
// Toggle Archive
// PATCH /api/v1/collections/:id/archive
// -----------------------------------------------------
exports.toggleArchive = asyncHandler(async (req, res) => {
  const collection = await collectionService.getCollectionById(
    getUserId(req),
    req.params.id
  );

  const updated = await collectionService.updateCollection(
    getUserId(req),
    req.params.id,
    {
      isArchived: !collection.isArchived,
    }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      updated,
      updated.isArchived
        ? "Collection archived."
        : "Collection unarchived."
    )
  );
});

// -----------------------------------------------------
// Add Paper to Collection
// POST /api/v1/collections/:id/papers
// -----------------------------------------------------
exports.addPaper = asyncHandler(async (req, res) => {
  const { paperId } = req.body;

  if (!paperId) {
    throw new ApiError(400, "paperId is required.");
  }

  const collection = await collectionService.addPaper(
    getUserId(req),
    req.params.id,
    paperId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      collection,
      "Paper added to collection."
    )
  );
});

// -----------------------------------------------------
// Remove Paper from Collection
// DELETE /api/v1/collections/:id/papers/:paperId
// -----------------------------------------------------
exports.removePaper = asyncHandler(async (req, res) => {
  const collection = await collectionService.removePaper(
    getUserId(req),
    req.params.id,
    req.params.paperId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      collection,
      "Paper removed from collection."
    )
  );
});

// -----------------------------------------------------
// Add Document to Collection
// POST /api/v1/collections/:id/documents
// -----------------------------------------------------
exports.addDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.body;

  if (!documentId) {
    throw new ApiError(400, "documentId is required.");
  }

  const collection = await collectionService.addDocument(
    getUserId(req),
    req.params.id,
    documentId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      collection,
      "Document added to collection."
    )
  );
});

// -----------------------------------------------------
// Remove Document from Collection
// DELETE /api/v1/collections/:id/documents/:documentId
// -----------------------------------------------------
exports.removeDocument = asyncHandler(async (req, res) => {
  const collection = await collectionService.removeDocument(
    getUserId(req),
    req.params.id,
    req.params.documentId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      collection,
      "Document removed from collection."
    )
  );
});