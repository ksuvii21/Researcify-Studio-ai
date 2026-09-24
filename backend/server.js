require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const paperRoutes = require("./routes/paperRoutes");

const app = express();

const PORT = process.env.PORT || 5000;


// ================================
// DATABASE
// ================================

connectDB();


// ================================
// GLOBAL MIDDLEWARE
// ================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ================================
// HEALTH ROUTES
// ================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Researcify Studio API",
  });
});


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Researcify Studio API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});


// ================================
// API ROUTES
// ================================

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1", paperRoutes);


// ================================
// START SERVER
// ================================

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});