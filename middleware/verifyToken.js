// VerifyToken.js
const jwt = require('jsonwebtoken');
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const { client } = require("../db/index.js");

const verifyTokenAndExtractUserId = catchAsyncErrors(async(req, res, next) => {
    try {
      let token;

        // Check if token is present in cookies
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
            console.log(token, "from cookies in verifyTokenAndExtractUserId function in middleware");
        }
        // Check if token is present in headers
        else if (req.headers['authorization']) {
            const authHeader = req.headers['authorization'];
            token = authHeader && authHeader.split(' ')[1];
            console.log(token, "from headers in verifyTokenAndExtractUserId function in middleware");
        }

        // If no token is found, return an error
        if (!token) {
            // return next(new ErrorHandler("No token provided", 401));
            return sendErrorResponse(res, 401, "No token provided");
        }

    // Verify the token using your JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   // Fetch user data from PostgreSQL based on decoded user id
  const userData = await client.query('SELECT * FROM "users" WHERE id = $1', [decoded.id]);

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
