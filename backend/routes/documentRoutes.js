const express = require("express");
const multer = require("multer");

const {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
} = require("../controllers/documentController");

const documentUpload = require("../config/documentUpload");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Every Documents API requires authentication.
router.use(verifyToken);

/*
 * Multer runs before the controller, so its errors
 * never reach asyncHandler. Translate them here into
 * meaningful status codes instead of letting them fall
 * through as generic 500s.
 */
const handleUpload = (req, res, next) => {
  documentUpload.single("file")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(
          Object.assign(
            new Error(
              "Document exceeds the 10 MB upload limit."
            ),
            { statusCode: 413 }
          )
        );
      }

      return next(
        Object.assign(
          new Error(`Upload failed: ${error.message}`),
          { statusCode: 400 }
        )
      );
    }

    if (error.code === "INVALID_FILE_TYPE") {
      return next(
        Object.assign(
          new Error(
            "Only PDF, DOCX and TXT files are supported."
          ),
          { statusCode: 400 }
        )
      );
    }

    return next(error);
  });
};

router
  .route("/")
  .get(getDocuments)
  .post(handleUpload, createDocument);

/*
 * /:id/download is declared before /:id so the literal
 * "download" segment is never captured as an :id value.
 */
router.get("/:id/download", downloadDocument);

router
  .route("/:id")
  .get(getDocumentById)
  .patch(updateDocument)
  .delete(deleteDocument);

module.exports = router;