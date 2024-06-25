// models/companySize.js
const { client } = require("../db/index.js");

// Create Company Size Table Query
const createCompanySizeTableQuery = `
CREATE TABLE IF NOT EXISTS company_size (
    id SERIAL PRIMARY KEY,
    size_range VARCHAR(50) NOT NULL UNIQUE
);
`;

// Create Company Size Table
const createCompanySizeTable = async () => {
  try {
    await client.query(createCompanySizeTableQuery);
    console.log("Company Size table created successfully");
  } catch (error) {
    console.error("Error creating Company Size table:", error);
  }
};

// Function to save company size data in the database
const saveCompanySize = async (sizeRange) => {
  try {
    const existingCompanySize = await client.query(
      'SELECT * FROM company_size WHERE size_range = $1',
      [sizeRange]
    );
    if (existingCompanySize.rows.length > 0) {
        // If a company size with the same range already exists, throw an error
        throw new Error(`A company size with the range '${sizeRange}' already exists.`);
    }

    const insertQuery = `
      INSERT INTO company_size (size_range)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await client.query(insertQuery, [sizeRange]);
    console.log("Company Size data saved successfully");
    return result.rows[0]; // Return the inserted company size data
  } catch (error) {
    console.error("Error saving company size data:", error);
    throw error;
  }
};

createCompanySizeTable();

module.exports = { createCompanySizeTable, saveCompanySize };
