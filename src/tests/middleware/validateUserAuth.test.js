const express = require("express");
const request = require("supertest");
const { validateUserAuth } = require("../../middleware/validateUserAuth");
const { decodeJWT } = require("../../functions/jwtFunctions");

// Mocking the decodeJWT function
jest.mock("../../functions/jwtFunctions", () => ({
  generateJWT: jest.fn(),
  decodeJWT: jest.fn(),
}));

describe("validateUserAuth middleware", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Protected route using the middleware
    app.get("/protectedRoute", validateUserAuth, (req, res) => {
      res.status(200).json({ message: "Protected content" });
    });
  });

  it("should return 403 if Authorisation header is missing", async () => {
    const response = await request(app)
      .get("/protectedRoute")
      // Missing Authorisation header
      .set("Authorization", "");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Sign in to view this content!");
  });

  it("should return 403 if Authorization header doesn't start with 'Bearer '", async () => {
    const response = await request(app)
      .get("/protectedRoute")
      // Invalid Authorisation header
      .set("Authorization", "Basic someToken");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Sign in to view this content!");
  });

  it("should return 403 if token is invalid", async () => {
    const invalidToken = "invalid.token";
    // Mock the decodeJWT function to decoding failure
    decodeJWT.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const response = await request(app)
      .get("/protectedRoute")
      // Providing an invalid token
      .set("Authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Invalid or expired token. Please sign in again."
    );
  });

  it("should return 403 if token does not contain a userId", async () => {
    const tokenWithoutUserId = "valid.token.without.userId";
    // Mock the decodeJWT function to return a token without userId
    decodeJWT.mockImplementation(() => ({ someOtherField: "value" }));

    const response = await request(app)
      .get("/protectedRoute")
      .set("Authorization", `Bearer ${tokenWithoutUserId}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Sign in to view this content!");
  });
});
