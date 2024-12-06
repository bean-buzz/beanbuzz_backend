require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const request = require("supertest");
const { app } = require("../../server");

const { User } = require("../../models/UserModel");

// Creat a bcrypt mock
jest.mock("bcrypt", () => ({
  hashSync: jest.fn().mockReturnValue("hashedPassword123"),
  hash: jest.fn().mockResolvedValue("hashedPassword123"),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock User methods before the tests run
jest.mock("../../models/UserModel", () => ({
  User: {
    findOne: jest.fn(),
  },
}));

describe("POST /login", () => {
  beforeAll(async () => {
    // Setup Mongoose connection for tests
    await mongoose.connect("mongodb://localhost/testdb");
  });

  afterAll(async () => {
    // Close the connection after tests
    await mongoose.connection.close();
  });

  it("should log in the user successfully with correct email and password", async () => {
    const userData = {
      email: "john.doe@example.com",
      password: "Password123",
      id: "123",
      role: "user",
    };

    // Mock the user found in the database
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const mockUser = {
      ...userData,
      password: hashedPassword,
    };

    // Mock User.findOne to return this user
    User.findOne.mockResolvedValue(mockUser);

    // Make the login request
    const response = await request(app).post("/login").send({
      email: "john.doe@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(200);

    // Check if JWT token is returned
    expect(response.body.jwt).toBeDefined();

    expect(response.body.user).toHaveProperty("id", "123");
    expect(response.body.user).toHaveProperty("email", "john.doe@example.com");
  });

  it("should return an error if email or password is missing", async () => {
    // Missing email
    let response = await request(app)
      .post("/login")
      .send({ password: "Password123" });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password are required.");

    // Missing password
    response = await request(app)
      .post("/login")
      .send({ email: "john.doe@example.com" });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password are required.");
  });

  it("should return an error if user is not found", async () => {
    // User not found
    User.findOne.mockResolvedValue(null);

    const response = await request(app).post("/login").send({
      email: "john.doe@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found.");
  });

  it("should return an error if the password is incorrect", async () => {
    const userData = {
      email: "john.doe@example.com",
      password: "Password123",
      id: "123",
      role: "user",
    };

    // Mock the user with the correct password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const mockUser = {
      ...userData,
      password: hashedPassword,
    };

    User.findOne.mockResolvedValue(mockUser);

    // Mock bcrypt.compare to return false for incorrect password
    bcrypt.compare.mockResolvedValue(false);

    // Incorrect password
    const response = await request(app).post("/login").send({
      email: "john.doe@example.com",
      password: "WrongPassword123",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect password.");
  });

  it("should return a generic error message for unexpected errors", async () => {
    // Mock an error in the User.findOne method
    User.findOne.mockRejectedValue(new Error("Some internal error"));

    const response = await request(app).post("/login").send({
      email: "john.doe@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal server error.");
  });
});
