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

module.exports = { validateUserAuth };
