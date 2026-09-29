const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const documentService = require("../services/documentService");

/*
 * The JWT payload is { id: userId } (see
 * authController.generateToken), which is what
 * req.user.id resolves to after verifyToken.
 */
const getUserId = (req) => req.user?.id || req.user?._id;

// -----------------------------------------------------
// Get Documents
// GET /api/v1/documents
// -----------------------------------------------------
exports.getDocuments = asyncHandler(async (req, res) => {
  const documents = await documentService.getDocuments(
    getUserId(req),
    {
      search: req.query.search,
      projectId: req.query.projectId,
      status: req.query.status,
      sort: req.query.sort,
      order: req.query.order,
    }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      documents,
      "Documents fetched successfully."
    )
  );
});

// -----------------------------------------------------
// Get Single Document
// GET /api/v1/documents/:id
// -----------------------------------------------------
exports.getDocumentById = asyncHandler(
  async (req, res) => {
    const document =
      await documentService.getDocumentById(
        getUserId(req),
        req.params.id
      );

    res.status(200).json(
      new ApiResponse(
        200,
        document,
        "Document fetched successfully."
      )
    );
  }
);

// -----------------------------------------------------
// Create Document (multipart upload)
// POST /api/v1/documents
// -----------------------------------------------------
exports.createDocument = asyncHandler(async (req, res) => {
  /*
   * The file arrives via multer.single("file") before
   * this handler runs, so a missing file means the
   * request was not a valid upload.
   */
  if (!req.file) {
    throw new ApiError(
      400,
      "Document file is required. Use the 'file' field."
    );
  }

  const document = await documentService.createDocument(
    getUserId(req),
    req.file,
    {
      title: req.body.title,
      description: req.body.description,
      projectId: req.body.projectId,
    }
  );

  res.status(201).json(
    new ApiResponse(
      201,
      document,
      "Document uploaded successfully."
    )
  );
});

// -----------------------------------------------------
// Update Document
// PATCH /api/v1/documents/:id
// -----------------------------------------------------
exports.updateDocument = asyncHandler(async (req, res) => {
  const document = await documentService.updateDocument(
    getUserId(req),
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      document,
      "Document updated successfully."
    )
  );
});

// -----------------------------------------------------
// Delete Document
// DELETE /api/v1/documents/:id
// -----------------------------------------------------
exports.deleteDocument = asyncHandler(async (req, res) => {
  await documentService.deleteDocument(
    getUserId(req),
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Document deleted successfully."
    )
  );
});

// -----------------------------------------------------
// Download Document
// GET /api/v1/documents/:id/download
// -----------------------------------------------------
/*
 * Streams the stored file to its authenticated owner.
 *
 * getDocumentForDownload enforces ownership (the query is
 * scoped to userId) and 404s on anything the caller does
 * not own, so a foreign id never reaches res.download. The
 * on-disk path is read from MongoDB, never from the
 * request, so the storage layout is not attacker-
 * controllable.
 */
exports.downloadDocument = asyncHandler(
  async (req, res, next) => {
    const document =
      await documentService.getDocumentForDownload(
        getUserId(req),
        req.params.id
      );

    res.set({
      "X-Content-Type-Options": "nosniff",
    });

    /*
     * The download name is the original filename the user
     * uploaded, not the generated name on disk.
     */
    res.download(
      document.storagePath,
      document.originalFileName,
      (err) => {
        if (!err) return;

        /*
         * The file was present at access() time but has
         * gone since. Report it the same way rather than
         * leaking a 500.
         */
        if (err.code === "ENOENT") {
          return next(
            new ApiError(
              404,
              "Document file is unavailable."
            )
          );
        }

        return next(err);
      }
    );
  }
);