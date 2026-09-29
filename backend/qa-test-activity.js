/*
 * Direct Activity model test
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Activity = require("./models/Activity");

connectDB();

setTimeout(async () => {
  try {
    const activity = await Activity.create({
      userId: new mongoose.Types.ObjectId(),
      projectId: null,
      action: "test.action",
      entityType: "project",
      entityId: new mongoose.Types.ObjectId(),
      metadata: { title: "Test" },
    });
    console.log("Activity created:", activity);
  } catch (error) {
    console.error("Activity creation failed:", error.message);
    console.error(error.stack);
  }
  
  setTimeout(() => process.exit(0), 1000);
}, 2000);