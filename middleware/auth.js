const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const { client } = require("../db/index.js");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  // Fetch user data from PostgreSQL based on decoded user id
  const userData = await client.query('SELECT * FROM "user" WHERE id = $1', [decodedData.id]);

  if (userData.rows.length === 0) {
    return next(new ErrorHandler("User not found", 404));
  }

  req.user = userData.rows[0]; // Assign user data to req.user

  next();
});

// exports.authorizeRoles = (...permissions) => {
//   return (req, res, next) => {
//     if (!permissions.includes(req.user.permissions)) {
//       return next(
//         new ErrorHander(
//           `Permission: User is not allowed to access this resource`,
//           403
//         )
//       );
//     }

//     next();
//   };
// };


// both conditions need to be tested before integrate

// if(permissions === req.user.permissions){

// }