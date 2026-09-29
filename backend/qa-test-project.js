/*
 * Test project service activity recording
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { createProject } = require("./services/projectService");

connectDB();

setTimeout(async () => {
  try {
    const userId = new mongoose.Types.ObjectId();
    const project = await createProject(userId, {
      title: "Test Project Activity",
      description: "test",
    });
    console.log("Project created:", project);
  } catch (error) {
    console.error("Project creation failed:", error.message);
    console.error(error.stack);
  }
  
  setTimeout(() => process.exit(0), 1000);
}, 2000);