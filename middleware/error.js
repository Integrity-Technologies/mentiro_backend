// // middleware/error.js
// const ErrorHandler = require("../utils/errorHandler");

// const handleError = (err, req, res, next) => {
//     console.error("Error middleware caught an error:", err); // Add this line for debugging

//     const statusCode = err.statusCode || 500;
//     const message = err.message || "Internal Server Error";

//     res.status(statusCode).json({
//         success: false,
//         message,
//     });
// };

// module.exports = handleError;
