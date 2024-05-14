const { createAssessmentsTable, saveAssessment } = require("../models/assessment");
const { client } = require("../db/index.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Function to generate a unique random string
const generateUniqueLink = async () => {
  let link;
  let shareableLink; // Define shareableLink outside the loop
  let checkLinkResult;
  do {
    link = Math.random().toString(36).substring(2, 15);
    shareableLink = `http://localhost:3000/api/Assessments/assessment?uniqueLink=${link}`; // Use link instead of undefined variable shareableLink
    const checkLinkQuery = `
      SELECT * FROM assessments WHERE uniquelink = $1
    `;
    checkLinkResult = await client.query(checkLinkQuery, [link]);
  } while (checkLinkResult.rows.length > 0);
  return { link, shareableLink }; // Return shareableLink after the loop
};


// Function to find company ID by name
const findCompanyIdByName = async (companyName) => {
  try {
    const result = await client.query('SELECT id FROM "companies" WHERE name = $1', [companyName]);
    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      // Handle the case if a company with the provided name does not exist
      throw new Error(`Company '${companyName}' not found`);
    }
  } catch (error) {
    throw error;
  }
};


 const QUESTION_TIME_PER_MINUTE = 1; // Assuming each question takes 1 minute
 const findTestIdsByName = async (tests) => {
  try {
    const processedTests = [];

    for (const test of tests) {
      const { test_name, test_difficulty } = test;

      // Find test details by name (including categories)
      const testResult = await client.query('SELECT id, categories FROM "tests" WHERE test_name = $1', [test_name]);

      if (testResult.rows.length === 0) {
        throw new Error(`Test '${test_name}' not found`);
      }

      const testId = testResult.rows[0].id;
      const categories = testResult.rows[0].categories;

      // Find questions based on categories
      const questionsQuery = `
        SELECT *
        FROM questions
        WHERE categories && $1::integer[]
      `;
      const questionsValues = [categories];
      const questionsResult = await client.query(questionsQuery, questionsValues);
      console.log('Categories:', categories);
      console.log('Questions Result:', questionsResult.rows);

      // Ensure questionsResult.rows is iterable (i.e., an array)
      if (!Array.isArray(questionsResult.rows)) {
        throw new Error('Unexpected result: questionsResult.rows is not an array');
      }

      // Prepare a dictionary to store filtered questions by difficulty
      const filteredQuestions = {
        easy: [],
        medium: [],
        hard: [],
      };

      // Filter questions based on difficulty and user request (embedded in test_difficulty)
      const addedQuestionsCount = { easy: 0, medium: 0, hard: 0 }; // Track the number of questions added for each difficulty
      for (const question of questionsResult.rows) {
        // console.log(question[0] + " this is question from for loop");
        const { difficulty_level } = question;
        console.log(difficulty_level);
        const requestedCount = test_difficulty[difficulty_level] || 0;
        console.log(requestedCount);
        if (addedQuestionsCount[difficulty_level] < requestedCount) {
          filteredQuestions[difficulty_level].push(question);
          addedQuestionsCount[difficulty_level]++;
        }
      }

      // Calculate total questions and time based on filtered results
      const totalQuestions = Object.values(filteredQuestions).reduce((sum, arr) => sum + arr.length, 0);
      let totalTime = 0;
      if (totalQuestions > 0) {
        totalTime = totalQuestions * QUESTION_TIME_PER_MINUTE; // Using the defined constant
      }

      // Prepare test data object with filtered questions
      const testData = {
        test_name,
        test_difficulty,
        questions: Object.values(filteredQuestions).flat().map(question => ({
          question_id: question.id,
        })),
        total_questions: totalQuestions,
        total_time: totalTime,
      };

      console.log(testData);
      console.log(filteredQuestions);
      processedTests.push(testData);
    }

    return processedTests;
  } catch (error) {
    throw error;
  }
};





const getAssessmentByLink = catchAsyncErrors(async (req, res) => {
  try {
    const { uniqueLink } = req.params;
    const query = `
        SELECT * FROM assessments
        WHERE uniquelink = $1`;
    const values = [uniqueLink];
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching Assessment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


 
// Create Assessment
const createAssessment = async (req, res, next) => {
  try {
    await createAssessmentsTable();

    const { assessment_name, company_name, tests } = req.body;

    if (!assessment_name || !company_name || !Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({ error: 'Invalid request data. Missing or incorrect format for tests array.' });
    }

    const companyId = await findCompanyIdByName(company_name);
    const processedTests = await findTestIdsByName(tests);
    console.log(processedTests);
    // Calculate total time for all tests
    const assessmentTime = processedTests.reduce((totalTime, test) => {
      return totalTime + test.total_time; // Assuming each test has a 'total_time' property
    }, 0);
    console.log(req.user.id + " this is user id i am getting");
    const assessmentData = {
      assessment_name,
      company_id: companyId,
      tests: processedTests,
      shareableLink: (await generateUniqueLink()).shareableLink,
      uniquelink: (await generateUniqueLink()).link,
      created_by: req.user.id,
      // assessment_time: processedTests.reduce((acc, test) => acc + test.test_difficulty.easy + test.test_difficulty.medium + test.test_difficulty.hard, 0) * QUESTION_TIME_PER_MINUTE,
      assessment_time:assessmentTime
    };

    const assessment = await saveAssessment(assessmentData);
    res.status(201).json({ assessment });
  } catch (error) {
    console.error("Error creating Assessment:", error.message);
    res.status(500).json({ error: "Error creating Assessment" });
  }
};


// Get all assessments
const getAllAssessments = catchAsyncErrors(async (req, res, next) => {
  try {
    const assessments = await client.query('SELECT * FROM assessments');
    res.status(200).json({ assessments: assessments.rows });
  } catch (error) {
    console.error("Error fetching assessments:", error.message);
    res.status(500).json({ error: "Error fetching assessments" });
  }
});

// Get all user assessments
const getAllUserAssessments = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userAssessments = await client.query('SELECT * FROM assessments WHERE created_by = $1', [userId]);
    res.status(200).json({ assessments: userAssessments.rows });
  } catch (error) {
    console.error("Error fetching user's assessments:", error.message);
    res.status(500).json({ error: "Error fetching user's assessments" });
  }
});

// Update Assessment
const updateAssessment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assessment_name, company_name, tests } = req.body;

    // Validate request data
    if (!assessment_name || !company_name || !tests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find company ID by name
    const companyId = await findCompanyIdByName(company_name);

    // Find test IDs by names
    const testIds = await findTestIdsByName(tests);

    // Update assessment data in the database
    const query = `
          UPDATE assessments 
          SET assessment_name = $1, company_id = $2, tests = $3
          WHERE id = $4`;
    const values = [assessment_name, companyId, testIds, id];
    await client.query(query, values);

    res.status(200).json({ message: 'Assessment updated successfully' });
  } catch (error) {
    console.error("Error updating Assessment:", error.message);
    res.status(500).json({ error: "Error updating Assessment" });
  }
});

// Delete Assessment
const deleteAssessment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete assessment from the database
    const query = 'DELETE FROM assessments WHERE id = $1';
    const values = [id];
    await client.query(query, values);

    res.status(200).json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error("Error deleting Assessment:", error.message);
    res.status(500).json({ error: "Error deleting Assessment" });
  }
});

module.exports = { createAssessment, getAllAssessments, getAssessmentByLink, getAllUserAssessments, updateAssessment, deleteAssessment };