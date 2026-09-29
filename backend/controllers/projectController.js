const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const projectService = require("../services/projectService");

/*
 * The JWT payload is { id: userId } (see
 * authController.generateToken), which is what
 * req.user.id resolves to after verifyToken.
 */
const getUserId = (req) => req.user?.id || req.user?._id;

// -----------------------------------------------------
// Create Project
// POST /api/projects
// -----------------------------------------------------
exports.createProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    researchQuestion,
    status,
  } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, "Project title is required.");
  }

  const project = await projectService.createProject(
    getUserId(req),
    {
      title,
      description,
      researchQuestion,
      status,
    }
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        project,
        "Project created successfully."
      )
    );
});

// -----------------------------------------------------
// Get Projects
// GET /api/projects
// -----------------------------------------------------
exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjects(
    getUserId(req),
    {
      search: req.query.search,
      status: req.query.status,
      sort: req.query.sort,
      order: req.query.order,
    }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projects,
        "Projects fetched successfully."
      )
    );
});

// -----------------------------------------------------
// Get Project
// GET /api/projects/:id
// -----------------------------------------------------
exports.getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(
    getUserId(req),
    req.params.id
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        project,
        "Project fetched successfully."
      )
    );
});

// -----------------------------------------------------
// Update Project
// PATCH /api/projects/:id
// -----------------------------------------------------
exports.updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(
    getUserId(req),
    req.params.id,
    req.body
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        project,
        "Project updated successfully."
      )
    );
});

// -----------------------------------------------------
// Get Project Papers
// GET /api/v1/projects/:id/papers
// -----------------------------------------------------
exports.getProjectPapers = asyncHandler(
  async (req, res) => {
    const papers =
      await projectService.getProjectPapers(
        getUserId(req),
        req.params.id
      );

    res.status(200).json(
      new ApiResponse(
        200,
        papers,
        "Project papers fetched successfully."
      )
    );
  }
);

// -----------------------------------------------------
// Attach Paper to Project
// POST /api/v1/projects/:id/papers
// -----------------------------------------------------
exports.addPaperToProject = asyncHandler(
  async (req, res) => {
    const { paperId } = req.body;

    if (!paperId) {
      throw new ApiError(400, "Paper ID is required.");
    }

    const project =
      await projectService.addPaperToProject(
        getUserId(req),
        req.params.id,
        paperId
      );

    res.status(200).json(
      new ApiResponse(
        200,
        project,
        "Paper added to project successfully."
      )
    );
  }
);

// -----------------------------------------------------
// Detach Paper from Project
// DELETE /api/v1/projects/:id/papers/:paperId
// -----------------------------------------------------
exports.removePaperFromProject = asyncHandler(
  async (req, res) => {
    await projectService.removePaperFromProject(
      getUserId(req),
      req.params.id,
      req.params.paperId
    );

    res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Paper removed from project successfully."
      )
    );
  }
);

// -----------------------------------------------------
// Delete Project
// DELETE /api/projects/:id
// -----------------------------------------------------
exports.deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(
    getUserId(req),
    req.params.id
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Project deleted successfully."
      )
    );
});