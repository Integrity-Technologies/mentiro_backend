// models/result.js
const { client } = require("../db/index.js");

// Create Results Table Query
const createResultsTableQuery = `
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER,
    test_id INTEGER,
    questions JSONB[],
    score INTEGER,
    assessment_id INTEGER,
    company_id INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
`;

// score INTEGER,

// Create Results Table
const createResultsTable = async () => {
  try {
    await client.query(createResultsTableQuery);
    console.log("Results table created successfully");
  } catch (error) {
    console.error("Error creating results table:", error);
  }
};

// Function to save result data in the database
const saveResult = async (resultData) => {
  const {
    candidate_id,
    test_id,
    questions,
    score,
    assessment_id,
    company_id
  } = resultData;
  try {

    const insertQuery = `
      INSERT INTO results (
        candidate_id,
        test_id,
        questions,
        score,
        assessment_id,
        company_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      candidate_id,
      test_id,
      questions,
      score,
      assessment_id,
      company_id
    ];
    const result = await client.query(insertQuery, values);
    console.log("Result data saved successfully");
    return result.rows[0]; // Return the inserted result data
  } catch (error) {
    console.error("Error saving result data:", error);
    throw error;
  }
};

// Function to update result data in the database
const updateResult = async (resultId, questions, score) => {
  try {
    const updateQuery = `
      UPDATE results
      SET questions = $1,
          score = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const values = [questions, score, resultId];
    const result = await client.query(updateQuery, values);
    if (result.rows.length === 0) {
      throw new Error("Result not found");
    }
    console.log("Result data updated successfully");
    return result.rows[0]; // Return the updated result data
  } catch (error) {
    console.error("Error updating result data:", error);
    throw error;
  }
};

// Function to get result by ID
// Function to get result by ID
const getResultById = async (resultId) => {
  try {
    const query = `
      SELECT * FROM results WHERE id = $1
    `;
    const values = [resultId];
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Result not found");
    }
    // Ensure that questions is initialized as an array
    if (!Array.isArray(result.rows[0].questions)) {
      result.rows[0].questions = [];
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};


module.exports = { createResultsTable, saveResult, getResultById, updateResult };
