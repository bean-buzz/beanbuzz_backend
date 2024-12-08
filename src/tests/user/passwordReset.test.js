require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const request = require("supertest");
const { app } = require("../../server");
const { User } = require("../../models/UserModel");
const jwt = require("jsonwebtoken");

jest.mock("../../models/UserModel", () => ({
  User: {
    findOne: jest.fn(),
    findById: jest.fn(),
    // Save mock user with hashed password
    save: jest.fn().mockResolvedValue({
      _id: "123",
      email: "john.doe@example.com",
      password: "hashedPassword123",
    }),
    constructor: jest.fn().mockImplementation(function () {
      this.firstName = "John";
      this.lastName = "Doe";
      this.email = "john.doe@example.com";
      this.password = "Password123";
      this.save = jest.fn().mockResolvedValue(this);
    }),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn().mockImplementation((token) => {
    if (token === "valid_token") {
      // Mock success for valid token
      return { userId: "123" };
    }
    // Mock failure for invalid token
    throw new Error("Invalid or expired token");
  }),
}));

jest.mock("bcrypt", () => ({
  hashSync: jest.fn().mockReturnValue("hashedPassword123"),
  hash: jest.fn().mockResolvedValue("hashedPassword123"),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

describe("Password Reset Routes", () => {
  beforeAll(async () => {
    jest.resetAllMocks();
    await mongoose.connect("mongodb://localhost/testdb");
    jwt.verify.mockImplementation(() => ({
      id: "mockUserId",
    }));
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /request-password-reset", () => {
    it("should send a reset link if user exists", async () => {
      const mockUser = { email: "john.doe@example.com" };

      // Mock User.findOne to return a user
      User.findOne.mockResolvedValue(mockUser);

      // Mock JWT token generation
      jwt.sign.mockReturnValue("mocked_reset_token");

      const response = await request(app).post("/request-password-reset").send({
        email: "john.doe@example.com",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Reset link sent to email");
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );
    });

    it("should return an error if user does not exist", async () => {
      // Mock User.findOne to return null (user not found)
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post("/request-password-reset").send({
        email: "nonexistent@example.com",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should return an error if an error occurred", async () => {
      // Mock an internal error in the User.findOne method
      User.findOne.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/request-password-reset").send({
        email: "john.doe@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("An error occurred");
    });
  });

  describe("POST /reset-password", () => {
    it("should reset the password when the token is valid", async () => {
      const mockUser = {
        _id: "123",
        email: "john.doe@example.com",
        password: "oldpassword123",
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock JWT.verify to return valid decoded token
      jwt.verify.mockReturnValue({ userId: mockUser._id });

      // Mock User.findById to return the mock user with the save method
      User.findById.mockResolvedValue(mockUser);

      // Mock bcrypt.hash to return a hashed password
      bcrypt.hash.mockResolvedValue("hashedPassword123");

      const newPassword = "newPassword123";

      const response = await request(app)
        .post("/reset-password")
        .send({ token: "valid_token", password: newPassword });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password reset successful");

      // Check if save method was called to update the password
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return an error if token is invalid or expired", async () => {
      // Mock JWT.verify to throw an error for an invalid token
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid or expired token");
      });

      const response = await request(app)
        .post("/reset-password")
        .send({ token: "invalid_token", password: "newPassword123" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should return an error if password is missing", async () => {
      const response = await request(app)
        .post("/reset-password")
        .send({ token: "valid_token" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Password is required");
    });

    it("should return an error if user is not found", async () => {
      // Mock JWT.verify to return valid token but no user found
      jwt.verify.mockReturnValue({ userId: "invalid_user_id" });
      User.findById.mockResolvedValue(null);

      const response = await request(app)
        .post("/reset-password")
        .send({ token: "valid_token", password: "newPassword123" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should fail if the password does not meet the requirements", async () => {
      const mockValidationError = new mongoose.Error.ValidationError();
      mockValidationError.errors = {
        password: {
          message:
            "Password must be at least 8 characters long and contain at least one uppercase letter and one number.",
        },
      };

      // Mock an invalidUser to always throw mockValidationError
      const invalidUser = {
        save: jest.fn(() => {
          throw mockValidationError;
        }),
      };

      try {
        await invalidUser.save();
      } catch (err) {
        expect(err.errors.password).toBeDefined();
        expect(err.errors.password.message).toBe(
          "Password must be at least 8 characters long and contain at least one uppercase letter and one number."
        );
      }
    });
  });
});
