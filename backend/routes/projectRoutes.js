const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const verifyToken = require("../middleware/auth");

const router = express.Router();

// Every Projects API requires authentication.
router.use(verifyToken);

router
  .route("/")
  .get(getProjects)
  .post(createProject);

router
  .route("/:id")
  .get(getProjectById)
  .patch(updateProject)
  .delete(deleteProject);

module.exports = router;