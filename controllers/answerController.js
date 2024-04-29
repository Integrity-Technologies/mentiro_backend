// controllers/answerController.js
const answerModel = require("../models/answer");

// function to verify the answer
const verifyAnswer = async (question_id, option) => {
    try {
      // Fetch answer model by question ID
      const answer = await answerModel.getAnswerByQuestionId(question_id);
      if (!answer) {
        throw new Error("Answer not found for the question");
      }
  
      let options = answer.options;
  
      // Parse options if it's a string (JSON)
      if (typeof options === 'string') {
        options = JSON.parse(options);
      }
  
      // Check if the submitted option matches any of the correct options
      const is_correct = options.some((opt) => opt.option_text === option);
  
      return { answer_id: answer.id, is_correct: is_correct ? 1 : 0 };
    } catch (error) {
      throw error;
    }
  };

module.exports = { verifyAnswer };
