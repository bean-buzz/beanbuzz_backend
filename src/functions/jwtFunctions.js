const jwt = require("jsonwebtoken");

let jwtSecretKey = process.env.JWT_SECRET_KEY;

// async function generateJWT(userDetailsObj)
function generateJWT(userId, email, role = "user") {
  return jwt.sign(
    {
      userId: userId,
      email: email,
      role: role,
    },
    jwtSecretKey,
    {
      expiresIn: "7d",
    }
  );
}

module.exports = {
  generateJWT,
};
