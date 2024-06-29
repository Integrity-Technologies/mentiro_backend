// models/jobTitle.js
const { client } = require("../db/index.js");

// Create Job Titles Table Query
const createJobTitlesTableQuery = `
CREATE TABLE IF NOT EXISTS job_titles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    custom BOOLEAN DEFAULT false
);
`;

// Create Job Titles Table
const createJobTitlesTable = async () => {
  try {
    await client.query(createJobTitlesTableQuery);
    console.log("Job Titles table created successfully");
  } catch (error) {
    console.error("Error creating Job Titles table:", error);
  }
};

// Function to save job title data in the database
const saveJobTitle = async (title) => {
  try {
    const existingJobTitle = await client.query(
      'SELECT * FROM job_titles WHERE title = $1',
      [title]
    );
    if (existingJobTitle.rows.length > 0) {
        // If a job title with the same name already exists, throw an error
        throw new Error(`A job title with the name '${title}' already exists.`);
    }

    const insertQuery = `
      INSERT INTO job_titles (title)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await client.query(insertQuery, [title]);
    console.log("Job Title data saved successfully");
    return result.rows[0]; // Return the inserted job title data
  } catch (error) {
    console.error("Error saving job title data:", error);
    throw error;
  }
};


module.exports = { createJobTitlesTable, saveJobTitle };
