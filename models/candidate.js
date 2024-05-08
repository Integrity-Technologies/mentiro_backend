// models/candidate.js

const { client } = require("../db/index.js");

const createCandidatesTableQuery = `
    CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR,
        last_name VARCHAR,
        email VARCHAR UNIQUE,
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
    is_active,
  } = candidateData;
  try {
    // Check if a candidate with the same email already exists
    const existingCandidate = await client.query(
      'SELECT * FROM candidates WHERE email = $1',
      [email]
    );
    if (existingCandidate.rows.length > 0) {
      return { error: 'Candidate with this email already exists' };
    }

    const insertQuery = `
      INSERT INTO candidates (
        first_name,
        last_name,
        email,
        is_active
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      first_name,
      last_name,
      email,
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
