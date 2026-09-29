const mongoose = require("mongoose");

const ResearchProject = require("../models/ResearchProject");
const Paper = require("../models/Paper");
const Note = require("../models/Note");
const UploadedDocument = require("../models/UploadedDocument");
const ApiError = require("../utils/ApiError");
const { recordActivity, ACTIVITY_ACTIONS } = require("./activityService");

// -----------------------------------------------------
// Create Project
// -----------------------------------------------------
const createProject = async (userId, projectData) => {
  const existingProject = await ResearchProject.findOne({
    userId,
    title: projectData.title.trim(),
  });

  if (existingProject) {
    throw new ApiError(
      409,
      "A project with this title already exists."
    );
  }

  const project = await ResearchProject.create({
    userId,
    title: projectData.title.trim(),
    description: projectData.description?.trim() || "",
    researchQuestion: projectData.researchQuestion?.trim() || "",
    status: projectData.status || "Active",
  });

  await recordActivity({
    userId,
    projectId: project._id,
    action: ACTIVITY_ACTIONS.PROJECT_CREATED,
    entityType: "project",
    entityId: project._id,
    metadata: {
      title: project.title,
    },
  });

  return project;
};

// -----------------------------------------------------
// Get All Projects
// -----------------------------------------------------
const getProjects = async (userId, options = {}) => {
  const {
    search = "",
    status = "",
    sort = "updatedAt",
    order = "desc",
  } = options;

  const query = {
    userId,
  };

  if (status && ["Active", "Completed", "Archived"].includes(status)) {
    query.status = status;
  }

  if (search.trim()) {
    query.$or = [
      {
        title: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        description: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        researchQuestion: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "title",
    "status",
  ];

  const sortField = allowedSortFields.includes(sort)
    ? sort
    : "updatedAt";

  const sortOrder = order === "asc" ? 1 : -1;

  const projects = await ResearchProject.find(query)
    .sort({
      [sortField]: sortOrder,
    })
    .lean();

  /*
   * Attach a real document count.
   *
   * ResearchProject.documentIds is no longer written to:
   * UploadedDocument.projectId is the canonical
   * relationship (a document belongs to at most one
   * project). Reading documentIds here would always
   * report 0, so the count is resolved from the
   * UploadedDocument collection instead.
   *
   * One grouped aggregation for the whole page keeps this
   * to a single extra query rather than one per card.
   */
  if (projects.length) {
    const counts = await UploadedDocument.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(
            String(userId)
          ),
          projectId: {
            $in: projects.map(
              (project) => project._id
            ),
          },
        },
      },
      {
        $group: {
          _id: "$projectId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countByProject = new Map(
      counts.map((entry) => [
        String(entry._id),
        entry.count,
      ])
    );

    projects.forEach((project) => {
      project.documentCount =
        countByProject.get(String(project._id)) || 0;
    });
  }

  return projects;
};

// -----------------------------------------------------
// Get Single Project
// -----------------------------------------------------
const getProjectById = async (userId, projectId) => {
  const project = await ResearchProject.findOne({
    _id: projectId,
    userId,
  }).lean();

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  return project;
};

// -----------------------------------------------------
// Update Project
// -----------------------------------------------------
const updateProject = async (userId, projectId, updateData) => {
  const project = await ResearchProject.findOne({
    _id: projectId,
    userId,
  });

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  if (updateData.title !== undefined) {
    const title = updateData.title.trim();

    const duplicate = await ResearchProject.findOne({
      userId,
      title,
      _id: {
        $ne: projectId,
      },
    });

    if (duplicate) {
      throw new ApiError(
        409,
        "A project with this title already exists."
      );
    }

    project.title = title;
  }

  if (updateData.description !== undefined) {
    project.description = updateData.description.trim();
  }

  if (updateData.researchQuestion !== undefined) {
    project.researchQuestion =
      updateData.researchQuestion.trim();
  }

  if (updateData.status !== undefined) {
    const validStatuses = [
      "Active",
      "Completed",
      "Archived",
    ];

    if (!validStatuses.includes(updateData.status)) {
      throw new ApiError(400, "Invalid project status.");
    }

    project.status = updateData.status;
  }

  await project.save();

  await recordActivity({
    userId,
    projectId: project._id,
    action: ACTIVITY_ACTIONS.PROJECT_UPDATED,
    entityType: "project",
    entityId: project._id,
    metadata: {
      title: project.title,
    },
  });

  return project;
};

// -----------------------------------------------------
// Delete Project
// -----------------------------------------------------
const deleteProject = async (userId, projectId) => {
  const project = await ResearchProject.findOne({
    _id: projectId,
    userId,
  });

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  /*
   * Notes are user-authored content, so they are never
   * deleted along with a project. Only the reference is
   * cleared, leaving the note intact as a general note.
   */
  await Note.updateMany(
    {
      userId,
      projectId: project._id,
    },
    {
      $set: {
        projectId: null,
      },
    }
  );

  /*
   * Same rule for documents: the uploaded file is the
   * user's research material and outlives the project it
   * was filed under. Detach it rather than delete it.
   */
  await UploadedDocument.updateMany(
    {
      userId,
      projectId: project._id,
    },
    {
      $set: {
        projectId: null,
      },
    }
  );

  await project.deleteOne();

  return project;
};

// -----------------------------------------------------
// Attach Paper to Project
// -----------------------------------------------------
const addPaperToProject = async (
  userId,
  projectId,
  paperId
) => {
  /*
   * Both resources are scoped to userId. A paper or
   * project owned by someone else simply does not
   * resolve, so it can never be attached: ownership
   * is enforced by the query, not by a later check.
   */
  const [project, paper] = await Promise.all([
    ResearchProject.findOne({
      _id: projectId,
      userId,
    }),

    Paper.findOne({
      _id: paperId,
      userId,
    }),
  ]);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  if (!paper) {
    throw new ApiError(404, "Paper not found.");
  }

  const alreadyAttached = project.paperIds.some(
    (id) => id.toString() === paper._id.toString()
  );

  if (alreadyAttached) {
    throw new ApiError(
      409,
      "Paper is already attached to this project."
    );
  }

  project.paperIds.push(paper._id);

  await project.save();

  await recordActivity({
    userId,
    projectId: project._id,
    action: ACTIVITY_ACTIONS.PAPER_ADDED_TO_PROJECT,
    entityType: "paper",
    entityId: paper._id,
    metadata: {
      title: paper.title,
      projectTitle: project.title,
    },
  });

  return project;
};

// -----------------------------------------------------
// Detach Paper from Project
// -----------------------------------------------------
const removePaperFromProject = async (
  userId,
  projectId,
  paperId
) => {
  const project = await ResearchProject.findOne({
    _id: projectId,
    userId,
  });

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  const attached = project.paperIds.some(
    (id) => id.toString() === paperId.toString()
  );

  if (!attached) {
    throw new ApiError(
      404,
      "Paper is not attached to this project."
    );
  }

  project.paperIds.pull(paperId);

  await project.save();

  await recordActivity({
    userId,
    projectId: project._id,
    action: ACTIVITY_ACTIONS.PAPER_REMOVED_FROM_PROJECT,
    entityType: "paper",
    entityId: paperId,
    metadata: {
      projectTitle: project.title,
    },
  });

  return project;
};

// -----------------------------------------------------
// Get Papers Attached to a Project
// -----------------------------------------------------
const getProjectPapers = async (
  userId,
  projectId
) => {
  const project = await ResearchProject.findOne({
    _id: projectId,
    userId,
  })
    .populate({
      path: "paperIds",
      match: {
        userId,
      },
    })
    .lean();

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  /*
   * `populate` yields null for any id that no longer
   * matches (e.g. a paper removed directly from the
   * database). Filter those out so callers never get
   * null entries.
   */
  return (project.paperIds || []).filter(Boolean);
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,

  addPaperToProject,
  removePaperFromProject,
  getProjectPapers,
};