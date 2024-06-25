// models/assessment.js
const { client } = require("../db/index.js");

// Create Assessments Table Query
const createAssessmentsTableQuery = `
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    assessment_name VARCHAR(100),
    company_id INTEGER,
    tests JSONB[],
    job_role_id INTEGER REFERENCES job_roles(id),
    work_arrangement_id INTEGER REFERENCES work_arrangements(id),
    job_location_id INTEGER REFERENCES job_locations(id),
    assessment_time INTEGER,
    shareableLink VARCHAR(255),
    uniquelink VARCHAR(255),
    created_by INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES "users"(id)
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
// const saveAssessment = async (assessmentData) => {
//   const {
//     assessment_name,
//     company_id,
//     tests,
//     shareableLink,
//     uniquelink,
//     created_by,
//   } = assessmentData;
//   try {

//    // Check if a link already exists
//    const checkLinkQuery = `
//    SELECT * FROM assessments WHERE shareableLink = $1
//  `;
//  const checkLinkResult = await client.query(checkLinkQuery, [shareableLink]);
//  if (checkLinkResult.rows.length > 0) {
//    return { error: 'Assessment link already exists. Please generate a unique link.' };
//  }

//   // Check if a user with the same email already exists
//   const existingAssessment = await client.query(
//     'SELECT * FROM "assessments" WHERE assessment_name = $1',
//     [assessment_name]
//   );
//   if (existingAssessment.rows.length > 0) {
//     return {error:"Assessment with this name already exists"};
//   }

//     const insertQuery = `
//       INSERT INTO assessments (
//         assessment_name,
//         company_id,
//         tests,
//         shareableLink,
//         uniquelink,
//         created_by
//       )
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *;
//     `;
//     const values = [
//       assessment_name,
//       company_id,
//       tests,
//       shareableLink,
//       uniquelink,
//       created_by,
//     ];
//     const result = await client.query(insertQuery, values);
//     console.log("Assessment data saved successfully");
//     return result.rows[0]; // Return the inserted assessment data
//   } catch (error) {
//     console.error("Error saving assessment data:", error);
//     throw error;
//   }
// };
const saveAssessment = async (assessmentData) => {
  const {
    assessment_name,
    company_id,
    tests,
    shareableLink,
    uniquelink,
    created_by,
    assessment_time,
    job_role_id,
    work_arrangement_id,
    job_location_id
  } = assessmentData;
  try {
    console.log(created_by + " in assessment model");
    // Check if a link already exists
    const checkLinkQuery = `
      SELECT * FROM assessments WHERE shareableLink = $1
    `;
    const checkLinkResult = await client.query(checkLinkQuery, [shareableLink]);
    if (checkLinkResult.rows.length > 0) {
      return { error: 'Assessment link already exists. Please generate a unique link.' };
    }

    // Check if an assessment with the same name already exists
    // const existingAssessment = await client.query(
    //   'SELECT * FROM "assessments" WHERE assessment_name = $1',
    //   [assessment_name]
    // );
    // if (existingAssessment.rows.length > 0) {
    //   return { error: "Assessment with this name already exists" };
    // }


    // assessmentData.tests = JSON.stringify(assessmentData.tests);

    const insertQuery = `
      INSERT INTO assessments (
        assessment_name,
        company_id,
        tests,
        shareableLink,
        uniquelink,
        created_by,
        assessment_time,
        job_role_id,
        work_arrangement_id,
        job_location_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      assessment_name,
      company_id,
      tests,
      shareableLink,
      uniquelink,
      created_by,
      assessment_time,
      job_role_id,
      work_arrangement_id,
      job_location_id
    ];
    const result = await client.query(insertQuery, values);
    console.log("Assessment data saved successfully");
    return result.rows[0]; // Return the inserted assessment data
  } catch (error) {
    console.error("Error saving assessment data:", error);
    throw error;
  }
};

createAssessmentsTable();

module.exports = { createAssessmentsTable, saveAssessment };
