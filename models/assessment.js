// models/assessment.js
const { client } = require("../db/index.js");

// Create Assessments Table Query
const createAssessmentsTableQuery = `
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    assessment_name VARCHAR(100),
    company_id INTEGER,
    tests INTEGER[],
    link VARCHAR(255),
    created_by INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES "user"(id)
);
`;

// Create Assessments Table
const createAssessmentsTable = async () => {
  try {
    await client.query(createAssessmentsTableQuery);
    console.log("Assessments table created successfully");
  } catch (error) {
    console.error("Error creating Assessments table:", error);
  }
};

// Function to save assessment data in the database
const saveAssessment = async (assessmentData) => {
  const {
    assessment_name,
    company_id,
    tests,
    link,
    created_by,
  } = assessmentData;
  try {

   // Check if a link already exists
   const checkLinkQuery = `
   SELECT * FROM assessments WHERE link = $1
 `;
 const checkLinkResult = await client.query(checkLinkQuery, [link]);
 if (checkLinkResult.rows.length > 0) {
   return { error: 'Assessment link already exists. Please generate a unique link.' };
 }

  // Check if a user with the same email already exists
  const existingAssessment = await client.query(
    'SELECT * FROM "assessments" WHERE assessment_name = $1',
    [assessment_name]
  );
  if (existingAssessment.rows.length > 0) {
    return {error:"Assessment with this name already exists"};
  }

    const insertQuery = `
      INSERT INTO assessments (
        assessment_name,
        company_id,
        tests,
        link,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      assessment_name,
      company_id,
      tests,
      link,
      created_by,
    ];
    const result = await client.query(insertQuery, values);
    console.log("Assessment data saved successfully");
    return result.rows[0]; // Return the inserted assessment data
  } catch (error) {
    console.error("Error saving assessment data:", error);
    throw error;
  }
};

module.exports = { createAssessmentsTable, saveAssessment };