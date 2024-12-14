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

// Validate user roles and their hierarchy
// This will allow access to all roles higher than the requiredRole
const roleValidator = (requiredRole) => {
  // Define the role hierarchy
  const roleHierarchy = {
    user: 1,
    staff: 2,
    admin: 3,
  };

  return (request, response, next) => {
    try {
      // Check if the user is authenticated and has a role
      if (!request.authUserData || !request.authUserData.role) {
        console.log("User jwt role: " + request.authUserData);
        return response.status(403).json({
          message: "Access denied. No role assigned.",
        });
      }

      const userRole = request.authUserData.role;

      // Make sure the user's role is valid in the hierarchy
      if (!roleHierarchy[userRole]) {
        return response.status(403).json({
          message: "Access denied. Invalid role.",
        });
      }

      // Compare the user's role with the required role
      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        return response.status(403).json({
          message: `Access denied. This action requires ${requiredRole} or higher.`,
        });
      }

      // User's role meets or exceeds the required role
      next();
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  };
};

module.exports = { validateUserAuth, roleValidator };
