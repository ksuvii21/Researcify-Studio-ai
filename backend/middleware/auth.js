const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return next(
      new ApiError(
        401,
        "Authentication required. No token provided."
      )
    );
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(
      new ApiError(
        401,
        "Authentication required. No token provided."
      )
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError(
          401,
          "Your session has expired. Please login again."
        )
      );
    }

    return next(
      new ApiError(
        401,
        "Invalid authentication token."
      )
    );
  }
};

module.exports = verifyToken;