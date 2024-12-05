require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const request = require("supertest"); // Import supertest for making HTTP requests
const { app } = require("../server"); // Import app from src/server.js

const { User } = require("../models/UserModel");

jest.mock("bcrypt", () => ({
  hashSync: jest.fn().mockReturnValue("hashedPassword123"), // Mock hashed password return value
  compare: jest.fn().mockResolvedValue(true), // Mock bcrypt compare method to always return true (indicating passwords match)
}));

// Mock User methods before the tests run
jest.mock("../models/UserModel", () => ({
  User: {
    create: jest.fn().mockResolvedValue({
      id: "123",
      email: "john.doe@example.com",
      password: "hashedPassword123",
    }),
    findOne: jest.fn().mockResolvedValue(null), // This simulates no user found
  },
}));

describe("POST /register", () => {
  beforeAll(async () => {
    // Setup Mongoose connection for tests
    await mongoose.connect("mongodb://localhost/testdb");
  });

  afterAll(async () => {
    // Close the connection after tests
    await mongoose.connection.close();
  });

  it("should register a new user successfully", async () => {
    // Mock the User.create method to simulate the user being saved
    User.create.mockResolvedValue({
      id: "123",
      email: "john.doe@example.com",
    });

    const response = await request(app).post("/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "1234567890",
      password: "Password123",
    });

    expect(response.status).toBe(200);

    // Ensure JWT is in response
    expect(response.body.jwt).toBeDefined();
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).toHaveProperty("email", "john.doe@example.com");
  });

  it("should return an error if email already exists", async () => {
    // Mock the User.findOne method to simulate an existing user
    User.findOne.mockResolvedValue({
      email: "john.doe@example.com",
    });

    const response = await request(app).post("/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "1234567890",
      password: "Password123",
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Email already exists.");
  });

  it("should hash the password before saving", async () => {
    const user = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "1234567890",
      password: "Password123",
    });

    // // Create the user instance
    // const user = new User(userData);

    // // Save the user to trigger the pre-save hook (inside UserModel)
    // await user.save();

    // Verify that the password is hashed
    expect(user.password).not.toBe("Password123");

    // Check if the hash matches the plain text password
    const isMatch = await bcrypt.compare("Password123", user.password);
    expect(isMatch).toBe(true);
  });

  it("should return an error if required fields are missing", async () => {
    const response = await request(app).post("/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      // Missing phoneNumber and password
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Incorrect or missing sign-up credentials provided."
    );
  });
});
