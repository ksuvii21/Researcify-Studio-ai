/*
 * Check Activity collection
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Activity = require("./models/Activity");

connectDB();

setTimeout(async () => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(10).lean();
    console.log("Recent activities:", JSON.stringify(activities, null, 2));
  } catch (error) {
    console.error("Query failed:", error.message);
    console.error(error.stack);
  }
  
  setTimeout(() => process.exit(0), 1000);
}, 2000);