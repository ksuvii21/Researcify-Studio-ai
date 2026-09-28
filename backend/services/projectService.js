const ResearchProject = require("../models/ResearchProject");
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

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};