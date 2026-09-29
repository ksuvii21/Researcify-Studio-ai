const Paper = require("../models/Paper");
const ResearchProject = require("../models/ResearchProject");
const Note = require("../models/Note");
const Collection = require("../models/Collection");
const ApiError = require("../utils/ApiError");
const { recordActivity, ACTIVITY_ACTIONS } = require("./activityService");

// -----------------------------------------------------
// Normalise array-ish input
// -----------------------------------------------------
const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

// -----------------------------------------------------
// Normalise a DOI
// -----------------------------------------------------
/*
 * DOIs are case-insensitive, so "10.1234/ABC" and
 * "10.1234/abc" refer to the same paper. Storing a
 * single canonical form keeps per-user duplicate
 * detection reliable.
 */
const normalizeDoi = (doi) =>
  (doi || "").trim().toLowerCase();

// -----------------------------------------------------
// Create Paper
// -----------------------------------------------------
const createPaper = async (userId, data) => {
  const doi = normalizeDoi(data.doi);

  /*
   * Duplicate prevention is per-user, not global:
   * two different users may save the same paper.
   */
  if (doi) {
    const duplicate = await Paper.findOne({
      userId,
      doi,
    });

    if (duplicate) {
      throw new ApiError(
        409,
        "This paper is already in your library."
      );
    }
  }

  return Paper.create({
    userId,

    title: data.title.trim(),

    authors: toStringArray(data.authors),

    abstract: data.abstract?.trim() || "",

    year: data.year || null,

    journal: data.journal?.trim() || "",

    doi,

    url: data.url?.trim() || "",

    source: data.source?.trim() || "Manual",

    keywords: toStringArray(data.keywords),

    citationCount: Number(data.citationCount) || 0,

    pdfUrl: data.pdfUrl?.trim() || null,

    externalId: data.externalId?.trim() || null,

    isFavorite: Boolean(data.isFavorite),
  }).then(async (paper) => {
    await recordActivity({
      userId,
      projectId: null,
      action: ACTIVITY_ACTIONS.PAPER_SAVED,
      entityType: "paper",
      entityId: paper._id,
      metadata: {
        title: paper.title,
      },
    });
    return paper;
  });
};

// -----------------------------------------------------
// Get All Papers
// -----------------------------------------------------
const getPapers = async (
  userId,
  {
    search = "",
    sort = "createdAt",
    order = "desc",
    favorite,
  } = {}
) => {
  const query = { userId };

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
        authors: {
          $regex: term,
          $options: "i",
        },
      },
      {
        journal: {
          $regex: term,
          $options: "i",
        },
      },
      {
        keywords: {
          $regex: term,
          $options: "i",
        },
      },
    ];
  }

  if (favorite === "true") {
    query.isFavorite = true;
  }

  const allowedSort = [
    "createdAt",
    "updatedAt",
    "title",
    "year",
  ];

  const sortField = allowedSort.includes(sort)
    ? sort
    : "createdAt";

  return Paper.find(query)
    .sort({
      [sortField]: order === "asc" ? 1 : -1,
    })
    .lean();
};

// -----------------------------------------------------
// Get Single Paper
// -----------------------------------------------------
const getPaperById = async (userId, paperId) => {
  const paper = await Paper.findOne({
    _id: paperId,
    userId,
  }).lean();

  if (!paper) {
    throw new ApiError(404, "Paper not found.");
  }

  return paper;
};

// -----------------------------------------------------
// Update Paper
// -----------------------------------------------------
const updatePaper = async (
  userId,
  paperId,
  data
) => {
  const paper = await Paper.findOne({
    _id: paperId,
    userId,
  });

  if (!paper) {
    throw new ApiError(404, "Paper not found.");
  }

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      throw new ApiError(400, "Paper title is required.");
    }

    paper.title = data.title.trim();
  }

  if (data.authors !== undefined) {
    paper.authors = toStringArray(data.authors);
  }

  if (data.keywords !== undefined) {
    paper.keywords = toStringArray(data.keywords);
  }

  if (data.abstract !== undefined) {
    paper.abstract = data.abstract.trim();
  }

  if (data.year !== undefined) {
    paper.year = data.year || null;
  }

  if (data.journal !== undefined) {
    paper.journal = data.journal.trim();
  }

  if (data.doi !== undefined) {
    paper.doi = normalizeDoi(data.doi);
  }

  if (data.url !== undefined) {
    paper.url = data.url.trim();
  }

  if (data.source !== undefined) {
    paper.source = data.source.trim() || "Manual";
  }

  if (data.citationCount !== undefined) {
    paper.citationCount =
      Number(data.citationCount) || 0;
  }

  if (data.pdfUrl !== undefined) {
    paper.pdfUrl = data.pdfUrl || null;
  }

  if (data.isFavorite !== undefined) {
    paper.isFavorite = Boolean(data.isFavorite);
  }

  await paper.save();

  return paper;
};

// -----------------------------------------------------
// Delete Paper
// -----------------------------------------------------
const deletePaper = async (userId, paperId) => {
  const paper = await Paper.findOne({
    _id: paperId,
    userId,
  });

  if (!paper) {
    throw new ApiError(404, "Paper not found.");
  }

  /*
   * Remove the paper from every project that
   * references it, otherwise ResearchProject.paperIds
   * would keep dangling ids pointing at a deleted
   * paper.
   */
  await ResearchProject.updateMany(
    {
      userId,
      paperIds: paper._id,
    },
    {
      $pull: {
        paperIds: paper._id,
      },
    }
  );

  /*
   * Remove the paper from every collection that
   * references it, otherwise Collection.paperIds would
   * keep dangling ids pointing at a deleted paper. The
   * collection itself survives: it is only organization.
   */
  await Collection.updateMany(
    {
      userId,
      paperIds: paper._id,
    },
    {
      $pull: {
        paperIds: paper._id,
      },
    }
  );

  /*
   * Notes are user-authored content, so they are never
   * deleted along with a paper. Only the reference is
   * cleared, leaving the note intact.
   */
  await Note.updateMany(
    {
      userId,
      paperId: paper._id,
    },
    {
      $set: {
        paperId: null,
      },
    }
  );

  await paper.deleteOne();

  return paper;
};

module.exports = {
  createPaper,
  getPapers,
  getPaperById,
  updatePaper,
  deletePaper,
};