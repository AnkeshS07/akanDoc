const jwt = require("jsonwebtoken");
//====================================================================================================================//

/**
 * The function generates a JSON Web Token (JWT) with a specified user ID, project name, and expiration
 * time.
 * @param userId - The `userId` parameter is the unique identifier for a user. It is used to associate
 * the generated token with a specific user.
 * @returns a JSON Web Token (JWT) that is generated using the `jwt.sign` method.
 */

function generateToken(userId) {
  return jwt.sign(
    {
      userId: userId,
      project: "AKANDOC",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // Set expiration to 1 year (365 days)
    },
    process.env.JWT_SECRET
  );
}

//======================================================================================================================//
module.exports = {
  generateToken,
};
