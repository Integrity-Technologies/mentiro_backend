// controllers/answerController.js
const {getAnswerByQuestionId} = require("../models/answer");
const analytics = require('../segment/segmentConfig');
const { client } = require("../db/index.js");

// function to verify the answer
const verifyAnswer = async (question_id, option) => {
  try {
    // Fetch answer model by question ID
    const answer = await getAnswerByQuestionId(question_id);
    if (!answer) {
      throw new Error("Answer not found for the question");
    }

    let options = answer.options;

    // Parse options if it's a string (JSON)
    if (typeof options === 'string') {
      options = JSON.parse(options);
    }

    // Check if the submitted option matches any of the correct options
    const selectedOption = options.find(opt => opt.option_text === option);
    if (!selectedOption) {
      return { answer_id: answer.id, is_correct: 0 }; // If the option doesn't exist in the answer, it's incorrect
    }

    return { answer_id: answer.id, is_correct: selectedOption.is_correct ? 1 : 0 };
  } catch (error) {
    throw error;
  }
};



   // get all answers (Admin)
const getAllAnswers = async (req, res, next) => {
  try {
    // Fetch all answers from the database
    const answers = await client.query('SELECT * FROM "answers"');

    analytics.track({
      // userId: req.user.id.toString(),  // we have to test that user id is still access in this function while calling from another controller
      userId: String(req.user?.id || 'anonymous'),
      event: 'Answers Fetched',
      properties: {
        question_count: answers.length,
      }
    });

    res.status(200).json(answers.rows); // Return all user data in the response
  } catch (error) {
    console.error("Error occurred while fetching answers:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
module.exports = { verifyAnswer, getAllAnswers };
