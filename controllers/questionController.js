// question controller 
const { saveQuestion, createQuestionTable } = require('../models/question');
const { saveAnswer, createAnswersTable } = require('../models/answer');
const analytics = require('../segment/segmentConfig');
const { client } = require('../db/index');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { sendErrorResponse } = require("../utils/res_error");
const { validationResult, body } = require('express-validator');

// Validate Question Input
const validateQuestionInput = [
  body('question_text')
    .notEmpty().withMessage('Question text is required')
    .isString().withMessage('Question text must be a string')
    .trim()
    .escape(),
  
  body('difficulty_level')
    .notEmpty().withMessage('Difficulty level is required')
    .isString().withMessage('Difficulty level must be a string')
    .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty level must be one of easy, medium, hard')
    .trim()
    .escape(),

  body('category_names')
    .isArray({ min: 1 }).withMessage('Category names must be an array with at least one category')
    .custom((categories) => {
      if (categories.some(name => typeof name !== 'string' || name.trim() === '')) {
        throw new Error('Each category name must be a non-empty string');
      }
      return true;
    }),

  body('options')
    .isArray({ min: 1 }).withMessage('Options must be an array with at least one option')
    // .custom((options) => {
    //   if (options.some(option => typeof option.option_text !== 'string' || typeof option.is_correct !== 'boolean')) {
    //     throw new Error('Each option must have a string "option_text" and a boolean "is_correct"');
    //   }
    //   return true;
    // }),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Function to find category IDs by names
const findCategoryIdsByName = async (categoryNames) => {
  try {
    const categoryIds = [];
    for (const categoryName of categoryNames) {
      const result = await client.query('SELECT id FROM "categories" WHERE category_name = $1', [categoryName]);
      if (result.rows.length > 0) {
        categoryIds.push(result.rows[0].id);
      } else {
        throw new Error(`Category '${categoryName}' not found`);
      }
    }
    return categoryIds;
  } catch (error) {
    console.error('Error finding category IDs by name:', error);
    throw error;
  }
};

// Create Question and Answer
const createQuestionAndAnswer = [
  ...validateQuestionInput,
  handleValidationErrors,
  catchAsyncErrors(async (req, res) => {
  await createQuestionTable();
  await createAnswersTable();

  const { question_text, difficulty_level, category_names, options, question_type } = req.body;

    // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

  // Check if the question already exists
  const existingQuestion = await client.query('SELECT id FROM questions WHERE question_text = $1', [question_text]);
  if (existingQuestion.rows.length > 0) {
    return sendErrorResponse(res, 400, "Question with the same text already exists");
  }

  // Find category IDs by names
  const categoryIds = await findCategoryIdsByName(category_names);

  // Save question
  const questionData = {
    question_text,
    question_type,
    difficulty_level,
    categories: categoryIds,
    created_by: req.user.id,
    is_active: true,
    is_custom: false,
  };
  const newQuestion = await saveQuestion(questionData);
  const questionId = newQuestion.id;

  // Format options array
const formattedOptions = options.map(option => ({
  is_correct: option.is_correct,
  option_text: typeof option.option_text === 'string' ? option.option_text.trim() : option.option_text // Trim if it's a string
}));

  // Prepare answer data
  const answerData = {
    question_id: questionId,
    options: formattedOptions,
    created_by: req.user.id,
  };

  analytics.track({
    userId: String(req.user?.id || 'anonymous'),
    event: 'Question Created',
    properties: {
      question_id: questionId,
      question_text,
      difficulty_level,
      categories: category_names,
    }
  });

  // Save answer
  const answer = await saveAnswer(answerData);

  res.status(201).json({ success: true, message: "Question created successfully", question_id: questionId, answer });
})
];

// Get All Questions
const getAllQuestion = catchAsyncErrors(async (req, res) => {
  const result = await client.query('SELECT * FROM questions');
  const questions = result.rows;

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

  if (questions.length === 0) {
    return sendErrorResponse(res, 400, "Questions not found");
  }

  const categoriesMap = new Map();
  for (const question of questions) {
    const categoryIds = question.categories.filter(Boolean);
    if (categoryIds.length > 0) {
      const categoryResult = await client.query('SELECT id, category_name FROM "categories" WHERE id = ANY($1)', [categoryIds]);
      categoryResult.rows.forEach(category => {
        categoriesMap.set(category.id, category.category_name);
      });
    }
  }

  const QuestionsWithNames = questions.map(question => ({
    ...question,
    categories: question.categories.filter(Boolean).map(categoryId => categoriesMap.get(categoryId))
  }));

  analytics.track({
    userId: String(req.user?.id || 'anonymous'),
    event: 'Questions Fetched',
    properties: {
      question_count: QuestionsWithNames.length,
    }
  });

  res.status(200).json(QuestionsWithNames);
});

// Delete Question
const deleteQuestion = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;

  const checkResult = await client.query('SELECT * FROM questions WHERE id = $1', [id]);

  if (checkResult.rows.length === 0) {
    return sendErrorResponse(res, 404, "Question not found");
  }

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

  await client.query('BEGIN');
  await client.query('DELETE FROM answers WHERE question_id = $1', [id]);
  const result = await client.query('DELETE FROM questions WHERE id = $1 RETURNING *', [id]);
  await client.query('COMMIT');

  const deletedQuestion = result.rows[0];

  analytics.track({
    userId: String(req.user?.id || 'anonymous'),
    event: 'Question Deleted',
    properties: {
      question_id: id,
      question_text: deletedQuestion.question_text,
    }
  });

  res.status(200).json({ message: "Question deleted successfully", deletedQuestion });
});

// Update Question
const updateQuestion = [ 
  ...validateQuestionInput,
  handleValidationErrors,
  catchAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const { question_text, difficulty_level, category_names, options } = req.body;

  const questionResult = await client.query('SELECT * FROM questions WHERE id = $1', [id]);

  if (questionResult.rows.length === 0) {
    return sendErrorResponse(res, 404, "Question not found");
  }

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

  const question = questionResult.rows[0];
  const updatedCategoryIds = await findCategoryIdsByName(category_names);

  // Check if there's anything to update
  // if (
  //   question_text === question.question_text &&
  //   difficulty_level === question.difficulty_level &&
  //   JSON.stringify(updatedCategoryIds.sort()) === JSON.stringify(question.categories.sort()) &&
  //   JSON.stringify(options.sort((a, b) => a.option_text.localeCompare(b.option_text))) === JSON.stringify(question.options.sort((a, b) => a.option_text.localeCompare(b.option_text)))
  // ) {
  //   return sendErrorResponse(res, 400, "No changes to update");
  // }

  // Update question details
  const updateQuery = `
    UPDATE questions 
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
  const updatedQuestion = result.rows[0];

  // Update options
  await client.query('DELETE FROM answers WHERE question_id = $1', [id]);

  const formattedOptions = options.map(option => ({
    is_correct: option.is_correct,
    option_text: option.option_text.trim().escape()
  }));

  const answerData = {
    question_id: id,
    options: formattedOptions,
    created_by: req.user.id,
  };
  await saveAnswer(answerData);

  analytics.identify({
    userId: String(req.user?.id || 'anonymous'),
    traits: {
      updated_question_id: updatedQuestion.id,
      updated_question_text: updatedQuestion.question_text,
    }
  });

  analytics.track({
    userId: String(req.user?.id || 'anonymous'),
    event: 'Question Updated',
    properties: {
      question_id: updatedQuestion.id,
      question_text,
      difficulty_level,
      categories: category_names,
      updated_by: id,
    }
  });

  res.status(200).json(updatedQuestion);
})
]

// Get Question by ID
const getQuestionById = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;

  const questionResult = await client.query('SELECT * FROM questions WHERE id = $1', [id]);

  if (questionResult.rows.length === 0) {
    // return res.status(404).json({ error: "Question not found" });
    return sendErrorResponse(res, 404, "Question not found");
  }

  const question = questionResult.rows[0];
  const answerResult = await client.query('SELECT * FROM answers WHERE question_id = $1', [id]);

  const response = {
    ...question,
    options: answerResult.rows.length > 0 ? answerResult.rows[0].options : []
  };

  res.status(200).json(response);
});

module.exports = { createQuestionAndAnswer, getAllQuestion, deleteQuestion, updateQuestion, getQuestionById };

