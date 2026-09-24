const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");


// ============================================
// GENERATE JWT
// ============================================

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};


// ============================================
// REGISTER
// POST /api/v1/auth/register
// ============================================

exports.register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    academicField,
    researchInterests,
  } = req.body;

  // Validate required fields
  if (!name || !email || !password || !academicField) {
    throw new ApiError(
      400,
      "Name, email, password and academic field are required."
    );
  }

  // Basic password validation
  if (password.length < 6) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters long."
    );
  }

  // Check existing user
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User already exists with this email."
    );
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    academicField,
    researchInterests: researchInterests || [],
  });

  // Generate JWT
  const token = generateToken(user._id);

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    academicField: user.academicField,
    researchInterests: user.researchInterests,
    profileImage: user.profileImage,
  };

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: userData,
        token,
      },
      "User registered successfully."
    )
  );
});


// ============================================
// LOGIN
// POST /api/v1/auth/login
// ============================================

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      400,
      "Email and password are required."
    );
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password."
    );
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordCorrect) {
    throw new ApiError(
      401,
      "Invalid email or password."
    );
  }

  const token = generateToken(user._id);

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    academicField: user.academicField,
    researchInterests: user.researchInterests,
    profileImage: user.profileImage,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userData,
        token,
      },
      "Login successful."
    )
  );
});


// ============================================
// GET CURRENT USER
// GET /api/v1/auth/me
// ============================================

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-passwordHash");

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { user },
      "Current user fetched successfully."
    )
  );
});


// ============================================
// LOGOUT
// POST /api/v1/auth/logout
// ============================================

exports.logout = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Logout successful."
    )
  );
});