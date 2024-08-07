const { client } = require("../db/index.js");

// Create Companies Table Query
const createCompaniesTableQuery = `
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    website VARCHAR(100),
    job_title_id INTEGER REFERENCES job_titles(id),
    company_size_id INTEGER REFERENCES company_size(id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    stripe_customer_id VARCHAR(255),
    plan_id VARCHAR(255),
    FOREIGN KEY (created_by) REFERENCES "users"(id)
);
`;

// Create Companies Table
const createCompanyTable = async () => {
  try {
    await client.query(createCompaniesTableQuery);
    console.log("Companies table created successfully");
  } catch (error) {
    console.error("Error creating companies table:", error);
  }
};

// Function to save company data in the database
const saveCompany = async (companyData) => {
  const {
    name,
    website,
    job_title_id,
    company_size_id,
    created_by,
    is_active,
    stripe_customer_id,
    plan_id,
  } = companyData;
  try {
    const insertQuery = `
      INSERT INTO companies (
        name,
        website,
        job_title_id,
        company_size_id,
        created_by,
        is_active,
        stripe_customer_id,
        plan_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      name,
      website || null,
      job_title_id,
      company_size_id,
      created_by,
      is_active ?? true,
      stripe_customer_id || null,
      plan_id || null,
    ];
    const result = await client.query(insertQuery, values);
    console.log("Company data saved successfully");
    return result.rows[0]; // Return the inserted company data
  } catch (error) {
    console.error("Error saving company data:", error);
    throw error;
  }
};


module.exports = { createCompaniesTableQuery,createCompanyTable, saveCompany };
