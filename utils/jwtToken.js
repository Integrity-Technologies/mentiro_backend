// create token and saving in cookies

const jwt = require('jsonwebtoken');

const generateToken = (result) => {
  return jwt.sign({email:result.email}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const sendToken = (result, statusCode, res) => {
  const token = generateToken(result);

  // Options for cookie
  const options = {
    expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    result,
    token,
  });
};

module.exports = { generateToken, sendToken };