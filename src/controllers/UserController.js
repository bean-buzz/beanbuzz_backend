const express = require("express");
const bcrypt = require("bcrypt");

const { User } = require("../models/UserModel");
const { generateJWT } = require("../functions/jwtFunctions");
const { validateUserAuth } = require("../middleware/validateUserAuth");

const router = express.Router();

// Allows the user to sign up to BeanBuzz
router.post("/register", async (request, response) => {
  // Destructure the data from request.body
  const { firstName, lastName, email, phoneNumber, password } = request.body;

  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    return response.status(400).json({
      message: "Incorrect or missing sign-up credentials provided.",
    });
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return response.status(403).json({
        message: "Email already exists.",
      });
    }

    // Create the new user in the DB
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });

    // Generate a JWT based on the user's ID and email
    const newJwt = generateJWT(newUser.id, newUser.email);

    // Return the JWT and user data (excluding sensitive info like password)
    return response.json({
      jwt: newJwt,
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    });
  } catch (err) {
    // If it's a validation error (password validation fails), catch it here
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map(
        (error) => error.message
      );
      return response
        .status(400)
        .json({ message: validationErrors.join(", ") });
    }

    // For other errors, send a generic 500 response
    return response.status(500).json({
      message: "Internal server error.",
    });
  }
});

// Allows the user to login into BeanBuzz
router.post("/login", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({
      message: "Email and password are required.",
    });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return response.status(404).json({
        message: "User not found.",
      });
    }

    // Compare provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return response.status(401).json({
        message: "Incorrect password.",
      });
    }

    // Generate JWT token
    const token = generateJWT(user.id, user.email, user.role);

    // Return JWT and user data
    response.json({
      message: "Sign-in successful",
      jwt: token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    // Send a generic 500 response
    return response.status(500).json({
      message: "Internal server error.",
    });
  }
});

router.get("/protectedRoute", validateUserAuth, (request, response) => {
  response.json({
    message: "You can see protected content because you're signed in!",
  });
});

module.exports = router;
