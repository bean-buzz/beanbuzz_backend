const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
// const nodemailer = require("nodemailer");

const app = express();

// Allow CORS from Vite's frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
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

// Controllers
const userController = require("./controllers/UserController");
app.use("", userController);

module.exports = {
  app,
};
