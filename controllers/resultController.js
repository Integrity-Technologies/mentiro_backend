// controllers/resultController.js
const {createResultsTable,saveResult,getResultById,updateResult} = require("../models/result");
const analytics = require('../segment/segmentConfig');
const answerController = require("../controllers/answerController");
const { client } = require("../db/index.js");


// Function to calculate the score
// const calculateScore = (questions) => {
//   let score = 0;
//   for (const question of questions) {
//     if (question.is_correct === 1) {
//       score++; // Increment score for each correct answer
//     }
//   }
//   return score;
// };
// Function to calculate the percentage score
const calculatePercentage = (correctQuestions, totalQuestions) => {
  const percentage = (correctQuestions / totalQuestions) * 100;
  // Ensure the percentage doesn't exceed 100
  return Math.min(percentage, 100);
};


// Function to handle answer submission
// const submitAnswer = async (req, res) => {
//   try {
//     // Extract data from request body
//     const { resultId, question_id, option } = req.body;

//     // Verify the answer
//     const answer = await answerController.verifyAnswer(question_id, option);

//     // Fetch the result from the database
//     const result = await getResultById(resultId);

//     // Update the questions array with the answered question
//     result.questions.push({ question_id, answer_id: answer.answer_id, is_correct:answer.is_correct });

//    const score =  await calculateScore(result.questions);

//     // Calculate the score and update the result in the database
//     await updateResult(resultId, result.questions,score);

//     // Respond with success message
//     res.status(200).json({ message: "Answer submitted successfully" });
//   } catch (error) {
//     console.error("Error submitting answer:", error);
//     res.status(500).json({ error: "Error submitting answer" });
//   }
// };
// Function to handle answer submission
const submitAnswer = async (req, res) => {
  try {
    // Extract data from request body
    const { resultId, question_id, option } = req.body;

    // Verify the answer
    const answer = await answerController.verifyAnswer(question_id, option);

    // Fetch the result from the database
    const result = await getResultById(resultId);

    // Update the questions array with the answered question
    result.questions.push({ question_id, answer_id: answer.answer_id, is_correct: answer.is_correct });

    // Calculate the number of correct questions
    const correctQuestions = result.questions.reduce((count, question) => count + question.is_correct, 0);

    // Calculate the percentage score
    const totalQuestions = result.questions.length;
    const scorePercentage = calculatePercentage(correctQuestions, totalQuestions);

    // Add percentage sign to the score
    // const scoreWithPercentage = `${scorePercentage.toFixed(2)}%`;

    // Update the result in the database with the score including percentage sign
    await updateResult(resultId, result.questions, parseInt(scorePercentage.toFixed(2)));

    // Track the answer submission event in Segment
    analytics.track({
      userId: String(req.user.id),
      event: 'Answer Submitted',
      properties: {
        resultId,
        question_id,
        is_correct: answer.is_correct,
        scorePercentage: scorePercentage.toFixed(2),
        submitted_at: new Date().toISOString(),
      }
    });

    // Respond with success message
    res.status(200).json({ message: "Answer submitted successfully" });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Error submitting answer" });
  }
};

// Function to find candidate by ID
const findCandidate = async (candidateId) => {
  try {
    const result = await client.query('SELECT id FROM "candidates" WHERE id = $1', [candidateId]);
    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      // Handle the case if a company with the provided name does not exist
      throw new Error(`Candidate '${candidateId}' not found`);
    }
  } catch (error) {
    throw error;
  }
};

// Function to find test by ID
const findTest = async (testId) => {
  try {
    const result = await client.query('SELECT id FROM "tests" WHERE id = $1', [testId]);
    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      // Handle the case if a company with the provided name does not exist
      throw new Error(`Test '${testId}' not found`);
    }
  } catch (error) {
    throw error;
  }
};

// Function to find assessment by ID
const findAssessment = async (assessmentId) => {
  try {
    const result = await client.query('SELECT id FROM "assessments" WHERE id = $1', [assessmentId]);
    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      // Handle the case if a company with the provided name does not exist
      throw new Error(`Assessment '${assessmentId}' not found`);
    }
  } catch (error) {
    throw error;
  }
};

// Function to handle result creation
const createResult = async (req, res) => {
  try {

    await createResultsTable();

    // Extract data from request body
    const { candidate_id, test_id, assessment_id } = req.body;

    // Validate request data
    if (!candidate_id || !test_id || !assessment_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }


    // Find canidate
    const candidateId = await findCandidate(candidate_id);

    // find test
    const testId = await findTest(test_id);

    // find assessment
    const assessmentId = await findAssessment(assessment_id);

    // Create initial result object
    const resultData = {
      candidate_id:candidateId,
      test_id:testId,
      questions: [],
      assessment_id:assessmentId,
      score: null // Store score as null by default
    };

    // Save the result to the database
    const result = await saveResult(resultData);

     // Identify the user in Segment
     analytics.identify({
      userId: String(req.user.id),
      traits: {
        candidate_id: candidateId,
        test_id: testId,
        assessment_id: assessmentId,
        created_at: new Date().toISOString(),
      }
    });

    // Track the result creation event in Segment
    analytics.track({
      userId: String(req.user.id),
      event: 'Result Created',
      properties: {
        resultId: result.id,
        candidate_id: candidateId,
        test_id: testId,
        assessment_id: assessmentId,
        created_at: new Date().toISOString(),
      }
    });

    // Respond with success message
    res.status(201).json({ result });
  } catch (error) {
    console.error("Error creating result:", error);
    res.status(500).json({ error: "Error creating result" });
  }
};


// function calculatePercentage(score, maxScore = 100) {
//   if (score === 0) return 0;
//   // Use Math.round to round to the nearest integer, preventing exceeding 100%
//   const percentage = Math.round((score / maxScore) * 100);
//   // Ensure the percentage is not above 100
//   return Math.min(percentage, 100);
// }


// get all results
const getAllResults = async (req, res) => {
  try {
    await createResultsTable();

    const results = await client.query('SELECT * FROM "results"');

    if (results.rows.length === 0) {
      return res.status(404).json({ error: "Results not found" });
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
        });
      }

      // Find or create test
      let testIndex = candidate.assessments[assessmentIndex].tests.findIndex(test => test.name === testsMap.get(result.test_id));
      if (testIndex === -1) {
        testIndex = candidate.assessments[assessmentIndex].tests.length;
        candidate.assessments[assessmentIndex].tests.push({
          name: testsMap.get(result.test_id),
          questions: result.questions || [], // Include questions array from the result
        });
      }

      // Calculate score and add to test
      // const score = calculatePercentage(rest.score);
      candidate.assessments[assessmentIndex].tests[testIndex].score = rest.score;

      return { ...acc, [candidate_id]: candidate };
    }, {});

    const resultsWithNames = Object.values(resultsByCandidate);

    // Track the get all results event in Segment
    analytics.track({
      userId: String(req.user.id),
      event: 'Get All Results',
      properties: {
        count: results.rows.length,
        fetched_at: new Date().toISOString(),
      }
    });

    res.status(200).json(resultsWithNames);
  } catch (error) {
    console.error("Error fetching results:", error.message);
    res.status(500).json({ error: "Error fetching results" });
  }
};

// this response all the assessment that created by user to candidates object (NOT CORRECT )
// const getResultsByUser = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assume userId is extracted from the token

//     await createResultsTable();

//     // Fetch assessments created by the user
//     const assessmentsQuery = 'SELECT * FROM "assessments" WHERE created_by = $1';
//     const assessmentsResult = await client.query(assessmentsQuery, [userId]);

//     if (assessmentsResult.rows.length === 0) {
//       return res.status(404).json({ error: "No assessments found for this user" });
//     }

//     const assessments = assessmentsResult.rows;
//     const assessmentIds = assessments.map(assessment => assessment.id);

//     // Fetch results for these assessments
//     const resultsQuery = 'SELECT * FROM "results" WHERE assessment_id = ANY($1)';
//     const results = await client.query(resultsQuery, [assessmentIds]);

//     // Fetch candidate names and emails for each result
//     const candidateIds = results.rows.map(result => result.candidate_id);
//     const candidateQuery = 'SELECT id, first_name, email FROM "candidates" WHERE id = ANY($1)';
//     const candidateResult = await client.query(candidateQuery, [candidateIds]);
//     const candidatesMap = new Map(candidateResult.rows.map(candidate => [candidate.id, { name: candidate.first_name, email: candidate.email }]));

//     // Fetch assessment names and tests
//     const assessmentsMap = new Map(assessments.map(assessment => [assessment.id, assessment]));

//     // Group results by candidate id
//     const resultsByCandidate = results.rows.reduce((acc, result) => {
//       const { candidate_id, ...rest } = result;
//       const candidate = acc[candidate_id] || {
//         id: candidate_id,
//         candidate_name: candidatesMap.get(candidate_id).name,
//         candidate_email: candidatesMap.get(candidate_id).email,
//         assessments: [],
//       };

//       // Find or create assessment
//       let assessmentIndex = candidate.assessments.findIndex(assessment => assessment.name === assessmentsMap.get(result.assessment_id).assessment_name);
//       if (assessmentIndex === -1) {
//         assessmentIndex = candidate.assessments.length;
//         candidate.assessments.push({
//           name: assessmentsMap.get(result.assessment_id).assessment_name,
//           tests: [],
//         });
//       }

//       // Find or create test
//       const assessment = assessmentsMap.get(result.assessment_id);
//       const testDetails = assessment.tests.find(test => test.test_id === result.test_id);
//       if (!testDetails) return acc; // Skip if no test details found

//       let testIndex = candidate.assessments[assessmentIndex].tests.findIndex(test => test.name === testDetails.test_name);
//       if (testIndex === -1) {
//         testIndex = candidate.assessments[assessmentIndex].tests.length;
//         candidate.assessments[assessmentIndex].tests.push({
//           name: testDetails.test_name,
//           total_questions: testDetails.questions.length,
//           attempted_questions: rest.questions ? rest.questions.length : 0,
//           score: rest.score,
//           status: rest.questions && rest.questions.length > 0 ?
//             (rest.questions.length === testDetails.questions.length ? 'Attempted' : `Attempted ${rest.questions.length} questions`) :
//             'Not attempted any questions from this test',
//         });
//       }

//       return { ...acc, [candidate_id]: candidate };
//     }, {});

//     // Include assessments without results
//     assessments.forEach(assessment => {
//       const assessmentName = assessment.assessment_name;
//       const tests = assessment.tests;

//       tests.forEach(test => {
//         const testDetails = test;
//         results.rows.forEach(result => {
//           if (!resultsByCandidate[result.candidate_id]) {
//             resultsByCandidate[result.candidate_id] = {
//               id: result.candidate_id,
//               candidate_name: candidatesMap.get(result.candidate_id).name,
//               candidate_email: candidatesMap.get(result.candidate_id).email,
//               assessments: [],
//             };
//           }

//           let candidateAssessments = resultsByCandidate[result.candidate_id].assessments;
//           let assessmentIndex = candidateAssessments.findIndex(a => a.name === assessmentName);
//           if (assessmentIndex === -1) {
//             assessmentIndex = candidateAssessments.length;
//             candidateAssessments.push({
//               name: assessmentName,
//               tests: [],
//             });
//           }

//           let testIndex = candidateAssessments[assessmentIndex].tests.findIndex(t => t.name === testDetails.test_name);
//           if (testIndex === -1) {
//             candidateAssessments[assessmentIndex].tests.push({
//               name: testDetails.test_name,
//               total_questions: testDetails.questions.length,
//               attempted_questions: 0,
//               status: 'Not attempted',
//             });
//           }
//         });
//       });
//     });

//     const resultsWithNames = Object.values(resultsByCandidate);

//     res.status(200).json(resultsWithNames);
//   } catch (error) {
//     console.error("Error fetching results:", error.message);
//     res.status(500).json({ error: "Error fetching results" });
//   }
// };

const getResultsByUser = async (req, res) => {
  try {
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
      const { candidate_id, ...rest } = result;
      const candidate = acc[candidate_id] || {
        id: candidate_id,
        candidate_name: candidatesMap.get(candidate_id).name,
        candidate_email: candidatesMap.get(candidate_id).email,
        assessments: [],
      };

      // Find or create assessment
      let assessmentIndex = candidate.assessments.findIndex(assessment => assessment.name === assessmentsMap.get(result.assessment_id).assessment_name);
      if (assessmentIndex === -1) {
        assessmentIndex = candidate.assessments.length;
        candidate.assessments.push({
          name: assessmentsMap.get(result.assessment_id).assessment_name,
          tests: [],
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

    res.status(200).json(resultsWithNames);
  } catch (error) {
    console.error("Error fetching results:", error.message);
    res.status(500).json({ error: "Error fetching results" });
  }
};

// Final version (JUST FOR CHECKING)
// const getResultsByUser = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assume userId is extracted from the token

//     await createResultsTable();

//     // Fetch assessments created by the user
//     const assessmentsQuery = 'SELECT * FROM "assessments" WHERE created_by = $1';
//     const assessmentsResult = await client.query(assessmentsQuery, [userId]);

//     if (assessmentsResult.rows.length === 0) {
//       return res.status(404).json({ error: "No assessments found for this user" });
//     }

//     const assessments = assessmentsResult.rows;
//     const assessmentIds = assessments.map(assessment => assessment.id);

//     // Fetch results for these assessments
//     const resultsQuery = 'SELECT * FROM "results" WHERE assessment_id = ANY($1)';
//     const results = await client.query(resultsQuery, [assessmentIds]);

//     // Fetch candidate names and emails for each result
//     const candidateIds = results.rows.map(result => result.candidate_id);
//     const candidateQuery = 'SELECT id, first_name, email FROM "candidates" WHERE id = ANY($1)';
//     const candidateResult = await client.query(candidateQuery, [candidateIds]);
//     const candidatesMap = new Map(candidateResult.rows.map(candidate => [candidate.id, { name: candidate.first_name, email: candidate.email }]));

//     // Fetch assessment names and tests
//     const assessmentsMap = new Map(assessments.map(assessment => [assessment.id, assessment]));

//     // Group results by candidate id
//     const resultsByCandidate = results.rows.reduce((acc, result) => {
//       const { candidate_id, ...rest } = result;
//       const candidate = acc[candidate_id] || {
//         id: candidate_id,
//         candidate_name: candidatesMap.get(candidate_id).name,
//         candidate_email: candidatesMap.get(candidate_id).email,
//         assessments: [],
//       };

//       // Find or create assessment
//       let assessmentIndex = candidate.assessments.findIndex(assessment => assessment.name === assessmentsMap.get(result.assessment_id).assessment_name);
//       if (assessmentIndex === -1) {
//         assessmentIndex = candidate.assessments.length;
//         candidate.assessments.push({
//           name: assessmentsMap.get(result.assessment_id).assessment_name,
//           tests: [],
//         });
//       }

//       // Find or create test
//       const assessment = assessmentsMap.get(result.assessment_id);
//       const testDetails = assessment.tests.find(test => test.test_id === result.test_id);
//       if (!testDetails) return acc; // Skip if no test details found

//       let testIndex = candidate.assessments[assessmentIndex].tests.findIndex(test => test.name === testDetails.test_name);
//       if (testIndex === -1) {
//         testIndex = candidate.assessments[assessmentIndex].tests.length;
//         candidate.assessments[assessmentIndex].tests.push({
//           name: testDetails.test_name,
//           total_questions: testDetails.questions.length,
//           attempted_questions: rest.questions ? rest.questions.length : 0,
//           score: rest.score, // Add score here
//           status: rest.questions && rest.questions.length > 0 ?
//             (rest.questions.length === testDetails.questions.length ? 'Attempted' : `Attempted ${rest.questions.length} questions`) :
//             'Not attempted',
//         });
//       }

//       return { ...acc, [candidate_id]: candidate };
//     }, {});

//     // Include assessments without results
//     assessments.forEach(assessment => {
//       const assessmentName = assessment.assessment_name;
//       const tests = assessment.tests;

//       tests.forEach(test => {
//         const testDetails = test;
//         results.rows.forEach(result => {
//           if (!resultsByCandidate[result.candidate_id]) {
//             resultsByCandidate[result.candidate_id] = {
//               id: result.candidate_id,
//               candidate_name: candidatesMap.get(result.candidate_id).name,
//               candidate_email: candidatesMap.get(result.candidate_id).email,
//               assessments: [],
//             };
//           }

//           let candidateAssessments = resultsByCandidate[result.candidate_id].assessments;
//           let assessmentIndex = candidateAssessments.findIndex(a => a.name === assessmentName);
//           if (assessmentIndex === -1) {
//             assessmentIndex = candidateAssessments.length;
//             candidateAssessments.push({
//               name: assessmentName,
//               tests: [],
//             });
//           }

//           let testIndex = candidateAssessments[assessmentIndex].tests.findIndex(t => t.name === testDetails.test_name);
//           if (testIndex === -1) {
//             candidateAssessments[assessmentIndex].tests.push({
//               name: testDetails.test_name,
//               total_questions: testDetails.questions.length,
//               attempted_questions: 0,
//               score: null, // No score since no results
//               status: 'Not attempted',
//             });
//           }
//         });
//       });
//     });

//     const resultsWithNames = Object.values(resultsByCandidate);

//     res.status(200).json(resultsWithNames);
//   } catch (error) {
//     console.error("Error fetching results:", error.message);
//     res.status(500).json({ error: "Error fetching results" });
//   }
// };

module.exports = { submitAnswer, createResult, getAllResults, getResultsByUser };
