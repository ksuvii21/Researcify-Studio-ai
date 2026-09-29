const express = require("express");
const router = express.Router();
const { getActivities } = require("../controllers/activityController");
const verifyToken = require("../middleware/auth");

router.get("/", verifyToken, getActivities);

module.exports = router;