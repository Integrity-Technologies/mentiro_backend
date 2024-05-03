const { saveQuestion, createQuestionTable } = require('../models/question');
const { saveAnswer, createAnswersTable } = require('../models/answer');
const { client } = require('../db/index');

// Function to find category IDs by names
const findCategoryIdsByName = async (categoryNames) => {
  try {
    const categoryIds = [];

    for (const categoryName of categoryNames) {
      const result = await client.query('SELECT id FROM "category" WHERE category_name = $1', [categoryName]);
      if (result.rows.length > 0) {
        categoryIds.push(result.rows[0].id);
      } else {
        throw new Error(`Category '${categoryName}' not found`);
      }
    }

    return categoryIds;
  } catch (error) {
    throw error;
  }
};

const createQuestionAndAnswer = async (req, res) => {
  try {
    await createQuestionTable();
    await createAnswersTable();

    const { question_text, difficulty_level, category_names, options } = req.body;

    // Validate request data
    if (!question_text || !difficulty_level || !category_names || !options) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find category IDs by names
    const categoryIds = await findCategoryIdsByName(category_names);

    // Check if the question already exists
    const existingQuestion = await client.query('SELECT id FROM question WHERE question_text = $1', [question_text]);
    let questionId;
    if (existingQuestion.rows.length > 0) {
      // If the question already exists, use its ID
      questionId = existingQuestion.rows[0].id;
    } else {
      // Save question if it does not exist
      const questionData = {
        question_text,
        question_type: 'MCQS', // Assuming multiple-choice questions
        difficulty_level,
        categories: categoryIds,
        created_by: req.user.id, // Assuming user ID is extracted from authentication middleware
        is_active: true,
        is_custom: false,
      };
      const newQuestion = await saveQuestion(questionData);
      questionId = newQuestion.id;
    }

     // Format options array
    const formattedOptions = options.map(option => ({
      is_correct: option.is_correct,
      option_text: option.option_text
    }));

    // Prepare answer data
    const answerData = {
      question_id: questionId,
      options: formattedOptions, // Assuming options are provided in the request body
      created_by: req.user.id, // Assuming user ID is extracted from authentication middleware
    };

    // Save answer
    const answer = await saveAnswer(answerData);

    res.status(201).json({ question_id: questionId, answer });
  } catch (error) {
    console.error('Error creating question and answer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// get ALL questions
const getAllQuestion = async (req, res) => {
    try {
      const getAllQuery = `
              SELECT * FROM question;
          `;
      const result = await client.query(getAllQuery);
  
      const questions = result.rows;
      res.status(200).json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Could not fetch questions" });
    }
  };

// Delete question
const deleteQuestion = async (req, res) => {
  const { id } = req.params; // Access ID from req.params

  try {
    // Check if the question exists
    const checkQuery = `
      SELECT * FROM question 
      WHERE id = $1;
    `;
    const checkValues = [id];
    const checkResult = await client.query(checkQuery, checkValues);

    // If the question does not exist, return 404
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Use the ID to delete the question
    const deleteQuery = `
      DELETE FROM question 
      WHERE id = $1 
      RETURNING *;
    `;
    const values = [id];

    // **Cascading Delete with `ON DELETE CASCADE`**
    await client.query('BEGIN'); // Start transaction
    // Delete answers related to the question
    await client.query(
      'DELETE FROM answers WHERE question_id = $1',
      [id]
    );
    // Delete the question itself
    const result = await client.query(deleteQuery, values);
    await client.query('COMMIT'); // Commit transaction if successful

    const deletedQuestion = result.rows[0];
    res.status(200).json({ message: "Question deleted successfully", deletedQuestion });
  } catch (error) {
    console.error("Error deleting question:", error);
    await client.query('ROLLBACK'); // Rollback transaction on error
    res.status(500).json({ error: "Could not delete question" });
  }
};

  // Update Question
  const updateQuestion = async (req, res) => {
    const { id } = req.params;
    const { question_text, difficulty_level, category_names } = req.body;
  
    try {
      // Fetch the existing question data from the database
      const existingQuestion = await getQuestionById(id);
  
      if (!existingQuestion) {
        return res.status(404).json({ error: "Question not found" });
      }
  
      // Find category IDs for the updated category names
      const updatedCategoryIds = await findCategoryIdsByName(category_names);
  
      // Compare the updated fields with existing data
      if (
        question_text === existingQuestion.question_text &&
        difficulty_level === existingQuestion.difficulty_level &&
        JSON.stringify(updatedCategoryIds.sort()) === JSON.stringify(existingQuestion.categories.sort())
      ) {
        return res.status(400).json({ error: "No changes to update" });
      }
  
      const updateQuery = `
        UPDATE question 
        SET 
            question_text = $1,
            difficulty_level = $2,
            categories = $3,
            updated_date = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *;
      `;
      const values = [question_text, difficulty_level, updatedCategoryIds, id];
  
      const result = await client.query(updateQuery, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Question not found" });
      }
  
      const updatedQuestion = result.rows[0];
      res.status(200).json(updatedQuestion);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ error: "Could not update question" });
    }
  };
  
  // Get question by ID
const getQuestionById = async (id) => {
  // const { id } = req.params;

  try {
    const query = `
      SELECT * FROM question
      WHERE id = $1;
    `;
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    return result.rows[0]; // Return the question object
    // const question = result.rows[0];
    // res.status(200).json(question);

  } catch (error) {
    console.error("Error fetching question by ID:", error);
    res.status(500).json({ error: "Could not fetch question by ID" });
  }
};


module.exports = { createQuestionAndAnswer, getAllQuestion, deleteQuestion, updateQuestion, getQuestionById };
