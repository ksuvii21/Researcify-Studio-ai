const fs = require("fs/promises");
const fsSync = require("fs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const UploadedDocument = require("../models/UploadedDocument");
const ResearchProject = require("../models/ResearchProject");
const RecordChunk = require("../models/RecordChunk");
const Note = require("../models/Note");
const Collection = require("../models/Collection");

const ApiError = require("../utils/ApiError");
const { recordActivity, ACTIVITY_ACTIONS } = require("./activityService");

// -----------------------------------------------------
// Id validation
// -----------------------------------------------------
/*
 * A malformed id ("000", "abc", a truncated ObjectId)
 * makes Mongoose throw a CastError before the query runs,
 * which surfaces as a 500. That leaks that the request was
 * understood but the value was unparseable, and it is not
 * a server fault.
 *
 * Rejecting it as 404 keeps the non-disclosure rule used
 * everywhere else: a caller cannot distinguish "no such
 * document" from "not a valid document id".
 */
const assertValidId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, "Document not found.");
  }
};

// -----------------------------------------------------
// File hash
// -----------------------------------------------------
/*
 * SHA-256 of the stored bytes, streamed so a 10 MB
 * upload never has to be buffered in memory.
 *
 * Recorded at upload time for integrity checking,
 * duplicate detection and a future processing cache.
 * Duplicate hashes are deliberately NOT rejected.
 */
const calculateFileHash = (filePath) =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");

    const stream = fsSync.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));

    stream.on("end", () => resolve(hash.digest("hex")));

    stream.on("error", reject);
  });

// -----------------------------------------------------
// Validate optional project
// -----------------------------------------------------
/*
 * Same ownership rule as notes: a project id supplied
 * by the caller must resolve against the authenticated
 * user, otherwise a document could be attached to
 * someone else's project.
 */
const validateProject = async (userId, projectId) => {
  if (!projectId) return;

  const project = await ResearchProject.exists({
    _id: projectId,
    userId,
  });

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }
};

// -----------------------------------------------------
// Create Document
// -----------------------------------------------------
const createDocument = async (userId, file, data) => {
  if (!file) {
    throw new ApiError(400, "Document file is required.");
  }

  try {
    await validateProject(userId, data.projectId);

    /*
     * Hash the bytes now, while the file is guaranteed
     * to exist. A failure here aborts the whole upload
     * rather than storing a document with no hash.
     */
    const fileHash = await calculateFileHash(file.path);

    /*
     * fileUrl is derived from the generated _id, so it is
     * assigned after the record exists. It points at the
     * secure download route handled by
     * documentController.downloadDocument.
     */
    const document = await UploadedDocument.create({
      userId,

      projectId: data.projectId || null,

      title: data.title?.trim() || file.originalname,

      description: data.description?.trim() || "",

      originalFileName: file.originalname,

      storedName: file.filename,

      mimeType: file.mimetype,

      fileSize: file.size,

      storagePath: file.path,

      fileHash,

      /*
       * A successful upload is not a successful
       * processing run. Extraction and chunking do not
       * exist yet, so the document waits at 'Uploaded'.
       */
      processingStatus: "Uploaded",
      processingVersion: 1,
      extractedTextAvailable: false,
      chunkCount: 0,
      processedAt: null,
    });

    document.fileUrl = `/api/v1/documents/${document._id}/download`;

    await document.save();

    await recordActivity({
      userId,
      projectId: document.projectId || null,
      action: ACTIVITY_ACTIONS.DOCUMENT_UPLOADED,
      entityType: "document",
      entityId: document._id,
      metadata: {
        title: document.title,
        originalName: document.originalFileName,
        ...(document.projectId && { projectId: document.projectId }),
      },
    });

    return document;
  } catch (error) {
    /*
     * Multer has already written the file to disk before
     * the service runs. If validation fails we must
     * remove it, otherwise rejected uploads (for example
     * a foreign projectId) silently accumulate orphan
     * files on the server.
     */
    await fs.unlink(file.path).catch(() => { });

    throw error;
  }
};

// -----------------------------------------------------
// Get Documents
// -----------------------------------------------------
const getDocuments = async (
  userId,
  {
    search = "",
    projectId,
    status,
    sort = "updatedAt",
    order = "desc",
  } = {}
) => {
  const query = { userId };

  if (projectId) {
    query.projectId = projectId;
  }

  if (
    status &&
    [
      "Uploaded",
      "Extracting",
      "Chunking",
      "Ready",
      "Failed",
    ].includes(status)
  ) {
    query.processingStatus = status;
  }

  if (search.trim()) {
    const term = search.trim();

    query.$or = [
      {
        title: {
          $regex: term,
          $options: "i",
        },
      },
      {
        originalFileName: {
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
    "uploadedAt",
    "updatedAt",
    "title",
    "fileSize",
  ];

  const sortField = allowedSort.includes(sort)
    ? sort
    : "updatedAt";

  return UploadedDocument.find(query)
    .populate("projectId", "title")
    .sort({
      [sortField]: order === "asc" ? 1 : -1,
    })
    .lean();
};

// -----------------------------------------------------
// Get Single Document
// -----------------------------------------------------
const getDocumentById = async (userId, documentId) => {
  assertValidId(documentId);

  const document = await UploadedDocument.findOne({
    _id: documentId,
    userId,
  })
    .populate("projectId", "title")
    .lean();

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return document;
};

// -----------------------------------------------------
// Resolve a document's file for a secure download
// -----------------------------------------------------
/*
 * Ownership is enforced by the userId filter: a caller can
 * only ever resolve a file that belongs to them. The path
 * is read from MongoDB and never from the request, so the
 * storage layout is not user-controllable.
 *
 * A missing file on disk is reported as 404 rather than
 * surfacing as an unhandled ENOENT (which would be a 500).
 * A foreign document is also a 404, never a 403: the
 * caller learns nothing about whether the id exists.
 */
const getDocumentForDownload = async (
  userId,
  documentId
) => {
  assertValidId(documentId);

  const document = await UploadedDocument.findOne({
    _id: documentId,
    userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  try {
    await fs.access(document.storagePath);
  } catch {
    throw new ApiError(404, "Document file is unavailable.");
  }

  return document;
};

// -----------------------------------------------------
// Update Document
// -----------------------------------------------------
/*
 * Only user-editable metadata is accepted. Everything
 * else on the document (originalName, storedName,
 * storagePath, mimeType, fileSize, processingStatus,
 * chunkCount, fileHash, userId) is server-owned and is
 * ignored even if it is present in the request body.
 */
const EDITABLE_FIELDS = ["title", "description", "projectId"];

const updateDocument = async (
  userId,
  documentId,
  data
) => {
  assertValidId(documentId);

  const document = await UploadedDocument.findOne({
    _id: documentId,
    userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  /*
   * Compare against undefined, not truthiness.
   *
   * An explicit null means "detach from its project",
   * which is a legitimate edit. Testing `if (data.projectId)`
   * would skip validation entirely and make unlinking
   * impossible to perform.
   */
  if (data.projectId !== undefined) {
    await validateProject(userId, data.projectId);

    document.projectId = data.projectId || null;
  }

  if (data.title !== undefined) {
    const title = String(data.title).trim();

    if (!title) {
      throw new ApiError(400, "Document title is required.");
    }

    document.title = title;
  }

  if (data.description !== undefined) {
    document.description = String(data.description).trim();
  }

  await document.save();

  return document;
};

// -----------------------------------------------------
// Delete Document
// -----------------------------------------------------
const deleteDocument = async (userId, documentId) => {
  assertValidId(documentId);

  const document = await UploadedDocument.findOne({
    _id: documentId,
    userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  /*
   * Chunk rows are derived data owned by the document, so
   * they are removed with it. Nothing writes chunks yet
   * (that arrives in 8G), but the lifecycle is established
   * now so deletion stays correct once they exist.
   */
  await RecordChunk.deleteMany({
    documentId: document._id,
  });

  /*
   * Remove the document from every collection that
   * references it, otherwise Collection.documentIds
   * would keep dangling ids pointing at a deleted
   * document. The collection itself survives: it is only
   * organization.
   */
  await Collection.updateMany(
    {
      userId,
      documentIds: document._id,
    },
    {
      $pull: {
        documentIds: document._id,
      },
    }
  );

  /*
   * Notes are user-authored content, so they survive
   * the deletion of the document they referenced. Only
   * the reference is cleared.
   */
  await Note.updateMany(
    {
      userId,
      documentId: document._id,
    },
    {
      $set: {
        documentId: null,
      },
    }
  );

  /*
   * Remove the file from disk. A missing file is not an
   * error: the record should still be deletable if the
   * bytes were already removed.
   */
  if (document.storagePath) {
    await fs.unlink(document.storagePath).catch((error) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });
  }

  await document.deleteOne();

  return document;
};

module.exports = {
  validateProject,

  createDocument,
  getDocuments,
  getDocumentById,
  getDocumentForDownload,
  updateDocument,
  deleteDocument,

  calculateFileHash,
};