const mongoose = require("mongoose");

const Collection = require("../models/Collection");
const Paper = require("../models/Paper");
const UploadedDocument = require("../models/UploadedDocument");

const ApiError = require("../utils/ApiError");
const { recordActivity, ACTIVITY_ACTIONS } = require("./activityService");

// -----------------------------------------------------
// Id validation
// -----------------------------------------------------
/*
 * A malformed id ("abc", a truncated ObjectId) makes
 * Mongoose throw a CastError before the query runs, which
 * surfaces as a 500. Rejecting it as 404 keeps the
 * non-disclosure rule used across the app: a caller cannot
 * distinguish "no such record" from "not a valid id".
 */
const assertValidId = (id, notFoundMessage) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, notFoundMessage);
  }
};

// -----------------------------------------------------
// Counts
// -----------------------------------------------------
/*
 * The frontend should not have to infer counts from raw
 * arrays. At the current scale, array lengths are enough;
 * this is the one place that shape is produced so it can
 * later become an aggregation without touching callers.
 */
const withCounts = (collection) => ({
  ...collection,
  paperCount: collection.paperIds?.length || 0,
  documentCount: collection.documentIds?.length || 0,
});

// -----------------------------------------------------
// Case-insensitive name lookup
// -----------------------------------------------------
/*
 * The unique index on { userId, name } uses a strength-2
 * collation, so "RAG", "rag" and "Rag" collide at the
 * database level. The same collation must be applied to the
 * pre-check query, otherwise findOne would miss a
 * differently-cased duplicate and the insert would fail
 * with a raw duplicate-key error instead of a clean 409.
 */
const findByName = (userId, name, excludeId = null) => {
  const query = { userId, name };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Collection.findOne(query).collation({
    locale: "en",
    strength: 2,
  });
};

// -----------------------------------------------------
// Create Collection
// -----------------------------------------------------
/*
 * A collection is created empty on purpose. Resources are
 * attached afterwards through the dedicated relationship
 * endpoints, so there is exactly one authorization path
 * for "add a paper/document to a collection" rather than
 * two (create-time and relationship-time).
 */
const createCollection = async (userId, data) => {
  const name = data.name?.trim();

  if (!name) {
    throw new ApiError(400, "Collection name is required.");
  }

  const duplicate = await findByName(userId, name);

  if (duplicate) {
    throw new ApiError(
      409,
      "A collection with this name already exists."
    );
  }

  const collection = await Collection.create({
    userId,

    name,

    description: data.description?.trim() || "",
  });

  await recordActivity({
    userId,
    projectId: null,
    action: ACTIVITY_ACTIONS.COLLECTION_CREATED,
    entityType: "collection",
    entityId: collection._id,
    metadata: {
      title: collection.name,
    },
  });

  return withCounts(collection.toObject());
};

// -----------------------------------------------------
// Get Collections
// -----------------------------------------------------
const getCollections = async (
  userId,
  {
    search = "",
    pinned,
    archived = "false",
    sort = "updatedAt",
    order = "desc",
  } = {}
) => {
  const query = { userId };

  if (pinned === "true") {
    query.isPinned = true;
  }

  /*
   * Same archive semantics as notes:
   *   archived=true  -> only archived
   *   archived=all   -> everything
   *   default        -> only active
   */
  if (archived === "true") {
    query.isArchived = true;
  } else if (archived === "all") {
    // Intentionally no archive filter.
  } else {
    query.isArchived = false;
  }

  if (search.trim()) {
    const term = search.trim();

    query.$or = [
      {
        name: {
          $regex: term,
          $options: "i",
        },
      },
      {
        description: {
          $regex: term,
          $options: "i",
        },
      },
    ];
  }

  const allowedSort = [
    "createdAt",
    "updatedAt",
    "name",
  ];

  const sortField = allowedSort.includes(sort)
    ? sort
    : "updatedAt";

  const collections = await Collection.find(query)
    .sort({
      // Pinned collections always float to the top.
      isPinned: -1,
      [sortField]: order === "asc" ? 1 : -1,
    })
    .lean();

  return collections.map(withCounts);
};

// -----------------------------------------------------
// Get Single Collection
// -----------------------------------------------------
const getCollectionById = async (userId, collectionId) => {
  assertValidId(collectionId, "Collection not found.");

  const collection = await Collection.findOne({
    _id: collectionId,
    userId,
  })
    /*
     * Populate only what the detail view renders, and match
     * on userId as defense-in-depth against a legacy or bad
     * reference pointing at another user's record.
     */
    .populate({
      path: "paperIds",
      match: { userId },
      select:
        "title authors abstract year journal source isFavorite createdAt",
    })
    .populate({
      path: "documentIds",
      match: { userId },
      select:
        "title description originalFileName mimeType fileSize processingStatus processingError projectId uploadedAt",
    })
    .lean();

  if (!collection) {
    throw new ApiError(404, "Collection not found.");
  }

  return withCounts(collection);
};

// -----------------------------------------------------
// Update Collection
// -----------------------------------------------------
/*
 * Only user-editable metadata is accepted. userId,
 * paperIds and documentIds are server-owned relationships:
 * relationships are changed through the dedicated
 * endpoints so ownership validation is never bypassed.
 */
const updateCollection = async (
  userId,
  collectionId,
  data
) => {
  assertValidId(collectionId, "Collection not found.");

  const collection = await Collection.findOne({
    _id: collectionId,
    userId,
  });

  if (!collection) {
    throw new ApiError(404, "Collection not found.");
  }

  if (data.name !== undefined) {
    const name = data.name.trim();

    if (!name) {
      throw new ApiError(400, "Collection name is required.");
    }

    /*
     * Renaming onto another collection's name must fail the
     * same way creating a duplicate does, rather than
     * surfacing a raw duplicate-key error.
     */
    const duplicate = await findByName(
      userId,
      name,
      collection._id
    );

    if (duplicate) {
      throw new ApiError(
        409,
        "A collection with this name already exists."
      );
    }

    collection.name = name;
  }

  if (data.description !== undefined) {
    collection.description = String(
      data.description
    ).trim();
  }

  if (data.isPinned !== undefined) {
    collection.isPinned = Boolean(data.isPinned);
  }

  if (data.isArchived !== undefined) {
    collection.isArchived = Boolean(data.isArchived);
  }

  await collection.save();

  return withCounts(collection.toObject());
};

// -----------------------------------------------------
// Delete Collection
// -----------------------------------------------------
/*
 * Deleting a collection removes only the container. The
 * papers and documents it referenced are untouched: that is
 * the whole point of a collection being an organizational
 * entity rather than a copy of the resource.
 */
const deleteCollection = async (userId, collectionId) => {
  assertValidId(collectionId, "Collection not found.");

  const collection = await Collection.findOne({
    _id: collectionId,
    userId,
  });

  if (!collection) {
    throw new ApiError(404, "Collection not found.");
  }

  await collection.deleteOne();

  return collection;
};

// -----------------------------------------------------
// Add Paper
// -----------------------------------------------------
/*
 * Ownership is mandatory and checked for BOTH the
 * collection and the paper, so a caller cannot file another
 * user's paper into their own collection simply by knowing
 * the id. Either miss is a 404 (never a 403), so the caller
 * learns nothing about whether the id exists.
 */
const addPaper = async (userId, collectionId, paperId) => {
  assertValidId(collectionId, "Collection not found.");

  assertValidId(paperId, "Paper not found.");

  const [collection, paper] = await Promise.all([
    Collection.findOne({
      _id: collectionId,
      userId,
    }),

    Paper.findOne({
      _id: paperId,
      userId,
    }),
  ]);

  if (!collection) {
    throw new ApiError(404, "Collection not found.");
  }

  if (!paper) {
    throw new ApiError(404, "Paper not found.");
  }

  /*
   * Explicit duplicate detection rather than $addToSet, so
   * the client gets a meaningful 409 instead of a silent
   * no-op it cannot distinguish from success.
   */
  const alreadyAdded = collection.paperIds.some(
    (id) => id.toString() === paper._id.toString()
  );

  if (alreadyAdded) {
    throw new ApiError(
      409,
      "Paper is already in this collection."
    );
  }

  collection.paperIds.push(paper._id);

  await collection.save();

  await recordActivity({
    userId,
    projectId: null,
    action: ACTIVITY_ACTIONS.PAPER_ADDED_TO_COLLECTION,
    entityType: "paper",
    entityId: paper._id,
    metadata: {
      title: paper.title,
      collectionTitle: collection.name,
    },
  });

  return withCounts(collection.toObject());
};

// -----------------------------------------------------
// Remove Paper
// -----------------------------------------------------
const removePaper = async (
  userId,
  collectionId,
  paperId
) => {
  assertValidId(collectionId, "Collection not found.");

  assertValidId(paperId, "Paper not found.");

  const collection = await Collection.findOne({
    _id: collectionId,
    userId,
  });

  if (!collection) {
    throw new ApiError(404, "Collection not found.");
  }

  const before = collection.paperIds.length;

  collection.paperIds = collection.paperIds.filter(
    (id) => id.toString() !== paperId
  );

  if (collection.paperIds.length === before) {
    throw new ApiError(
      404,
      "Paper is not in this collection."
    );
  }

  await collection.save();

  await recordActivity({
    userId,
    projectId: null,
    action: ACTIVITY_ACTIONS.PAPER_REMOVED_FROM_COLLECTION,
    entityType: "paper",
    entityId: paperId,
    metadata: {
      collectionTitle: collection.name,
    },
  });

  return withCounts(collection.toObject());
};

// -----------------------------------------------------
// Add Document
// -----------------------------------------------------
const addDocument = async (
  userId,
  collectionId,
  documentId
) => {
  assertValidId(collectionId, "Collection not found.");

  assertValidId(documentId, "Document not found.");

  const [collection, document] = await Promise.all([
    Collection.findOne({
      _id: collectionId,
      userId,
    }),

    UploadedDocument.findOne({
      _id: documentId,
      userId,
    }),
  ]);

  if (!collection) {
    throw new ApiError(404, "Collection not found.");
  }

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  const alreadyAdded = collection.documentIds.some(
    (id) => id.toString() === document._id.toString()
  );

  if (alreadyAdded) {
    throw new ApiError(
      409,
      "Document is already in this collection."
    );
  }

  collection.documentIds.push(document._id);

  await collection.save();

  await recordActivity({
    userId,
    projectId: null,
    action: ACTIVITY_ACTIONS.DOCUMENT_ADDED_TO_COLLECTION,
    entityType: "document",
    entityId: document._id,
    metadata: {
      title: document.title,
      collectionTitle: collection.name,
    },
  });

  return withCounts(collection.toObject());
};

// -----------------------------------------------------
// Remove Document
// -----------------------------------------------------
const removeDocument = async (
  userId,
  collectionId,
  documentId
) => {
  assertValidId(collectionId, "Collection not found.");

  assertValidId(documentId, "Document not found.");

  const collection = await Collection.findOne({
    _id: collectionId,
    userId,
  });

  if (!collection) {
    throw new ApiError(404, "Collection not found.");
  }

  const before = collection.documentIds.length;

  collection.documentIds = collection.documentIds.filter(
    (id) => id.toString() !== documentId
  );

  if (collection.documentIds.length === before) {
    throw new ApiError(
      404,
      "Document is not in this collection."
    );
  }

  await collection.save();

  await recordActivity({
    userId,
    projectId: null,
    action: ACTIVITY_ACTIONS.DOCUMENT_REMOVED_FROM_COLLECTION,
    entityType: "document",
    entityId: documentId,
    metadata: {
      collectionTitle: collection.name,
    },
  });

  return withCounts(collection.toObject());
};

module.exports = {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,

  addPaper,
  removePaper,

  addDocument,
  removeDocument,
};
