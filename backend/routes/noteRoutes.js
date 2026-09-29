const express = require("express");

const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
} = require("../controllers/noteController");

const verifyToken = require("../middleware/auth");

const router = express.Router();

// Every Notes API requires authentication.
router.use(verifyToken);

router
  .route("/")
  .get(getNotes)
  .post(createNote);

/*
 * Toggle routes are declared before the generic
 * "/:id" handlers so "pin" and "archive" are never
 * swallowed as an :id value.
 */
router.patch("/:id/pin", togglePin);

router.patch("/:id/archive", toggleArchive);

router
  .route("/:id")
  .get(getNoteById)
  .patch(updateNote)
  .delete(deleteNote);

module.exports = router;