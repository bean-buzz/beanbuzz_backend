const jwt = require("jsonwebtoken");

let jwtSecretKey = process.env.JWT_SECRET_KEY;

// Generate a JWT for the user
function generateJWT(userId, email, role = "user", firstName) {
  return jwt.sign(
    {
      userId: userId,
      email: email,
      role: role,
      firstName,
    },
    jwtSecretKey,
    {
      expiresIn: "1d",
    }
  );
}

function decodeJWT(tokenToDecode) {
  return jwt.verify(tokenToDecode, jwtSecretKey);
}

module.exports = {
  generateJWT,
  decodeJWT,
};
