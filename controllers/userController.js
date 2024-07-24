// userController.js
const { createUserTable, saveUser } = require("../models/user");
const analytics = require('../segment/segmentConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { client } = require("../db/index.js");
const { sendToken } = require("../utils/jwtToken");
const { sendEmail } = require("../utils/sendEmail.js");
const posthog = require('../postHog/postHog.js');
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

// update user validations rules
const userUpdateValidationRules = [
  body('first_name')
    .isString().withMessage('First name must be a string')
    .isLength({ min: 1 }).withMessage('First name is required'),
  body('last_name')
    .isString().withMessage('Last name must be a string')
    .isLength({ min: 1 }).withMessage('Last name is required'),
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .isNumeric().withMessage('Phone must be numeric')
    .isLength({ min: 10, max: 15 }).withMessage('Phone must be between 10 and 15 characters')
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

// Helper function to get company name by user ID
async function getCompanyNameByUserId(userId) {
  try {
    const result = await client.query(
      `SELECT name FROM companies WHERE created_by = $1 AND is_active = TRUE LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0) {
      return result.rows[0].name;
    }

    return null;
  } catch (error) {
    console.error("Error fetching company name:", error);
    throw error;
  }
}

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
      return sendErrorResponse(res, 409, 'User with this email already exists');
    }

    // check if the phone no already exists in database
    const existingPhoneNo = await client.query(`SELECT * FROM "users" WHERE phone = $1`, [phone]);
    if (existingPhoneNo.rows.length > 0) {
      return sendErrorResponse(res, 409, 'User with this phone number already exists');
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
        // throw new Error("User ID is missing or invalid");
        return sendErrorResponse(res, 400, 'User ID is missing or invalid');
      }

      // posthog.capture({
      //   distinctId: result.id,
      //   event: 'User Signed Up',
      //   properties: {
      //     email: user.email,
      //     name: user.name,
      //     signup_method: 'Email', 
      //   },
      // });

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
      res.status(500).json({ error: error.message });
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

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    // Check if a user with the same email already exists
    const existingUser = await client.query('SELECT * FROM "users" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      // return res.status(400).json({ error: "User with this email already exists" });
      return sendErrorResponse(res, 409, 'User with this email already exists');
    }

    // check if the phone no already exists in database
    const existingPhoneNo = await client.query(`SELECT * FROM "users" WHERE phone = $1`, [phone]);
    if (existingPhoneNo.rows.length > 0) {
      return sendErrorResponse(res, 409, 'User with this phone number already exists');
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
        // throw new Error("User ID is missing or invalid");
        return sendErrorResponse(res, 400, 'User ID is missing or invalid');
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
      res.status(500).json({ error: error.message });
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
        return sendErrorResponse(res, 404, 'User with this email does not exists');
      }

      const user = existingUser.rows[0];

      // Compare hashed password with provided password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // return res.status(400).json({ error: "Invalid password" });
        return sendErrorResponse(res, 401, 'Invalid password');
      }

      // Fetch the company name
      const companyName = await getCompanyNameByUserId(user.id);

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

      // Include the company name in the response
      const tokenResponse = {
        ...user,
        company_name: companyName,
      };

      // Login successful, generate and send token
      sendToken(tokenResponse, 200, res);

      // Login successful, generate and send token
      // sendToken(user, 200, res);
    } catch (error) {
      console.error("Error occurred during login:", error);
      res.status(500).json({ error: error.message });
    }
  })
];

// User logout
const logout = catchAsyncErrors(async (req, res, next) => {

  // Check if req.user and req.user.id are defined
  if (!req.user || !req.user.id) {
    console.error("User ID is missing in the request");
    return res.status(400).json({ error: "User ID is missing in the request" });
  }

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  // Track the logout event in Segment
  analytics.track({
    userId: String(req.user?.id),
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

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }
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
    res.status(500).json({ error: error.message });
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
        return sendErrorResponse(res, 404, 'User with this email does not exist');
      }

      const user = existingUser.rows[0];

      // Generate a random reset token with expiration time
      const resetPasswordToken = crypto.randomBytes(20).toString('hex');
      const resetToken = crypto.createHash("sha256").update(resetPasswordToken).digest("hex");
      // Set expiry time to 24 hours from now
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Update user's reset token and expiry in the database
      await client.query('UPDATE "users" SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', [resetToken, resetTokenExpiry, user.id]);

      // const resetUrl = `${protocol}://${host}/password/reset/${resetPasswordToken}`;
      const resetUrl = `${process.env.BASE_URL_DEV}/password/reset/${resetToken}`;
      // const message = `Your password reset token is as follows: \n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;
      
      try {
        await sendEmail({
          email: user.email,
          templateId: 36437115,
          templateModel: {
            resetUrl: resetUrl,
          }
        })

        analytics.track({
          userId: String(user.id),
          event: 'Forget password Request',
          properties: {
            passwordRequest: new Date().toISOString(),
          }
        });

        res.status(200).json({
          success: true,
          message: `Email sent to ${user.email} successfully`,
        });
      } catch (error) {
        // Reset token and expiry on failure
        await client.query('UPDATE "users" SET reset_token = NULL, reset_token_expiry = NULL WHERE id = $1', [user.id]);
        console.error("Error occurred while sending email:", error);
        return res.status(500).json({ error: error.message });
      }
    } catch (error) {
      console.error("Error occurred during password recovery:", error);
      res.status(500).json({ error: error.message });
    }
  })
];

// Reset password
const resetPassword = [
  body('newPassword')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')
  .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
  handleValidationErrors,
  catchAsyncErrors(async (req, res, next) => {
    const { newPassword, confirmPassword, token } = req.body;

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

    analytics.track({
      userId: String(user.id || 'anonymous'),
      event: 'Password Reset successfully',
      properties: {
        passwordReset: new Date().toISOString(),
      }
    });

    res.status(200).json({ success: true, message: "Password reset successfully" });

  })
];

// Get user details
const getUserDetails = catchAsyncErrors(async (req, res) => {
  const userId = req.user.id;

  // Check if req.user and req.user.id are defined
  if (!req.user || !req.user.id) {
    console.error("User ID is missing in the request");
    return res.status(400).json({ error: "User ID is missing in the request" });
  }

  const user = await client.query('SELECT * FROM "users" WHERE id = $1', [userId]);
  if (user.rows.length === 0) {
    return sendErrorResponse(res, 404, 'User not found');
  }

  analytics.track({
    userId: String(req.user.id || 'anonymous'),
    event: 'User details Fetched',
    properties: {
      detailsFetched: new Date().toISOString(),
    }
  });

  res.status(200).json(user.rows[0]);
});

// Edit user details (Admin)
const editUser = [
  ...userUpdateValidationRules,
  handleValidationErrors,
  catchAsyncErrors(async (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, email, phone } = req.body;

    await validateUserExists(userId);

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    // let hashedPassword = null;
    // if (password) {
    //   hashedPassword = await bcrypt.hash(password, 10);
    // }

    const updateQuery = `
      UPDATE "users" 
      SET first_name = $2, last_name = $3, email = $4, phone = $5 
      WHERE id = $1
    `;
    const values = [userId, first_name, last_name, email, phone];
    // if (hashedPassword) {
    //   values.push(hashedPassword);
    // }
    await client.query(updateQuery, values);

    analytics.identify({
      userId: String(req.user.id),
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

  // Check if req.user and req.user.id are defined
  if (!req.user || !req.user.id) {
    console.error("User ID is missing in the request");
    return res.status(400).json({ error: "User ID is missing in the request" });
  }

  await validateUserExists(userId);

  await client.query('BEGIN');
  await client.query('DELETE FROM "users" WHERE id = $1', [userId]);
  await client.query('COMMIT');

  analytics.track({
    userId: String(userId),
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
