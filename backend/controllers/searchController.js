const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const { search } = require("../services/searchService");

const searchController = asyncHandler(async (req, res) => {
  const { q, limit } = req.query;

  const result = await search(req.user._id, q, limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Search completed successfully."
      )
    );
});

module.exports = { search: searchController };