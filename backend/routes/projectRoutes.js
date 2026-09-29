const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectPapers,
  addPaperToProject,
  removePaperFromProject,
} = require("../controllers/projectController");

const verifyToken = require("../middleware/auth");

const router = express.Router();

// Every Projects API requires authentication.
router.use(verifyToken);

router
  .route("/")
  .get(getProjects)
  .post(createProject);

/*
 * Relationship routes are declared before the generic
 * "/:id" handlers. They use distinct paths, so there
 * is no ambiguity, but keeping them grouped makes the
 * paper relationship explicit.
 */
router
  .route("/:id/papers")
  .get(getProjectPapers)
  .post(addPaperToProject);

router.delete(
  "/:id/papers/:paperId",
  removePaperFromProject
);

router
  .route("/:id")
  .get(getProjectById)
  .patch(updateProject)
  .delete(deleteProject);

module.exports = router;