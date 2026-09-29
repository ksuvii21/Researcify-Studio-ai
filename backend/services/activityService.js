const Activity = require("../models/Activity");
const ResearchProject = require("../models/ResearchProject");
const ACTIVITY_ACTIONS = require("../constants/activityActions");

const recordActivity = async ({
  userId,
  projectId = null,
  action,
  entityType,
  entityId,
  metadata = {},
}) => {
  try {
    return await Activity.create({
      userId,
      projectId,
      action,
      entityType,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error("[Activity] Failed to record:", error.message);
    return null;
  }
};

const getActivities = async (userId, filters = {}) => {
  const {
    projectId,
    entityType,
    action,
    page = 1,
    limit = 20,
  } = filters;

  const query = { userId };

  if (projectId) {
    const ownsProject = await ResearchProject.exists({
      _id: projectId,
      userId,
    });

    if (!ownsProject) {
      return {
        activities: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      };
    }

    query.projectId = projectId;
  }

  if (entityType) {
    query.entityType = entityType;
  }

  if (action) {
    query.action = action;
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [activities, total] = await Promise.all([
    Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Activity.countDocuments(query),
  ]);

  return {
    activities,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

module.exports = {
  recordActivity,
  getActivities,
  ACTIVITY_ACTIONS,
};