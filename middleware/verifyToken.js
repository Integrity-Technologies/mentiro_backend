const jwt = require('jsonwebtoken');
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const { client } = require("../db/index.js");

const verifyTokenAndExtractUserId = catchAsyncErrors(async(req, res, next) => {
    try {
    const { token } = req.cookies;
    console.log(token);

    // Verify the token using your JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   // Fetch user data from PostgreSQL based on decoded user id
  const userData = await client.query('SELECT * FROM "user" WHERE id = $1', [decoded.id]);

  if (userData.rows.length === 0) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Assign user data to req.user
  req.user = userData.rows[0];

  // Call the next middleware in the chain
  next();
} catch (error) {
    // Handle any errors that occur during token verification or database query
    return next(new ErrorHandler("Invalid token", 401));
}
});

module.exports = {verifyTokenAndExtractUserId};
