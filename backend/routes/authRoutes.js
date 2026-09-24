const express = require("express");

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const verifyToken = require("../middleware/auth");

const router = express.Router();


// Public routes

router.post("/register", register);

router.post("/login", login);


// Protected routes

router.get("/me", verifyToken, getMe);

router.post("/logout", verifyToken, logout);


module.exports = router;