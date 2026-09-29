const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const noteService = require("../services/noteService");

/*
 * The JWT payload is { id: userId } (see
 * authController.generateToken), which is what
 * req.user.id resolves to after verifyToken.
 */
const getUserId = (req) => req.user?.id || req.user?._id;

// -----------------------------------------------------
// Get Notes
// GET /api/v1/notes
// -----------------------------------------------------
exports.getNotes = asyncHandler(async (req, res) => {
  const notes = await noteService.getNotes(
    getUserId(req),
    {
      search: req.query.search,
      projectId: req.query.projectId,
      paperId: req.query.paperId,
      pinned: req.query.pinned,
      archived: req.query.archived,
      sort: req.query.sort,
      order: req.query.order,
    }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      notes,
      "Notes fetched successfully."
    )
  );
});

// -----------------------------------------------------
// Get Single Note
// GET /api/v1/notes/:id
// -----------------------------------------------------
exports.getNoteById = asyncHandler(async (req, res) => {
  const note = await noteService.getNoteById(
    getUserId(req),
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      note,
      "Note fetched successfully."
    )
  );
});

// -----------------------------------------------------
// Create Note
// POST /api/v1/notes
// -----------------------------------------------------
exports.createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  /*
   * A note needs something to say. Either a title or
   * body content is enough, since the model supplies
   * "Untitled Note" as a default title.
   */
  if (
    (!title || !title.trim()) &&
    (!content || !content.trim())
  ) {
    throw new ApiError(
      400,
      "A note needs a title or some content."
    );
  }

  const note = await noteService.createNote(
    getUserId(req),
    req.body
  );

  res.status(201).json(
    new ApiResponse(
      201,
      note,
      "Note created successfully."
    )
  );
});

// -----------------------------------------------------
// Update Note
// PATCH /api/v1/notes/:id
// -----------------------------------------------------
exports.updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(
    getUserId(req),
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      note,
      "Note updated successfully."
    )
  );
});

// -----------------------------------------------------
// Delete Note
// DELETE /api/v1/notes/:id
// -----------------------------------------------------
exports.deleteNote = asyncHandler(async (req, res) => {
  await noteService.deleteNote(
    getUserId(req),
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(200, null, "Note deleted successfully.")
  );
});

// -----------------------------------------------------
// Toggle Pin
// PATCH /api/v1/notes/:id/pin
// -----------------------------------------------------
exports.togglePin = asyncHandler(async (req, res) => {
  const note = await noteService.getNoteById(
    getUserId(req),
    req.params.id
  );

  const updated = await noteService.updateNote(
    getUserId(req),
    req.params.id,
    {
      isPinned: !note.isPinned,
    }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      updated,
      updated.isPinned
        ? "Note pinned."
        : "Note unpinned."
    )
  );
});

// -----------------------------------------------------
// Toggle Archive
// PATCH /api/v1/notes/:id/archive
// -----------------------------------------------------
exports.toggleArchive = asyncHandler(
  async (req, res) => {
    const note = await noteService.getNoteById(
      getUserId(req),
      req.params.id
    );

    const updated = await noteService.updateNote(
      getUserId(req),
      req.params.id,
      {
        isArchived: !note.isArchived,
      }
    );

    res.status(200).json(
      new ApiResponse(
        200,
        updated,
        updated.isArchived
          ? "Note archived."
          : "Note unarchived."
      )
    );
  }
);