// controllers/resultController
const {
  createResultsTable,
  saveResult,
  getResultById,
  updateResult
} = require("../models/result");
const analytics = require('../segment/segmentConfig');
const answerController = require("../controllers/answerController");
const { client } = require("../db/index.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { sendErrorResponse } = require("../utils/res_error");


// Utility function to calculate the percentage score
const calculatePercentage = (correctQuestions, totalQuestions) => {
  const percentage = (correctQuestions / totalQuestions) * 100;
  return Math.min(percentage, 100);
};

// Helper function to validate IDs
const validateId = async (id, query, errorMessage) => {
  const result = await client.query(query, [id]);
  if (result.rows.length > 0) {
    return result.rows[0].id;
  } else {
    throw new Error(errorMessage);
  }
};

// Validate result input data
const validateResultInput = (candidateId, testId, assessmentId) => {
  if (!candidateId || typeof candidateId !== 'number') {
    // return sendErrorResponse(res, 400, "Invalid or missing 'candidate_id'");
    return "Invalid or missing 'candidate id'";
  }
  if (!testId || typeof testId !== 'number') {
    // return sendErrorResponse(res, 400, "Invalid or missing 'test_id'");
    return "Invalid or missing 'test id'";
  }
  if (!assessmentId || typeof assessmentId !== 'number') {
    // return sendErrorResponse(res, 400, "Invalid or missing 'assessment_id'");
    return "Invalid or missing 'Assessment id'";
  }
};

// Validate answer submission input data
const validateAnswerInput = (resultId, questionId, option) => {
  if (!resultId || typeof resultId !== 'number') {
    // return sendErrorResponse(res, 400, "Invalid or missing 'resultId'");
    return "Invalid or missing 'result id'";
  }
  if (!questionId || typeof questionId !== 'number') {
    // return sendErrorResponse(res, 400, "Invalid or missing 'question_id'");
    return "Invalid or missing 'question id'";
  }
  if (
    option === undefined || 
    (typeof option !== 'string' && typeof option !== 'boolean') || 
    (typeof option === 'string' && option.trim() === '')
  ) {
    // return sendErrorResponse(res, 400, "Invalid or missing 'option'");
    return "Invalid or missing 'option'";
  }
};

// Submit answer to a question
const submitAnswer = catchAsyncErrors(async (req, res) => {
  const { resultId, question_id, option } = req.body;
  // await validateAnswerInput(res, resultId, question_id, option);
  // Validate test input

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

 // Ensure question_id is a number
 const questionId = parseInt(question_id, 10);

  const validationError =  await validateAnswerInput(resultId, questionId, option);
  if (validationError) {
    return sendErrorResponse(res, 400, validationError);
  }

  const answer = await answerController.verifyAnswer(question_id, option);
  const result = await getResultById(resultId);

  if (!result) {
    return sendErrorResponse(res, 404, "Result not found");
  }

  result.questions.push({
    question_id: questionId,
    answer_id: answer.answer_id,
    is_correct: answer.is_correct
  });

  const correctQuestions = result.questions.reduce((count, question) => count + question.is_correct, 0);
  const totalQuestions = result.questions.length;
  const scorePercentage = calculatePercentage(correctQuestions, totalQuestions);

  await updateResult(resultId, result.questions, parseInt(scorePercentage.toFixed(2)));

  analytics.track({
    userId: String(req.user?.id),
    event: 'Answer Submitted',
    properties: {
      resultId,
      question_id,
      is_correct: answer.is_correct,
      scorePercentage: scorePercentage.toFixed(2),
      submitted_at: new Date().toISOString(),
    }
  });

  res.status(200).json({ message: "Answer submitted successfully" });
});

// Create a new result
const createResult = catchAsyncErrors(async (req, res) => {
  await createResultsTable();

  const { candidate_id, test_id, assessment_id } = req.body;
  // validateResultInput(res, candidate_id, test_id, assessment_id);
  const validationError =  await validateResultInput(candidate_id, test_id, assessment_id);
  if (validationError) {
    return sendErrorResponse(res, 400, validationError);
  }

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

  const existingResult = await client.query('SELECT * FROM results WHERE candidate_id = $1 AND test_id = $2 AND assessment_id = $3', [candidate_id, test_id, assessment_id]);
  if (existingResult.rows.length > 0) {
    return sendErrorResponse(res, 400, "Result already exists for this candidate, test, and assessment combination");
  }

  const candidateId = await validateId(candidate_id, 'SELECT id FROM "candidates" WHERE id = $1', `Candidate '${candidate_id}' not found`);
  const testId = await validateId(test_id, 'SELECT id FROM "tests" WHERE id = $1', `Test '${test_id}' not found`);
  const assessmentId = await validateId(assessment_id, 'SELECT id FROM "assessments" WHERE id = $1', `Assessment '${assessment_id}' not found`);

  // Fetch the company_id from the assessment
  const assessmentQuery = 'SELECT company_id FROM assessments WHERE id = $1';
  const assessmentResult = await client.query(assessmentQuery, [assessmentId]);
  if (assessmentResult.rows.length === 0) {
    return sendErrorResponse(res, 400, `Assessment '${assessment_id}' not found`);
  }
  const companyId = assessmentResult.rows[0].company_id;

  const resultData = {
    candidate_id: candidateId,
    test_id: testId,
    questions: [],
    assessment_id: assessmentId,
    company_id: companyId,
    score: null // Store score as null by default
  };

  const result = await saveResult(resultData);

  analytics.identify({
    userId: String(req.user?.id),
    traits: {
      candidate_id: candidateId,
      test_id: testId,
      assessment_id: assessmentId,
      created_at: new Date().toISOString(),
    }
  });

  analytics.track({
    userId: String(req.user?.id),
    event: 'Result Created',
    properties: {
      resultId: result.id,
      candidate_id: candidateId,
      test_id: testId,
      assessment_id: assessmentId,
      created_at: new Date().toISOString(),
    }
  });

  res.status(201).json({
    success: true,
    message: "Result created successfully",
    result: result,
    userId: req.user?.id
  });
});

// get all results
const getAllResults = catchAsyncErrors(async (req, res) => {
  
    await createResultsTable();

    const results = await client.query('SELECT * FROM "results"');

    if (results.rows.length === 0) {
      return res.status(404).json({ error: "Results not found" });
    }

    // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

    // Fetch candidate names for each result
    const candidateIds = results.rows.map(result => result.candidate_id);
    const candidateResult = await client.query('SELECT id, first_name FROM "candidates" WHERE id = ANY($1)', [candidateIds]);
    const candidatesMap = new Map(candidateResult.rows.map(candidate => [candidate.id, candidate.first_name]));

    // Fetch test names for each result
    const testIds = results.rows.map(result => result.test_id);
    const testResult = await client.query('SELECT id, test_name FROM "tests" WHERE id = ANY($1)', [testIds]);
    const testsMap = new Map(testResult.rows.map(test => [test.id, test.test_name]));

    // Fetch assessment names for each result
    const assessmentIds = results.rows.map(result => result.assessment_id);
    const assessmentResult = await client.query('SELECT id, assessment_name FROM "assessments" WHERE id = ANY($1)', [assessmentIds]);
    const assessmentsMap = new Map(assessmentResult.rows.map(assessment => [assessment.id, assessment.assessment_name]));

    // Group results by candidate id
    const resultsByCandidate = results.rows.reduce((acc, result) => {
      const { candidate_id, ...rest } = result;
      const candidate = acc[candidate_id] || {
        id: candidate_id,
        candidate_name: candidatesMap.get(candidate_id),
        assessments: [],
      };

      // Find or create assessment
      let assessmentIndex = candidate.assessments.findIndex(assessment => assessment.name === assessmentsMap.get(result.assessment_id));
      if (assessmentIndex === -1) {
        assessmentIndex = candidate.assessments.length;
        candidate.assessments.push({
          name: assessmentsMap.get(result.assessment_id),
          tests: [],
          assessment_score: 0,
          assessment_percentage: 0,
        });
      }

      // Find or create test
      let testIndex = candidate.assessments[assessmentIndex].tests.findIndex(test => test.name === testsMap.get(result.test_id));
      if (testIndex === -1) {
        testIndex = candidate.assessments[assessmentIndex].tests.length;
        candidate.assessments[assessmentIndex].tests.push({
          name: testsMap.get(result.test_id),
          questions: result.questions || [], // Include questions array from the result
          score: rest.score,
        });
      }

      // Calculate score and add to assessment
      candidate.assessments[assessmentIndex].assessment_score += rest.score;

      return { ...acc, [candidate_id]: candidate };
    }, {});

    // Calculate assessment percentage for each assessment
    Object.values(resultsByCandidate).forEach(candidate => {
      candidate.assessments.forEach(assessment => {
        assessment.assessment_percentage = calculatePercentage(assessment.assessment_score, assessment.tests.length * 100);
      });
    });

    const resultsWithNames = Object.values(resultsByCandidate);

    // Track the getAllResults event in Segment
    analytics.track({
      userId: String(req.user?.id),
      event: 'Get All Results',
      properties: {
        count: results.rows.length,
        fetched_at: new Date().toISOString(),
      }
    });

    res.status(200).json(resultsWithNames);
});

// get results for user assessments
const getResultsByUser = catchAsyncErrors(async (req, res) => {

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

    const userId = req.user.id; // Assume userId is extracted from the token

    await createResultsTable();

    // Fetch assessments created by the user
    const assessmentsQuery = 'SELECT * FROM "assessments" WHERE created_by = $1';
    const assessmentsResult = await client.query(assessmentsQuery, [userId]);

    if (assessmentsResult.rows.length === 0) {
      return res.status(404).json({ error: "No assessments found for this user" });
    }

    const assessments = assessmentsResult.rows;
    const assessmentIds = assessments.map(assessment => assessment.id);

    // Fetch results for these assessments
    const resultsQuery = 'SELECT * FROM "results" WHERE assessment_id = ANY($1)';
    const results = await client.query(resultsQuery, [assessmentIds]);

    if (results.rows.length === 0) {
      return res.status(404).json({ error: "No results found for these assessments" });
    }

    // Fetch candidate names and emails for each result
    const candidateIds = results.rows.map(result => result.candidate_id);
    const candidateQuery = 'SELECT id, first_name, email FROM "candidates" WHERE id = ANY($1)';
    const candidateResult = await client.query(candidateQuery, [candidateIds]);
    const candidatesMap = new Map(candidateResult.rows.map(candidate => [candidate.id, { name: candidate.first_name, email: candidate.email }]));

    // Fetch assessment names and tests
    const assessmentsMap = new Map(assessments.map(assessment => [assessment.id, assessment]));

    // Group results by candidate id
    const resultsByCandidate = results.rows.reduce((acc, result) => {
      const { candidate_id,company_id,started_at, ...rest } = result;
      const candidate = acc[candidate_id] || {
        id: candidate_id,
        candidate_name: candidatesMap.get(candidate_id).name,
        candidate_email: candidatesMap.get(candidate_id).email,
        companies: new Set(),
        assessments: [],
      };

      // Add company ID to the candidate's company list
      candidate.companies.add(company_id);

      // Find or create assessment
      let assessmentIndex = candidate.assessments.findIndex(assessment => assessment.name === assessmentsMap.get(result.assessment_id).assessment_name);
      if (assessmentIndex === -1) {
        assessmentIndex = candidate.assessments.length;
        candidate.assessments.push({
          name: assessmentsMap.get(result.assessment_id).assessment_name,
          tests: [],
          started_at: started_at
        });
      }

      // Find or create test
      const assessment = assessmentsMap.get(result.assessment_id);
      const testDetails = assessment.tests.find(test => test.test_id === result.test_id);
      if (!testDetails) return acc; // Skip if no test details found

      let testIndex = candidate.assessments[assessmentIndex].tests.findIndex(test => test.name === testDetails.test_name);
      if (testIndex === -1) {
        testIndex = candidate.assessments[assessmentIndex].tests.length;
        candidate.assessments[assessmentIndex].tests.push({
          name: testDetails.test_name,
          total_questions: testDetails.questions.length,
          attempted_questions: rest.questions ? rest.questions.length : 0,
          score: rest.score,
          status: rest.questions && rest.questions.length > 0 ?
            (rest.questions.length === testDetails.questions.length ? 'Attempted' : `Attempted ${rest.questions.length} questions`) :
            'Not attempted any questions from this test',
        });
      }

      return { ...acc, [candidate_id]: candidate };
    }, {});

    // Calculate assessment percentage and score for each assessment
    Object.values(resultsByCandidate).forEach(candidate => {
      candidate.assessments.forEach(assessment => {
        let totalScore = 0;
        let totalTests = 0;

        assessment.tests.forEach(test => {
          totalScore += test.score || 0;
          totalTests++;
        });

        assessment.assessment_score = totalScore;
        assessment.assessment_percentage = calculatePercentage(totalScore, totalTests * 100);
      });
      // Convert Set of companies to an array
      candidate.companies = Array.from(candidate.companies);
    });

    // Filter out assessments without results
    assessments.forEach(assessment => {
      const assessmentName = assessment.assessment_name;
      const tests = assessment.tests;

      tests.forEach(test => {
        results.rows.forEach(result => {
          if (result.assessment_id !== assessment.id) return; // Skip unrelated assessments

          if (!resultsByCandidate[result.candidate_id]) {
            resultsByCandidate[result.candidate_id] = {
              id: result.candidate_id,
              candidate_name: candidatesMap.get(result.candidate_id).name,
              candidate_email: candidatesMap.get(result.candidate_id).email,
              companies: new Set(),
              assessments: [],
            };
          }

          let candidateAssessments = resultsByCandidate[result.candidate_id].assessments;
          let assessmentIndex = candidateAssessments.findIndex(a => a.name === assessmentName);
          if (assessmentIndex === -1) {
            assessmentIndex = candidateAssessments.length;
            candidateAssessments.push({
              name: assessmentName,
              tests: [],
              started_at: result.started_at,
            });
          }

          let testIndex = candidateAssessments[assessmentIndex].tests.findIndex(t => t.name === test.test_name);
          if (testIndex === -1) {
            candidateAssessments[assessmentIndex].tests.push({
              name: test.test_name,
              total_questions: test.questions.length,
              attempted_questions: 0,
              status: 'Not attempted',
            });
          }
        });
      });
    });

    const resultsWithNames = Object.values(resultsByCandidate);

    // Track the getResultsByUser event in Segment
    analytics.track({
      userId: String(req.user?.id),
      event: 'Results viewed By User',
      properties: {
        count: results.rows.length,
        fetched_at: new Date().
        toISOString(),
      }
    });

    res.status(200).json(resultsWithNames);
});


module.exports = {
  createResult,
  getAllResults,
  getResultsByUser,
  submitAnswer,
};
