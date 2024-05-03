const jwt = require('jsonwebtoken');
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const { client } = require("../db/index.js");

const verifyTokenAndExtractUserId = catchAsyncErrors(async(req, res, next) => {
    try {
      // the below code works well with UI integration and successfully takes the token from UI. NOTE: this code in not applicable when testing along postman
      // const authHeader = req.headers['authorization'];
      // const token = authHeader && authHeader.split(' ')[1];

      // console.log(token, " from verifyTokenAndExtractUserId function in middleware");
    // the below code successfully takes the token from cookies when fetching the api through postman. NOTE: this code is not aplicable for UI integration
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
