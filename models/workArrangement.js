// models/workArrangement.js
const { client } = require("../db/index.js");

// Create Work Arrangements Table Query
const createWorkArrangementsTableQuery = `
CREATE TABLE IF NOT EXISTS work_arrangements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);
`;

// Create Work Arrangements Table
const createWorkArrangementsTable = async () => {
  try {
    await client.query(createWorkArrangementsTableQuery);
    console.log("Work Arrangements table created successfully");
  } catch (error) {
    console.error("Error creating Work Arrangements table:", error);
  }
};

// Function to save work arrangement data in the database
const saveWorkArrangement = async (workArrangementName) => {
    try {
      const existingWorkArrangement = await client.query(
        'SELECT * FROM work_arrangements WHERE name = $1',
        [workArrangementName]
      );
      if (existingWorkArrangement.rows.length > 0) {
        // If a work arrangement with the same name already exists, throw an error
        throw new Error(`A work arrangement with the name '${workArrangementName}' already exists.`);
      }
  
      const insertQuery = `
        INSERT INTO work_arrangements (name)
        VALUES ($1)
        RETURNING *;
      `;
      const result = await client.query(insertQuery, [workArrangementName]);
      console.log("Work Arrangement data saved successfully");
      return result.rows[0]; // Return the inserted work arrangement data
    } catch (error) {
      console.error("Error saving work arrangement data:", error);
      // If there is an error (including the validation error), throw it so it can be handled by the caller
      throw error;
    }
  };


module.exports = { createWorkArrangementsTable, saveWorkArrangement };