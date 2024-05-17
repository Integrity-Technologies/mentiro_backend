// controllers/userController.js

const { createUserTable, saveUser } = require("../models/user");
const analytics = require('../segment/segmentConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { client } = require("../db/index.js");
const { sendToken } = require("../utils/jwtToken");
const { sendEmail } = require("../utils/sendEmail.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const saltRounds = 10;
const crypto = require("crypto");


// signup 
const signup = catchAsyncErrors(async (req, res, next) => {
  const { first_name, last_name, email, is_email_verified, phone, is_phone_verified, password, permissions, is_active, is_employee } =
    req.body;

  await createUserTable();

  // Check if a user with the same email already exists
  const existingUser = await client.query('SELECT * FROM "users" WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return res.status(400).json({ error: "User with this email already exists" });
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
    console.log(result.id);
    // Identify the user in Segment
    analytics.identify({
      userId: String(result.id), // Ensure userId is a string
      traits: {
        email: result.email,
        firstName: result.first_name,
        lastName: result.last_name,
        // Add any other traits you want to track
      }
    });

    // Track the signup event in Segment
    analytics.track({
      userId: String(result.id), // Ensure userId is a string
      event: 'User Signed Up',
      properties: {
        // Add relevant properties about the signup event
        email: result.email, // Email of the user who signed up
        firstName: result.first_name, // First name of the user who signed up
        lastName: result.last_name, // Last name of the user who signed up
        signupMethod: 'Website', // Indicates the method used for signup
        createdAt: new Date().toISOString(), // Timestamp of when the signup event occurred
        // Add any other relevant properties you want to track
      }
    });

    sendToken(result, 201, res);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// Add user (similar to signup)
const addUser = catchAsyncErrors(async (req, res, next) => {
  const { first_name, last_name, email, is_email_verified, phone, is_phone_verified, password, permissions, is_active, is_employee } =
    req.body;

  await createUserTable();

  // Check if a user with the same email already exists
  const existingUser = await client.query('SELECT * FROM "users" WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return res.status(400).json({ error: "User with this email already exists" });
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
    console.log(result.id);

    analytics.identify({
      userId: String(result.id),
      traits: {
        email: result.email,
        firstName: result.first_name,
        lastName: result.last_name,
      }
    });

    // Track the signup event in Segment
    analytics.track({
      userId: String(result.id),
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
});

// login
const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists with the provided email
  try {
    const existingUser = await client.query('SELECT * FROM "users" WHERE email = $1', [email]);

    if (existingUser.rows.length === 0) {
      return res.status(400).json({ error: "User with this email id doesn't exists" });
    }

    const user = existingUser.rows[0]; // Get the user data

    // Compare hashed password with provided password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Login successful, generate and send token
    sendToken(user, 200, res); // Status code changed to 200 for successful login
  } catch (error) {
    console.error("Error occurred during login:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// // Logout User
const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// get all users (Admin)
const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch all users from the database
    const users = await client.query('SELECT * FROM "users"');

    res.status(200).json(users.rows); // Return all user data in the response
  } catch (error) {
    console.error("Error occurred while fetching users:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// forgot password
const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  try {
    // Check if user exists with the provided email
    const existingUser = await client.query('SELECT * FROM "users" WHERE email = $1', [email]);

    if (existingUser.rows.length === 0) {
      return res.status(400).json({ error: "User with this email doesn't exist" });
    }

    const user = existingUser.rows[0];

    // Generate a random reset token with expiration time
    const resetPasswordToken = crypto.randomBytes(20).toString('hex');
    const resetToken = crypto.createHash("sha256").update(resetPasswordToken).digest("hex");;
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    // Update user with reset token and expiry
    await client.query('UPDATE "users" SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetToken, resetTokenExpiry, email]);

    //     // Create the email content
    const resetUrl = `http://localhost:3000/api/users/password/reset?token=${resetToken}`; // Replace with your reset password URL
    const message = `Your password reset token :- \n\n ${resetUrl} \n\nIf you have not requested this email then, please ignore it.`;

    await sendEmail({
      email: user.email,
      subject: `mentiro Password Recovery`,
      message,
    });
    res.status(200).json({ message: "Password reset link sent successfully!" });
  } catch (error) {
    // Set reset token and expiry to null if email sending fails
    await client.query('UPDATE "users" SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [null, null, email]);

    console.error("Error sending password reset email:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// reset password
const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    // Check if reset token is valid and not expired
    const now = new Date(Date.now());
    const user = await client.query('SELECT * FROM "users" WHERE reset_token = $1 AND reset_token_expiry > $2',
      [token, now]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const userToUpdate = user.rows[0];

    // Validate new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New passwords do not match" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and remove reset token/expiry
    await client.query('UPDATE "users" SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, userToUpdate.id]);

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  try {
    const existingUser = await client.query('SELECT * FROM "users" WHERE id = $1', [userId]);

    if (existingUser.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = existingUser.rows[0]; // Get the user data

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});


// Edit user details (Admin)
const editUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id;
  const { first_name, last_name, email, password, phone } = req.body;

  try {
    const existingUser = await client.query(
      'SELECT * FROM "users" WHERE id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    let hashedPassword = null;

    // Check if password is provided in the request body
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Update user details, excluding password if not provided
    const updateQuery = `
      UPDATE "users" 
      SET first_name = $2, last_name = $3, email = $4, phone = $5 ${hashedPassword ? ', password = $6' : ''} 
      WHERE id = $1
    `;
    const values = [userId, first_name, last_name, email, phone];
    // If hashedPassword is not null, add it to the values array
    if (hashedPassword) {
      values.push(hashedPassword);
    }
    await client.query(updateQuery, values);

    res
      .status(200)
      .json({ success: true, message: "User details updated successfully" });
  } catch (error) {
    console.error("Error editing user details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
// Delete user (Admin)
const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id;

  try {
    const existingUser = await client.query(
      'SELECT * FROM "users" WHERE id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    // **Cascading Delete with `ON DELETE CASCADE`**
    await client.query('BEGIN'); // Start transaction
    await client.query(
      'DELETE FROM "companies" WHERE created_by = $1',
      [userId]
    );
    await client.query('DELETE FROM assessments WHERE created_by = $1', [userId]);
    // Add similar DELETE statements for other dependent tables
    await client.query('DELETE FROM "users" WHERE id = $1', [userId]);
    await client.query('COMMIT'); // Commit transaction if successful

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    await client.query('ROLLBACK'); // Rollback transaction on error
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = { signup, login, getAllUsers, forgotPassword, resetPassword, logout, getUserDetails, editUser, deleteUser, addUser };