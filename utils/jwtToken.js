// create token and saving in cookies

const jwt = require('jsonwebtoken');

// const generateToken = async(result) => {
// //   if (!process.env.JWT_SECRET) {
// //     throw new Error('JWT_SECRET environment variable is not set');
// // }
//   return  jwt.sign({email:result.email}, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// };

const sendToken = (result, statusCode, res) => {
  const token = jwt.sign({id:result.id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // Options for cookie
  const options = {
    expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // 1 day in milliseconds
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    result,
    token
  });
};

module.exports = {  sendToken };