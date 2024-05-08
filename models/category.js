//model/category.js
const { client } = require("../db/index.js");

// -- Create Category Table
const createCategoryTableQuery = `
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR NOT NULL,
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES "users"(id)
);
`;

const createCategoryTable = async () => {
  try {
    await client.query(createCategoryTableQuery);
    console.log("Category table created successfully");
  } catch (error) {
    console.error("Error creating Category table:", error);
  }
};


// Function to save company data in the database
const saveCategory = async (categoryData) => {
  const {
    category_name,
    created_by,
    is_active
  } = categoryData;
  try {
    const insertQuery = `
      INSERT INTO categories (
        category_name,
        created_by,
        is_active
      )
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [
      category_name,
      created_by,
      is_active ?? true
    ];
    const result = await client.query(insertQuery, values);
    console.log("Category data saved successfully");
    return result.rows[0]; // Return the inserted company data
  } catch (error) {
    console.error("Error saving Category data:", error);
    throw error;
  }
};

module.exports = { createCategoryTable, saveCategory };