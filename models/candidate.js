// models/candidate.js

const { client } = require("../db/index.js");
const bcrypt = require('bcrypt');

// Number of salt rounds for password hashing
const saltRounds = 10;

const createCandidatesTableQuery = `
    CREATE TABLE IF NOT EXISTS candidate (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR,
        last_name VARCHAR,
        email VARCHAR UNIQUE,
        is_email_verified BOOLEAN DEFAULT FALSE,
        phone VARCHAR,
        is_phone_verified BOOLEAN DEFAULT FALSE,
        password VARCHAR,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

const createCandidateTable = async () => {
    try {
      await client.query(createCandidatesTableQuery);
      console.log("Candidates table created successfully");
    } catch (error) {
      console.error("Error creating candidates table:", error);
    }
  };

// Function to save candidate data in the database
const saveCandidate = async (candidateData) => {
  const {
    first_name,
    last_name,
    email,
    is_email_verified,
    phone,
    is_phone_verified,
    password,
    is_active,
  } = candidateData;
  try {
    // Check if a candidate with the same email already exists
    const existingCandidate = await client.query(
      'SELECT * FROM candidate WHERE email = $1',
      [email]
    );
    if (existingCandidate.rows.length > 0) {
      return { error: 'Candidate with this email already exists' };
    }

     // Check if a candidate with the same email already exists
     const existingemail = await client.query(
        'SELECT * FROM "user" WHERE email = $1',
        [email]
      );
      if (existingemail.rows.length > 0) {
        return { error: 'user with this email already exists' };
      }

    // Hash the candidate's password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO candidate (
        first_name,
        last_name,
        email,
        is_email_verified,
        phone,
        is_phone_verified,
        password,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      first_name,
      last_name,
      email,
      is_email_verified ?? false,
      phone,
      is_phone_verified ?? false,
      hashedPassword, // Save hashed password instead of plain password
      is_active ?? true,
    ];

    const result = await client.query(insertQuery, values);
    console.log("Candidate data saved successfully");
    return result.rows[0]; // Return the inserted candidate data
  } catch (error) {
    console.error("Error saving candidate data:", error);
    throw error;
  }
};

module.exports = { createCandidateTable, saveCandidate };
