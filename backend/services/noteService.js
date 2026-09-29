const Note = require("../models/Note");
const Paper = require("../models/Paper");
const ResearchProject = require("../models/ResearchProject");

const ApiError = require("../utils/ApiError");
const { recordActivity, ACTIVITY_ACTIONS } = require("./activityService");

// -----------------------------------------------------
// Relationship validation
// -----------------------------------------------------
/*
 * A note may reference a project, a paper, both or
 * neither. Whenever a reference is supplied it must
 * resolve against the authenticated user, otherwise a
 * caller could attach a note to someone else's project
 * or paper simply by knowing the id.
 *
 * Used by both createNote and updateNote.
 */
const validateRelationships = async (
  userId,
  { projectId, paperId }
) => {
  if (projectId) {
    const project = await ResearchProject.exists({
      _id: projectId,
      userId,
    });

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }
  }

  if (paperId) {
    const paper = await Paper.exists({
      _id: paperId,
      userId,
    });

    if (!paper) {
      throw new ApiError(404, "Paper not found.");
    }
  }
};

// -----------------------------------------------------
// Normalise tag input
// -----------------------------------------------------
const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

// -----------------------------------------------------
// Create Note
// -----------------------------------------------------
const createNote = async (userId, data) => {
  await validateRelationships(userId, {
    projectId: data.projectId,
    paperId: data.paperId,
  });

  return Note.create({
    userId,

    projectId: data.projectId || null,

    paperId: data.paperId || null,

    title:
      data.title?.trim() || "Untitled Note",

    content: data.content || "",

    tags: toStringArray(data.tags),

    isPinned: Boolean(data.isPinned),

    isArchived: Boolean(data.isArchived),
  }).then(async (note) => {
    await recordActivity({
      userId,
      projectId: note.projectId || null,
      action: ACTIVITY_ACTIONS.NOTE_CREATED,
      entityType: "note",
      entityId: note._id,
      metadata: {
        title: note.title,
        ...(note.projectId && { projectId: note.projectId }),
        ...(note.paperId && { paperId: note.paperId }),
      },
    });
    return note;
  });
};

// -----------------------------------------------------
// Get Notes
// -----------------------------------------------------
/*
 * One endpoint powers the Notes workspace, Project
 * Notes, Paper Notes and the dashboard:
 *
 *   getNotes(userId)                        -> all
 *   getNotes(userId, { projectId })         -> project
 *   getNotes(userId, { paperId })           -> paper
 */
const getNotes = async (
  userId,
  {
    search = "",
    projectId,
    paperId,
    pinned,
    archived = "false",
    sort = "updatedAt",
    order = "desc",
  } = {}
) => {
  const query = {
    userId,
  };

  if (projectId) {
    query.projectId = projectId;
  }

  if (paperId) {
    query.paperId = paperId;
  }

  if (pinned === "true") {
    query.isPinned = true;
  }

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
        title: {
          $regex: term,
          $options: "i",
        },
      },
      {
        content: {
          $regex: term,
          $options: "i",
        },
      },
      {
        tags: {
          $regex: term,
          $options: "i",
        },
      },
    ];
  }

  const allowedSort = [
    "createdAt",
    "updatedAt",
    "title",
  ];

  const sortField = allowedSort.includes(sort)
    ? sort
    : "updatedAt";

  return Note.find(query)
    .sort({
      // Pinned notes always float to the top.
      isPinned: -1,
      [sortField]: order === "asc" ? 1 : -1,
    })
    /*
     * Populate only the display fields the UI needs.
     * Without this the client would have to infer a
     * project or paper title from a raw id.
     */
    .populate("projectId", "title")
    .populate("paperId", "title authors")
    .lean();
};

// -----------------------------------------------------
// Get Single Note
// -----------------------------------------------------
const getNoteById = async (userId, noteId) => {
  const note = await Note.findOne({
    _id: noteId,
    userId,
  })
    .populate("projectId", "title")
    .populate("paperId", "title authors")
    .lean();

  if (!note) {
    throw new ApiError(404, "Note not found.");
  }

  return note;
};

// -----------------------------------------------------
// Update Note
// -----------------------------------------------------
const updateNote = async (userId, noteId, data) => {
  const note = await Note.findOne({
    _id: noteId,
    userId,
  });

  if (!note) {
    throw new ApiError(404, "Note not found.");
  }

  /*
   * Resolve the relationships the note would end up
   * with. An explicit null unlinks the note, so
   * validation only runs for the references that will
   * actually be set.
   */
  const nextProjectId =
    data.projectId !== undefined
      ? data.projectId
      : note.projectId;

  const nextPaperId =
    data.paperId !== undefined
      ? data.paperId
      : note.paperId;

  await validateRelationships(userId, {
    projectId: nextProjectId,
    paperId: nextPaperId,
  });

  if (data.title !== undefined) {
    note.title =
      data.title.trim() || "Untitled Note";
  }

  if (data.content !== undefined) {
    note.content = data.content;
  }

  if (data.tags !== undefined) {
    note.tags = toStringArray(data.tags);
  }

  if (data.projectId !== undefined) {
    note.projectId = data.projectId || null;
  }

  if (data.paperId !== undefined) {
    note.paperId = data.paperId || null;
  }

  if (data.isPinned !== undefined) {
    note.isPinned = Boolean(data.isPinned);
  }

  if (data.isArchived !== undefined) {
    note.isArchived = Boolean(data.isArchived);
  }

  await note.save();

  return note;
};

// -----------------------------------------------------
// Delete Note
// -----------------------------------------------------
const deleteNote = async (userId, noteId) => {
  const note = await Note.findOne({
    _id: noteId,
    userId,
  });

  if (!note) {
    throw new ApiError(404, "Note not found.");
  }

  await note.deleteOne();

  return note;
};

module.exports = {
  validateRelationships,

  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};