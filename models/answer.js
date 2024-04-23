// models/answer.js
const { client } = require("../db/index.js");

// Create Answers Table Query
const createAnswersTableQuery = `
CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER,
    options JSONB[],
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES "user"(id),
    FOREIGN KEY (question_id) REFERENCES "question"(id)
);
`;

// Create Answers Table
const createAnswersTable = async () => {
  try {
    await client.query(createAnswersTableQuery);
    console.log("Answers table created successfully");
  } catch (error) {
    console.error("Error creating answers table:", error);
  }
};

// Function to save answer data in the database
const saveAnswer = async (answerData) => {
  const {
    question_id,
    options,
    created_by,
  } = answerData;
  try {

// Check if the question with the same text already exists
const checkQuery = `
SELECT * FROM answers WHERE question_id = $1
`;
const checkResult = await client.query(checkQuery, [question_id]);
if (checkResult.rows.length > 0) {
  return { error: 'Answer for this question already exists' };
}

    const insertQuery = `
      INSERT INTO answers (
        question_id,
        options,
        created_by
      )
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [
      question_id,
      options,
      created_by,
    ];
    const result = await client.query(insertQuery, values);
    console.log("Answer data saved successfully");
    return result.rows[0]; // Return the inserted answer data
  } catch (error) {
    console.error("Error saving answer data:", error);
    throw error;
  }
};

module.exports = { createAnswersTable, saveAnswer };
