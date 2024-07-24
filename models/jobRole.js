// models/jobRole.js
const { client } = require("../db/index.js");

// Create Job Roles Table Query
const createJobRolesTableQuery = `
CREATE TABLE IF NOT EXISTS job_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);
`;

// Create Job Roles Table
const createJobRolesTable = async () => {
  try {
    await client.query(createJobRolesTableQuery);
    console.log("Job Roles table created successfully");
  } catch (error) {
    console.error("Error creating Job Roles table:", error);
  }
};

// Function to save job role data in the database
const saveJobRole = async (jobRoleName) => {
  try {
    const existingJobRole = await client.query(
      'SELECT * FROM job_roles WHERE name = $1',
      [jobRoleName]
    );
    if (existingJobRole.rows.length > 0) {
        // If a Job Role with the same name already exists, throw an error
        throw new Error(`A work arrangement with the name '${existingJobRole}' already exists.`);
      }

    const insertQuery = `
      INSERT INTO job_roles (name)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await client.query(insertQuery, [jobRoleName]);
    console.log("Job Role data saved successfully");
    return result.rows[0]; // Return the inserted job role data
  } catch (error) {
    console.error("Error saving job role data:", error);
    throw error;
  }
};


module.exports = { createJobRolesTableQuery,createJobRolesTable, saveJobRole };