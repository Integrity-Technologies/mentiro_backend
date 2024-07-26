//model/question.js
const { client } = require("../db/index.js");

// -- Create Question Table
const createQuestionTableQuery = `
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question_text VARCHAR NOT NULL,
    question_type VARCHAR CHECK (question_type IN ('MCQS', 'true_false')),
    difficulty_level VARCHAR CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    categories INTEGER[],
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    is_custom BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES "users"(id)
);
`;

const createQuestionTable = async () => {
  try {
    await client.query(createQuestionTableQuery);
    console.log("Question table created successfully");
  } catch (error) {
    console.error("Error creating Question table:", error);
  }
};

// Function to save question data in the database
const saveQuestion = async (questionData) => {
  const {
    question_text,
    question_type,
    difficulty_level,
    categories,
    created_by,
    is_active,
    is_custom,
    question_time
  } = questionData;
  try {
    
    const insertQuery = `
      INSERT INTO questions (
        question_text,
        question_type,
        difficulty_level,
        categories,
        created_by,
        is_active,
        is_custom,
        question_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      question_text,
      question_type,
      difficulty_level,
      categories,
      created_by,
      is_active ?? true,
      is_custom ?? false,
      question_time
    ];
    const result = await client.query(insertQuery, values);
    console.log("Question data saved successfully");
    return result.rows[0]; // Return the inserted question data
  } catch (error) {
    console.error("Error saving Question data:", error);
    throw error;
  }
};


module.exports = { createQuestionTableQuery,createQuestionTable, saveQuestion };