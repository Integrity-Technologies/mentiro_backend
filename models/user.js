// models/user.js

const { client } = require("../db/index.js");

const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS "users" (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR,
        last_name VARCHAR,
        email VARCHAR UNIQUE,
        is_email_verified BOOLEAN DEFAULT FALSE,
        phone VARCHAR,
        is_phone_verified BOOLEAN DEFAULT FALSE,
        password VARCHAR,
        permissions BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        is_employee BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reset_token VARCHAR,
        reset_token_expiry TIMESTAMP 
    )
    `;

const createUserTable = async () => {
  try {
    await client.query(createUsersTableQuery);
    console.log("Users table created successfully");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

// // JWT TOKEN
// userSchema.methods.getJWTToken = function () {
//   return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// };

// Function to save user data in the database
const saveUser = async (userData) => {
  const {
    first_name,
    last_name,
    email,
    is_email_verified,
    phone,
    is_phone_verified,
    password,
    permissions,
    is_active,
    is_employee,
  } = userData;
  try {
    // Check if a user with the same email already exists
    const existingUser = await client.query(
      'SELECT * FROM "users" WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return { error: 'User with this email already exists' };
    }
    // Convert company_id to an array if it's not already
    // const updated_company_id = Array.isArray(company_id)
    //   ? company_id
    //   : [company_id];
    const insertQuery = `
      INSERT INTO "users" (
        first_name,
        last_name,
        email,
        is_email_verified,
        phone,
        is_phone_verified,
        password,
        permissions,
        is_active,
        is_employee,
        reset_token,
        reset_token_expiry
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    //  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    const values = [
      first_name,
      last_name,
      email,
      is_email_verified ?? false,
      phone,
      is_phone_verified ?? false,
      password,
      permissions ?? false,
      is_active ?? true,
      is_employee ?? false,
      userData.reset_token || null, // Set to null if not provided
      userData.reset_token_expiry || null, // Set to null if not provided
    ];
    console.log("🚀 ~ saveUser ~ values:", values);
    const result = await client.query(insertQuery, values);
    console.log("User data saved successfully");
    return result.rows[0]; // Return the inserted user data
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

module.exports = { createUserTable, saveUser };
