const ResearchProject = require("../models/ResearchProject");
const Paper = require("../models/Paper");
const ApiError = require("../utils/ApiError");

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