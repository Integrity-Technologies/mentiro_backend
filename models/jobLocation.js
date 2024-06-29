// models/jobLocation.js
const { client } = require("../db/index.js");

// Create Job Locations Table Query
const createJobLocationsTableQuery = `
CREATE TABLE IF NOT EXISTS job_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);
`;

// Create Job Locations Table
const createJobLocationsTable = async () => {
  try {
    await client.query(createJobLocationsTableQuery);
    console.log("Job Locations table created successfully");
  } catch (error) {
    console.error("Error creating Job Locations table:", error);
  }
};

// Function to save job location data in the database
const saveJobLocation = async (jobLocationName) => {
  try {
    const existingJobLocation = await client.query(
      'SELECT * FROM job_locations WHERE name = $1',
      [jobLocationName]
    );
    if (existingJobLocation.rows.length > 0) {
        // If a Job Location with the same name already exists, throw an error
        throw new Error(`A work arrangement with the name '${existingJobLocation}' already exists.`);
      }

    const insertQuery = `
      INSERT INTO job_locations (name)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await client.query(insertQuery, [jobLocationName]);
    console.log("Job Location data saved successfully");
    return result.rows[0]; // Return the inserted job location data
  } catch (error) {
    console.error("Error saving job location data:", error);
    throw error;
  }
};


module.exports = { createJobLocationsTable, saveJobLocation };