const express = require("express");

const {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  togglePin,
  toggleArchive,
  addPaper,
  removePaper,
  addDocument,
  removeDocument,
} = require("../controllers/collectionController");

const verifyToken = require("../middleware/auth");

const router = express.Router();

// Every Collections API requires authentication.
router.use(verifyToken);

router
  .route("/")
  .get(getCollections)
  .post(createCollection);

/*
 * Toggle routes are declared before the generic
 * "/:id" handlers so "pin" and "archive" are never
 * swallowed as an :id value.
 */
router.patch("/:id/pin", togglePin);

router.patch("/:id/archive", toggleArchive);

router
  .route("/:id")
  .get(getCollectionById)
  .patch(updateCollection)
  .delete(deleteCollection);

// Collection-Paper relationships
router
  .route("/:id/papers")
  .post(addPaper);

router.delete("/:id/papers/:paperId", removePaper);

// Collection-Document relationships
router
  .route("/:id/documents")
  .post(addDocument);

router.delete("/:id/documents/:documentId", removeDocument);

module.exports = router;