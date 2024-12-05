// libraries
const express = require("express");

const jwt = require("jsonwebtoken");
const cors = require("cors");
// const nodemailer = require("nodemailer");

// models
const { User } = require("./models/UserModel");

// local functions
const { generateJWT } = require("./functions/jwtFunctions");

const app = express();

// Allow CORS from Vite's frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      // Replace with the URL of the frontend + backend in development
      //      https://render URL
      //      https://domain URL
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true, // Allow cookies if necessary
  })
);

app.use(express.json());

// This will allow us to check whether the server is running as expected
app.get("/", (request, response) => {
  try {
    // Reponse when the server is working
    response.json({
      message: "BeanBuzz is up and running!",
    });
  } catch (error) {
    // In case something goes wrong (server issue)
    console.error("Error occurred:", error); // Log the error for debugging
    response.status(500).json({
      message: "Oops! Something went wrong on the server.",

      // TODO: Remove for production
      error: error.message,
    });
  }
});

// Allows the user to sign up to BeanBuzz
app.post("/signup", async (request, response) => {
  // Destructure the data from request.body
  const { firstName, lastName, email, phoneNumber, password } = request.body;

  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    response.status(400).json({
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
    console.error(err);
    return response.status(500).json({
      message: "Internal server error.",
    });
  }
});

module.exports = {
  app,
};
