// models/test.js
const { client } = require("../db/index.js");

// Create Tests Table Query
const createTestsTableQuery = `
CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    test_name VARCHAR(100),
    test_description TEXT,
    categories INTEGER[],
    company_id INTEGER,
    created_by INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES "users"(id)
);
`;

// Create Tests Table
const createTestsTable = async () => {
  try {
    await client.query(createTestsTableQuery);
    console.log("Tests table created successfully");
  } catch (error) {
    console.error("Error creating tests table:", error);
  }
};

// Function to save test data in the database
const saveTest = async (testData) => {
  const {
    test_name,
    test_description,
    categories,
    company_id,
    created_by,
  } = testData;
  try {
    const insertQuery = `
      INSERT INTO tests (
        test_name,
        test_description,
        categories,
        company_id,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      test_name,
      test_description,
      categories,
      company_id,
      created_by,
    ];
    const result = await client.query(insertQuery, values);
    console.log("Test data saved successfully");
    return result.rows[0]; // Return the inserted test data
  } catch (error) {
    console.error("Error saving test data:", error);
    throw error;
  }
};


module.exports = { createTestsTable, saveTest };