const { createUserTable, saveUser } = require("../models/user");
const analytics = require('../segment/segmentConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { client } = require("../db/index.js");
const { sendToken } = require("../utils/jwtToken");
const { sendEmail } = require("../utils/sendEmail.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { sendErrorResponse } = require("../utils/res_error");
const { body, validationResult } = require('express-validator');
const saltRounds = 10;
const crypto = require("crypto");

// Common validation rules for user
// Validation rules
const userValidationRules = [
  body('first_name')
    .isString().withMessage('First name must be a string')
    .isLength({ min: 1 }).withMessage('First name is required'),
  body('last_name')
    .isString().withMessage('Last name must be a string')
    .isLength({ min: 1 }).withMessage('Last name is required'),
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
  body('phone')
    .isNumeric().withMessage('Phone must be numeric')
    .isLength({ min: 10, max: 15 }).withMessage('Phone must be between 10 and 15 characters'),
];

// Custom validation functions
const validateUserExists = async (userId) => {
  const user = await client.query('SELECT * FROM "users" WHERE id = $1', [userId]);
  if (user.rows.length === 0) {
    throw new Error('User not found');
  }
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get user by full name
const getUserByFullName = async (firstName, lastName) => {
  try {
    const result = await client.query('SELECT * FROM users WHERE first_name = $1 AND last_name = $2', [firstName, lastName]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error getting user by full name:", error.message);
    throw new Error("Error getting user by full name");
  }
};

// Signup new user
const signup = [
  ...userValidationRules,
  handleValidationErrors,
  catchAsyncErrors(async (req, res, next) => {
    const { first_name, last_name, email, is_email_verified, phone, is_phone_verified, password, permissions, is_active, is_employee } = req.body;

    await createUserTable();

    // Check if a user with the same email already exists
    const existingUser = await client.query('SELECT * FROM "users" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      // return res.status(400).json({ error: "User with this email already exists" });
      return sendErrorResponse(res, 400, 'User with this email already exists');
    }

    // Check if a user with the same first name and last name already exists
    const existingUserByName = await getUserByFullName(first_name, last_name);
    if (existingUserByName) {
      return sendErrorResponse(res, 400, 'user with this first name and last name already exists');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // Save the user data
      const result = await saveUser({
        first_name,
        last_name,
        email,
        is_email_verified,
        phone,
        is_phone_verified,
        password: hashedPassword,
        permissions,
        is_active,
        is_employee,
      });

      if (!result.id) {
        throw new Error("User ID is missing or invalid");
      }

      // Identify the user in Segment
      analytics.identify({
        userId: String(result.id), // Ensure userId is a string
        traits: {
          email: result.email,
          firstName: result.first_name,
          lastName: result.last_name,
        }
      });

      // Track the signup event in Segment
      analytics.track({
        userId: String(result.id), // Ensure userId is a string
        event: 'User Signed Up',
        properties: {
          email: result.email,
          firstName: result.first_name,
          lastName: result.last_name,
          signupMethod: 'Website',
          createdAt: new Date().toISOString(),
        }
      });

      sendToken(result, 201, res);
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  })
];

// Add user (Admin functionality, similar to signup)
const addUser = [
  ...userValidationRules,
  handleValidationErrors,
  catchAsyncErrors(async (req, res, next) => {
    const { first_name, last_name, email, is_email_verified, phone, is_phone_verified, password, permissions, is_active, is_employee } = req.body;

    await createUserTable();

    // Check if a user with the same email already exists
    const existingUser = await client.query('SELECT * FROM "users" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      // return res.status(400).json({ error: "User with this email already exists" });
      return sendErrorResponse(res, 400, 'User with this email already exists');
    }

    // Check if a user with the same first name and last name already exists
    const existingUserByName = await getUserByFullName(first_name, last_name);
    if (existingUserByName) {
      return sendErrorResponse(res, 400, 'user with this first name and last name already exists');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // Save the user data
      const result = await saveUser({
        first_name,
        last_name,
        email,
        is_email_verified,
        phone,
        is_phone_verified,
        password: hashedPassword,
        permissions,
        is_active,
        is_employee,
      });

      if (!result.id) {
        throw new Error("User ID is missing or invalid");
      }

      // Identify the user in Segment
      analytics.identify({
        userId: String(result.id),
        traits: {
          email: result.email,
          firstName: result.first_name,
          lastName: result.last_name,
        }
      });

      // Track the user addition event in Segment
      analytics.track({
        userId: String(result.id),
        event: 'User Added',
        properties: {
          email: result.email,
          firstName: result.first_name,
          lastName: result.last_name,
          signupMethod: 'Admin',
          createdAt: new Date().toISOString(),
        }
      });

      sendToken(result, 201, res);
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  })
];

// User login
const login = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
  catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    try {
      // Check if user exists with the provided email
      const existingUser = await client.query('SELECT * FROM "users" WHERE email = $1', [email]);
      if (existingUser.rows.length === 0) {
        // return res.status(400).json({ error: "User with this email doesn't exist" });
        return sendErrorResponse(res, 400, 'User with this email does not exists');
      }

      const user = existingUser.rows[0];

      // Compare hashed password with provided password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // return res.status(400).json({ error: "Invalid password" });
        return sendErrorResponse(res, 400, 'Invalid password');
      }

      // Identify the user in Segment
      analytics.identify({
        userId: String(user.id),
        traits: {
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        }
      });

      // Track the login event in Segment
      analytics.track({
        userId: String(user.id),
        event: 'User Logged In',
        properties: {
          email: user.email,
          loginMethod: 'Website',
          loginAt: new Date().toISOString(),
        }
      });

      // Login successful, generate and send token
      sendToken(user, 200, res);
    } catch (error) {
      console.error("Error occurred during login:", error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  })
];

// User logout
const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  // Track the logout event in Segment
  analytics.track({
    userId: String(req.user.id),
    event: 'User Logged Out',
    properties: {
      logoutAt: new Date().toISOString(),
    }
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Get all users (Admin functionality)
const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch all users from the database
    const users = await client.query('SELECT * FROM "users"');

    // Track the event of viewing all users if necessary
    analytics.track({
      userId: String(req.user.id), // Assumes req.user contains admin's user id
      event: 'Admin Viewed All Users',
      properties: {
        viewedAt: new Date().toISOString(),
        userCount: users.rows.length,
      }
    });

    res.status(200).json(users.rows);
  } catch (error) {
    console.error("Error occurred while fetching users:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// Forgot password
const forgotPassword = [
  body('email').isEmail().withMessage('Invalid email address'),
  handleValidationErrors,
  catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    try {
      // Check if user exists with the provided email
      const existingUser = await client.query('SELECT * FROM "users" WHERE email = $1', [email]);
      if (existingUser.rows.length === 0) {
        // return res.status(400).json({ error: "User with this email doesn't exist" });
        return sendErrorResponse(res, 400, 'User with this email does not exist');
      }

      const user = existingUser.rows[0];

      // Generate a random reset token with expiration time
      const resetPasswordToken = crypto.randomBytes(20).toString('hex');
      const resetToken = crypto.createHash("sha256").update(resetPasswordToken).digest("hex");
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      // Update user's reset token and expiry in the database
      await client.query('UPDATE "users" SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', [resetToken, resetTokenExpiry, user.id]);

      // Send the reset password email
      const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`;
      const message = `Your password reset token is as follows: \n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Password Recovery',
          message,
        });

        res.status(200).json({
          success: true,
          message: `Email sent to ${user.email} successfully`,
        });
      } catch (error) {
        // Reset token and expiry on failure
        await client.query('UPDATE "users" SET reset_password_token = NULL, reset_password_expiry = NULL WHERE id = $1', [user.id]);
        console.error("Error occurred while sending email:", error);
        return res.status(500).json({ error: "An internal server error occurred" });
      }
    } catch (error) {
      console.error("Error occurred during password recovery:", error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  })
];

// Reset password
const resetPassword = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
  catchAsyncErrors(async (req, res, next) => {
    const { newPassword, confirmPassword, token} = req.body;

      const now = new Date(Date.now());

      // Find user by reset token and ensure token has not expired
      const user = await client.query('SELECT * FROM "users" WHERE reset_token = $1 AND reset_token_expiry > $2', [token, now]);
      if (user.rows.length === 0) {
        return sendErrorResponse(res, 400, 'Invalid or expired reset token');
      }

       // Validate new password and confirm password match
    if (newPassword !== confirmPassword) {
      return sendErrorResponse(res, 400, 'New password do not match');
    }

      // Update user's password
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await client.query('UPDATE "users" SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [hashedPassword, user.rows[0].id]);

      res.status(200).json({ success: true, message: "Password reset successfully" });
    
  })
];

// Get user details
const getUserDetails = catchAsyncErrors(async (req, res) => {
  const userId = req.user.id;

  const user = await client.query('SELECT * FROM "users" WHERE id = $1', [userId]);
  if (user.rows.length === 0) {
    return sendErrorResponse(res, 400, 'User not found');
  }

  res.status(200).json(user.rows[0]);
});

// Edit user details (Admin)
const editUser = [
  ...userValidationRules,
  handleValidationErrors,
  catchAsyncErrors(async (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, email, password, phone } = req.body;

    await validateUserExists(userId);

    // Check if a user with the same first name and last name already exists
    const existingUserByName = await getUserByFullName(first_name, last_name);
    if (existingUserByName) {
      return sendErrorResponse(res, 400, 'user with this first name and last name already exists');
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updateQuery = `
      UPDATE "users" 
      SET first_name = $2, last_name = $3, email = $4, phone = $5 ${hashedPassword ? ', password = $6' : ''} 
      WHERE id = $1
    `;
    const values = [userId, first_name, last_name, email, phone];
    if (hashedPassword) {
      values.push(hashedPassword);
    }
    await client.query(updateQuery, values);

    analytics.identify({
      userId: String(userId),
      traits: { email, firstName: first_name, lastName: last_name, phone }
    });

    analytics.track({
      userId: String(userId),
      event: 'User Details Edited',
      properties: { editedAt: new Date().toISOString(), email, firstName: first_name, lastName: last_name, phone }
    });

    res.status(200).json({ success: true, message: 'User details updated successfully' });
  })
]

// Delete user (Admin)
const deleteUser = catchAsyncErrors(async (req, res) => {
  const userId = req.params.id;

  await validateUserExists(userId);

  await client.query('BEGIN');
  await client.query('DELETE FROM "users" WHERE id = $1', [userId]);
  await client.query('COMMIT');

  analytics.track({
    userId: String(req.user.id),
    event: 'User Deleted',
    properties: { userId, deletedAt: new Date().toISOString() }
  });

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

module.exports = {
  signup,
  login,
  logout,
  getAllUsers,
  addUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  editUser,
  deleteUser,
};
