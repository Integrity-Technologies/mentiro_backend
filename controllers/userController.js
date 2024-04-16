// controllers/userController.js

const { createUserTable, saveUser } = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { client } = require("../db/index.js");
const {sendToken} = require("../utils/jwtToken");
const saltRounds = 10;


const signup = async (req, res) => {
  const { first_name, last_name, email, is_email_verified, phone, is_phone_verified, password, permissions, is_active, is_employee } =
    req.body;
    
    await createUserTable();

// Check if a user with the same email already exists
 const existingUser = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);
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
      password:hashedPassword,
      permissions,
      is_active,
      is_employee,
    });
    // Check if result is not empty before sending response
    // if (result) {
    //   res.status(201).json(result);
    // } else {
    //   res.status(500).json({ error: "Failed to save user data" });
    // }
    // res.status(201).json({ message: "User created successfully" });
    sendToken(result, 201, res);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists with the provided email
  try {
    const existingUser = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);

    if (existingUser.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = existingUser.rows[0]; // Get the user data

    // Compare hashed password with provided password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Login successful, generate and send token
    sendToken(user, 200, res); // Status code changed to 200 for successful login
  } catch (error) {
    console.error("Error occurred during login:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await client.query('SELECT * FROM "user"');

    res.status(200).json(users.rows); // Return all user data in the response
  } catch (error) {
    console.error("Error occurred while fetching users:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
module.exports = { signup,login,getAllUsers };
