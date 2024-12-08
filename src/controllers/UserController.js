require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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
    const token = generateJWT(newUser.id, newUser.email);

    // Return the JWT and user data
    return response.json({
      jwt: token,
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    });
  } catch (err) {
    // If it's a validation error (password validation fails)
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
    return response.status(500).json({
      message: "Internal server error.",
    });
  }
});

// This route is looked after inside the front-end
router.get("/protectedRoute", validateUserAuth, (request, response) => {
  response.json({
    message: "You can see protected content because you're signed in!",
  });
});

/*
  Allow the user to verify a forgot password reset.
  This is send a valid jwt token to the user that expires within the hour
  This will send the user to a password reset page
*/
// Configure the transporter for sending email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Endpoint to request password reset
router.post("/request-password-reset", async (request, response) => {
  const { email } = request.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    // Generate a one-time reset token - valid for 1 hour
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    // Send the reset link via email
    const resetLink = `${process.env.WEBSITE_URL}/reset-password/${resetToken}`;

    // Read the HTML template
    const templatePath = path.join(
      __dirname,
      "../../email_templates/user_emails/resetPasswordTemplate.html"
    );
    let templateSource = fs.readFileSync(templatePath, "utf8");

    templateSource = templateSource.replace("{{resetLink}}", resetLink);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: templateSource,
      attachments: [
        {
          filename: "Logo.png",
          path: path.join(__dirname, "../../email_templates/assets/Logo.png"),
          // This matches the `cid` reference in the HTML
          cid: "logoImage",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    response.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    response.status(400).json({ message: "An error occurred" });
  }
});

router.post("/reset-password", async (request, response) => {
  const { token, password } = request.body;

  if (!password) {
    return response.status(400).json({ message: "Password is required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find the user associated with the token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    response.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    // Handle JWT related errors
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.message === "Invalid or expired token"
    ) {
      return response.status(400).json({ message: "Invalid or expired token" });
    }

    // Handle other unexpected errors
    return response.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
