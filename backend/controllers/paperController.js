//Axios is a popular, open-source JavaScript library used to
//make HTTP requests from web browsers or 
// Node.js environments.
const axios = require("axios");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const paperService = require("../services/paperService");

/*
 * The JWT payload is { id: userId } (see
 * authController.generateToken), which is what
 * req.user.id resolves to after verifyToken.
 */
const getUserId = (req) => req.user?.id || req.user?._id;

// -----------------------------------------------------
// Normalise a CrossRef work into our Paper shape
// -----------------------------------------------------
const normalizeCrossRefWork = (item) => ({
  title: item.title ? item.title[0] : "No Title Available",

  authors: item.author
    ? item.author
        .map((a) =>
          `${a.given || ""} ${a.family || ""}`.trim()
        )
        .filter(Boolean)
    : [],

  abstract: item.abstract || "",

  year: item.published?.["date-parts"]?.[0]?.[0] || null,

  journal: item["container-title"]?.[0] || "",

  doi: item.DOI || "",

  url: item.URL || "",

  source: "CrossRef",

  externalId: item.DOI || item.URL || null,
});

// -----------------------------------------------------
// Search Papers (external)
// GET /api/v1/papers/search?q=
// -----------------------------------------------------
exports.searchPapers = asyncHandler(async (req, res) => {
  const query = req.query.q;

  if (!query || !query.trim()) {
    throw new ApiError(400, "Search query is required.");
  }

  const response = await axios.get(
    "https://api.crossref.org/works",
    {
      params: {
        query: query.trim(),
        rows: 10,
      },
      timeout: 15000,
    }
  );

  const papers = (
    response.data?.message?.items || []
  ).map(normalizeCrossRefWork);

  res.status(200).json(
    new ApiResponse(
      200,
      { papers },
      "Papers retrieved and normalized successfully."
    )
  );
});

// -----------------------------------------------------
// Get All Saved Papers
// GET /api/v1/papers
// -----------------------------------------------------
exports.getPapers = asyncHandler(async (req, res) => {
  const papers = await paperService.getPapers(
    getUserId(req),
    {
      search: req.query.search,
      sort: req.query.sort,
      order: req.query.order,
      favorite: req.query.favorite,
    }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      papers,
      "Papers fetched successfully."
    )
  );
});

// -----------------------------------------------------
// Get Single Saved Paper
// GET /api/v1/papers/:id
// -----------------------------------------------------
exports.getPaperById = asyncHandler(async (req, res) => {
  const paper = await paperService.getPaperById(
    getUserId(req),
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      paper,
      "Paper fetched successfully."
    )
  );
});

// -----------------------------------------------------
// Create Paper
// POST /api/v1/papers
// -----------------------------------------------------
exports.createPaper = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, "Paper title is required.");
  }

  const paper = await paperService.createPaper(
    getUserId(req),
    req.body
  );

  res.status(201).json(
    new ApiResponse(
      201,
      paper,
      "Paper saved successfully."
    )
  );
});

// -----------------------------------------------------
// Update Paper
// PATCH /api/v1/papers/:id
// -----------------------------------------------------
exports.updatePaper = asyncHandler(async (req, res) => {
  const paper = await paperService.updatePaper(
    getUserId(req),
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      paper,
      "Paper updated successfully."
    )
  );
});

// -----------------------------------------------------
// Delete Paper
// DELETE /api/v1/papers/:id
// -----------------------------------------------------
exports.deletePaper = asyncHandler(async (req, res) => {
  await paperService.deletePaper(
    getUserId(req),
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(200, null, "Paper deleted successfully.")
  );
});

// -----------------------------------------------------
// Toggle Favorite
// PATCH /api/v1/papers/:id/favorite
// -----------------------------------------------------
exports.toggleFavorite = asyncHandler(
  async (req, res) => {
    const paper = await paperService.getPaperById(
      getUserId(req),
      req.params.id
    );

    const updated = await paperService.updatePaper(
      getUserId(req),
      req.params.id,
      {
        isFavorite: !paper.isFavorite,
      }
    );

    res.status(200).json(
      new ApiResponse(
        200,
        updated,
        updated.isFavorite
          ? "Paper added to favorites."
          : "Paper removed from favorites."
      )
    );
  }
);
