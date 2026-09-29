const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const { getActivities } = require("../services/activityService");

const getActivitiesController = asyncHandler(async (req, res) => {
  const result = await getActivities(req.user._id, req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Activities fetched successfully."
      )
    );
});

module.exports = {
  getActivities: getActivitiesController,
};