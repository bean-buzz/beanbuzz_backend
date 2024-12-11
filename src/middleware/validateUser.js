const { decodeJWT } = require("../functions/jwtFunctions");

// Validate user auth middleware
async function validateUserAuth(request, response, next) {
  // Use 'Authorization' header
  let authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(403).json({
      message: "Sign in to view this content!",
    });
  }

  // Extract token from Bearer token
  let providedToken = authHeader.split(" ")[1];
  let decodedData;
  try {
    decodedData = decodeJWT(providedToken);

    if (decodedData.userId) {
      request.authUserData = decodedData;
      next();
    } else {
      return response.status(403).json({
        message: "Sign in to view this content!",
      });
    }
  } catch (error) {
    return response.status(403).json({
      message: "Invalid or expired token. Please sign in again.",
    });
  }
}

// Validate whether the user's role is admin
const isAdmin = (request, response, next) => {
    try {
    if (!request.authUserData || request.authUserData.role !== "admin") {
      return response.status(403).json({
        message: "Access denied. This is for Admins only.",
      });
    }
    next();
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

module.exports = { validateUserAuth, isAdmin };
