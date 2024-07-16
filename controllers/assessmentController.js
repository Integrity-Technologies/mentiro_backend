// assessmentController.js
const { createAssessmentsTable, saveAssessment } = require("../models/assessment");
const { client } = require("../db/index.js");
const analytics = require('../segment/segmentConfig');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { sendEmail } = require("../utils/sendEmail.js");
// Function to generate a unique random string
const generateUniqueLink = async () => {
  let link;
  let shareableLink;
  let checkLinkResult;
  const baseUrl = process.env.BASE_URL_DEV || 'http://localhost:3000';
  // console.log(process.env.BASE_URL + " from assessment controller");
  do {
    link = Math.random().toString(36).substring(2, 15);
    shareableLink = `${baseUrl}/assessment?${link}`; // Unique link directly appended
    const checkLinkQuery = `
      SELECT * FROM assessments WHERE uniquelink = $1
    `;
    checkLinkResult = await client.query(checkLinkQuery, [link]);
  } while (checkLinkResult.rows.length > 0);
  return { link, shareableLink }; // Return the link and the shareableLink
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

//  correct findTestIdsByName below except exceed questions validation
//  const findTestIdsByName = async (tests) => {
//   try {
//     const processedTests = [];

//     for (const test of tests) {
//       const { test_name, test_difficulty } = test;

//       // Find test details by name (including categories)
//       const testResult = await client.query('SELECT id, categories FROM "tests" WHERE test_name = $1', [test_name]);

//       if (testResult.rows.length === 0) {
//         throw new Error(`Test '${test_name}' not found`);
//       }

//       // const testId = testResult.rows[0].id;
//       const testId = testResult.rows[0].id
//       const categories = testResult.rows[0].categories;

//       // Find questions based on categories
//       const questionsQuery = `
//         SELECT *
//         FROM questions
//         WHERE categories && $1::integer[]
//       `;
//       const questionsValues = [categories];
//       const questionsResult = await client.query(questionsQuery, questionsValues);
//       console.log('Categories:', categories);
//       console.log('Questions Result:', questionsResult.rows);

//       // Ensure questionsResult.rows is iterable (i.e., an array)
//       if (!Array.isArray(questionsResult.rows)) {
//         throw new Error('Unexpected result: questionsResult.rows is not an array');
//       }

//       // Prepare a dictionary to store filtered questions by difficulty
//       const filteredQuestions = {
//         easy: [],
//         medium: [],
//         hard: [],
//       };

//       // Filter questions based on difficulty and user request (embedded in test_difficulty)
//       const addedQuestionsCount = { easy: 0, medium: 0, hard: 0 }; // Track the number of questions added for each difficulty
//       for (const question of questionsResult.rows) {
//         // console.log(question[0] + " this is question from for loop");
//         const { difficulty_level } = question;
//         console.log(difficulty_level);
//         const requestedCount = test_difficulty[difficulty_level] || 0;
//         console.log(requestedCount);
//         if (addedQuestionsCount[difficulty_level] < requestedCount) {
//           filteredQuestions[difficulty_level].push(question);
//           addedQuestionsCount[difficulty_level]++;
//         }
//       }

//       // Calculate total questions and time based on filtered results
//       const totalQuestions = Object.values(filteredQuestions).reduce((sum, arr) => sum + arr.length, 0);
//       let totalTime = 0;
//       if (totalQuestions > 0) {
//         totalTime = totalQuestions * QUESTION_TIME_PER_MINUTE; // Using the defined constant
//       }

//       // Prepare test data object with filtered questions
//       const testData = {
//         test_name,
//         test_id:testId,
//         test_difficulty,
//         questions: Object.values(filteredQuestions).flat().map(question => ({
//           question_id: question.id,
//         })),
//         total_questions: totalQuestions,
//         total_time: totalTime,
//       };

//       console.log(testData);
//       console.log(filteredQuestions);
//       processedTests.push(testData);
//     }

//     return processedTests;
//   } catch (error) {
//     throw error;
//   }
// };


//additional question exceed validation
// const findTestIdsByName = async (tests) => {
//   try {
//     const processedTests = [];

//     for (const test of tests) {
//       const { test_name, test_difficulty } = test;

//       // Find test details by name (including categories)
//       const testResult = await client.query('SELECT id, categories FROM "tests" WHERE test_name = $1', [test_name]);

//       if (testResult.rows.length === 0) {
//         throw new Error(`Test '${test_name}' not found`);
//       }

//       const testId = testResult.rows[0].id;
//       const categories = testResult.rows[0].categories;

//       // Find questions based on categories
//       const questionsQuery = `
//         SELECT *
//         FROM questions
//         WHERE categories && $1::integer[]
//       `;
//       const questionsValues = [categories];
//       const questionsResult = await client.query(questionsQuery, questionsValues);
//       console.log('Categories:', categories);
//       console.log('Questions Result:', questionsResult.rows);

//       // Ensure questionsResult.rows is iterable (i.e., an array)
//       if (!Array.isArray(questionsResult.rows)) {
//         throw new Error('Unexpected result: questionsResult.rows is not an array');
//       }

//       // Prepare a dictionary to store filtered questions by difficulty
//       const filteredQuestions = {
//         easy: [],
//         medium: [],
//         hard: [],
//       };

//       // Count available questions for each difficulty level
//       const availableQuestionsCount = {
//         easy: 0,
//         medium: 0,
//         hard: 0,
//       };

//       for (const question of questionsResult.rows) {
//         availableQuestionsCount[question.difficulty_level]++;
//       }

//       // Validate requested questions count
//       for (const difficulty in test_difficulty) {
//         if (test_difficulty[difficulty] > availableQuestionsCount[difficulty]) {
//           throw new Error(
//             `Requested ${test_difficulty[difficulty]} ${difficulty} questions for test '${test_name}', but only ${availableQuestionsCount[difficulty]} available.`
//           );
//         }
//       }

//       // Filter questions based on difficulty and user request (embedded in test_difficulty)
//       const addedQuestionsCount = { easy: 0, medium: 0, hard: 0 }; // Track the number of questions added for each difficulty
//       for (const question of questionsResult.rows) {
//         const { difficulty_level } = question;
//         const requestedCount = test_difficulty[difficulty_level] || 0;
//         if (addedQuestionsCount[difficulty_level] < requestedCount) {
//           filteredQuestions[difficulty_level].push(question);
//           addedQuestionsCount[difficulty_level]++;
//         }
//       }

//       // Calculate total questions and time based on filtered results
//       const totalQuestions = Object.values(filteredQuestions).reduce((sum, arr) => sum + arr.length, 0);
//       let totalTime = 0;
//       if (totalQuestions > 0) {
//         totalTime = totalQuestions * QUESTION_TIME_PER_MINUTE; // Using the defined constant
//       }

//       // Prepare test data object with filtered questions
//       const testData = {
//         test_name,
//         test_id: testId,
//         test_difficulty,
//         questions: Object.values(filteredQuestions).flat().map(question => ({
//           question_id: question.id,
//         })),
//         total_questions: totalQuestions,
//         total_time: totalTime,
//       };

//       console.log(testData);
//       console.log(filteredQuestions);
//       processedTests.push(testData);
//     }

//     return processedTests;
//   } catch (error) {
//     throw error;
//   }
// };

// new feature of randomized questions on assessments
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

      // Filter questions based on difficulty
      for (const question of questionsResult.rows) {
        filteredQuestions[question.difficulty_level].push(question);
      }

      // Validate the requested number of questions
      for (const difficulty in test_difficulty) {
        const availableQuestions = filteredQuestions[difficulty].length;
        const requestedQuestions = test_difficulty[difficulty];

        if (availableQuestions < requestedQuestions) {
          throw new Error(`Not enough ${difficulty} questions available for test '${test_name}'. Requested: ${requestedQuestions}, Available: ${availableQuestions}`);
        }
      }

      // Randomize and select the requested number of questions
      const randomizeQuestions = (questions, count) => {
        return questions.sort(() => Math.random() - 0.5).slice(0, count);
      };

      const selectedQuestions = {
        easy: randomizeQuestions(filteredQuestions.easy, test_difficulty.easy),
        medium: randomizeQuestions(filteredQuestions.medium, test_difficulty.medium),
        hard: randomizeQuestions(filteredQuestions.hard, test_difficulty.hard),
      };

      // Calculate total questions and time based on selected results
      const totalQuestions = Object.values(selectedQuestions).reduce((sum, arr) => sum + arr.length, 0);
      let totalTime = 0;
      if (totalQuestions > 0) {
        totalTime = totalQuestions * QUESTION_TIME_PER_MINUTE; // Using the defined constant
      }

      // Prepare test data object with selected questions
      const testData = {
        test_name,
        test_id: testId,
        test_difficulty,
        questions: Object.values(selectedQuestions).flat().map(question => ({
          question_id: question.id,
        })),
        total_questions: totalQuestions,
        total_time: totalTime,
      };

      processedTests.push(testData);
    }

    return processedTests;
  } catch (error) {
    throw error;
  }
};



// const getAssessmentByLink = catchAsyncErrors(async (req, res) => {
//   try {
//     const { uniqueLink } = req.params;
//     const query = `
//         SELECT * FROM assessments
//         WHERE uniquelink = $1`;
//     const values = [uniqueLink];
//     const result = await client.query(query, values);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Assessment not found" });
//     }

//     // Check if req.user and req.user.id are defined
//     // if (!req.user || !req.user.id) {
//     //   console.error("User ID is missing in the request");
//     //   return res.status(400).json({ error: "User ID is missing in the request" });
//     // }

//     // Track the get assessment by link event in Segment
//     analytics.track({
//       userId: String(req.user?.id || 'anonymous'),
//       event: 'Get Assessment By Link',
//       properties: {
//         uniqueLink,
//         assessmentId: result.rows[0].id,
//         assessment: result.rows[0],
//         fetched_at: new Date().toISOString(),
//       }
//     });

//     res.status(200).json(result.rows[0]);
//   } catch (error) {
//     console.error("Error fetching Assessment:", error);
//     res.status(500).json({ error: "error getting assessment", error: error.message });
//   }
// });

// new feature with randomized questions
// const getAssessmentByLink = catchAsyncErrors(async (req, res) => {
//   try {
//     const { uniqueLink } = req.params;
//     const query = `
//         SELECT * FROM assessments
//         WHERE uniquelink = $1`;
//     const values = [uniqueLink];
//     const result = await client.query(query, values);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Assessment not found" });
//     }

//     const assessment = result.rows[0];
//     const testsConfig = assessment.tests;

//     const processedTests = await findTestIdsByName(testsConfig);

//     // Track the get assessment by link event in Segment
//     analytics.track({
//       userId: String(req.user?.id || 'anonymous'),
//       event: 'Get Assessment By Link',
//       properties: {
//         uniqueLink,
//         assessmentId: assessment.id,
//         assessment: processedTests,
//         fetched_at: new Date().toISOString(),
//       }
//     });

//     res.status(200).json({
//       ...assessment,
//       tests: processedTests
//     });
//   } catch (error) {
//     console.error("Error fetching Assessment:", error);
//     res.status(500).json({ error: "error getting assessment", error: error.message });
//   }
// });


const findJobRole = async (name) => {
  try {
    const result = await client.query('SELECT id FROM job_roles WHERE name = $1', [name]);
    if (result.rowCount > 0) {
      return result.rows[0].id;
    } else {
      throw new Error('Invalid Job Role');
    }
  } catch (error) {
    throw error;
  }
};

const findWorkArrangementIdByName = async (name) => {
  try {
    const result = await client.query('SELECT id FROM work_arrangements WHERE name = $1', [name]);
    if (result.rowCount > 0) {
      return result.rows[0].id;
    } else {
      throw new Error('Invalid work arrangement');
    }
  } catch (error) {
    throw error;
  }
};

const findJobLocationIdByName = async (name) => {
  try {
    const result = await client.query('SELECT id FROM job_locations WHERE name = $1', [name]);
    if (result.rowCount > 0) {
      return result.rows[0].id;
    } else {
      throw new Error('Invalid job location');
    }
  } catch (error) {
    throw error;
  }
};

// Create Assessment
// const createAssessment = async (req, res, next) => {
//   try {
//     await createAssessmentsTable();

//     const { assessment_name, company_name, tests, job_role, work_arrangement, job_location } = req.body;

//     // Check if req.user and req.user.id are defined
//     if (!req.user || !req.user.id) {
//       console.error("User ID is missing in the request");
//       return res.status(400).json({ error: "User ID is missing in the request" });
//     }

//     // Check if a assessment with the same name already exists
//     const existingAssessment = await client.query('SELECT * FROM "assessments" WHERE assessment_name = $1', [assessment_name]);
//     if (existingAssessment.rows.length > 0) {
//       return sendErrorResponse(res, 409, 'Assessment with this name already exists');
//     }

//     if (!assessment_name || !company_name || !tests || tests.length === 0 || !job_role || !job_location || !work_arrangement) {
//       return res.status(400).json({ error: 'Invalid request data. Missing required fields' });
//     }

//     if (!Array.isArray(tests)) {
//       return res.status(400).json({ error: "Incorrect format of tests array." })
//     }

//     const companyId = await findCompanyIdByName(company_name);
//     const processedTests = await findTestIdsByName(tests);

//     console.log(processedTests);

//     const jobRoleId = await findJobRole(job_role);
//     const workArrangementId = await findWorkArrangementIdByName(work_arrangement);
//     const jobLocationId = await findJobLocationIdByName(job_location);

//     // Calculate total time for all tests
//     const assessmentTime = processedTests.reduce((totalTime, test) => {
//       return totalTime + test.total_time; // Assuming each test has a 'total_time' property
//     }, 0);
//     console.log(req.user.id + " this is user id i am getting");
//     const assessmentLinks = await generateUniqueLink();
//     const assessmentData = {
//       assessment_name,
//       company_id: companyId,
//       tests: processedTests,
//       shareableLink: assessmentLinks.shareableLink,
//       uniquelink: assessmentLinks.link,
//       created_by: req.user.id,
//       // assessment_time: processedTests.reduce((acc, test) => acc + test.test_difficulty.easy + test.test_difficulty.medium + test.test_difficulty.hard, 0) * QUESTION_TIME_PER_MINUTE,
//       assessment_time: assessmentTime,
//       job_role_id: jobRoleId,
//       work_arrangement_id: workArrangementId,
//       job_location_id: jobLocationId,
//     };

//     const assessment = await saveAssessment(assessmentData);

//     analytics.identify({
//       userId: String(req.user?.id || 'anonymous'),
//       traits: {
//         assessmentId: assessment.id,
//         assessment_name: assessment.assessment_name,
//         createdBy: assessment.created_by,
//         company_id: assessment.company_id,
//       }
//     });

//     // Identify the user who created the assessment in Segment
//     analytics.identify({
//       userId: String(req.user?.id || 'anonymous'),
//       traits: {
//         name: req.user.name,
//         email: req.user.email,
//       }
//     });

//     // Track the assessment creation event in Segment
//     analytics.track({
//       userId: String(req.user?.id || 'anonymous'),
//       event: 'Assessment Created',
//       properties: {
//         assessmentId: assessment.id,
//         assessment_name: assessment.assessment_name,
//         company_id: assessment.company_id,
//         tests: assessment.tests,
//         shareableLink: assessment.shareableLink,
//         created_at: new Date().toISOString(),
//       }
//     });

//     res.status(201).json({ assessment });
//   } catch (error) {
//     console.error("Error creating Assessment:", error.message);
//     res.status(500).json({ error: "Error creating Assessment", error: error.message });
//   }
// };

  // Helper functions to fetch names by ID
const findJobRoleNameById = async (id) => {
  const result = await client.query('SELECT name FROM "job_roles" WHERE id = $1', [id]);
  return result.rows.length > 0 ? result.rows[0].name : null;
};

const findWorkArrangementNameById = async (id) => {
  const result = await client.query('SELECT name FROM "work_arrangements" WHERE id = $1', [id]);
  return result.rows.length > 0 ? result.rows[0].name : null;
};

const findJobLocationNameById = async (id) => {
  const result = await client.query('SELECT name FROM "job_locations" WHERE id = $1', [id]);
  return result.rows.length > 0 ? result.rows[0].name : null;
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

    const assessment = result.rows[0];
    const testsConfig = assessment.tests;

    const processedTests = await findTestIdsByName(testsConfig);

    // Fetch the names of job role, work arrangement, and job location
    const jobRoleName = await findJobRoleNameById(assessment.job_role_id);
    const workArrangementName = await findWorkArrangementNameById(assessment.work_arrangement_id);
    const jobLocationName = await findJobLocationNameById(assessment.job_location_id);

    // Track the get assessment by link event in Segment
    analytics.track({
      userId: String(req.user?.id || 'anonymous'),
      event: 'Get Assessment By Link',
      properties: {
        uniqueLink,
        assessmentId: assessment.id,
        assessment: processedTests,
        fetched_at: new Date().toISOString(),
      }
    });

    res.status(200).json({
      ...assessment,
      job_role_name: jobRoleName,
      work_arrangement_name: workArrangementName,
      job_location_name: jobLocationName,
      tests: processedTests
    });
  } catch (error) {
    console.error("Error fetching Assessment:", error);
    res.status(500).json({ error: "Error getting assessment", error: error.message });
  }
});

// create assessment with randomized questions 
const createAssessment = async (req, res, next) => {
  try {
    await createAssessmentsTable();

    const { assessment_name, company_name, tests, job_role, work_arrangement, job_location } = req.body;

    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    // Check if the user already has an assessment with the same name
    const existingUserAssessment = await client.query(
      'SELECT * FROM "assessments" WHERE assessment_name = $1 AND created_by = $2',
      [assessment_name, req.user.id]
    );
    if (existingUserAssessment.rows.length > 0) {
      return res.status(409).json({ error: "You already have an assessment with this name" });
    }

    if (!assessment_name || !company_name || !tests || tests.length === 0 || !job_role || !job_location || !work_arrangement) {
      return res.status(400).json({ error: 'Invalid request data. Missing required fields' });
    }

    if (!Array.isArray(tests)) {
      return res.status(400).json({ error: "Incorrect format of tests array." });
    }

    const companyId = await findCompanyIdByName(company_name);
    const jobRoleId = await findJobRole(job_role);
    const workArrangementId = await findWorkArrangementIdByName(work_arrangement);
    const jobLocationId = await findJobLocationIdByName(job_location);

    // Validate and fetch test details
    let processedTests;
    try {
      processedTests = await findTestIdsByName(tests);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Calculate total_time and total_questions for each test
    // const testsWithDetails = tests.map(test => {
    //   const totalQuestions = Object.values(test.test_difficulty).reduce((sum, count) => sum + count, 0);
    //   const totalTime = totalQuestions * QUESTION_TIME_PER_MINUTE;
    //   // const testId = processedTests.find(pt => pt.test_name === test.test_name).id; // Assuming processedTests has test IDs
    //   const testResult = await client.query('SELECT id, categories FROM "tests" WHERE test_name = $1', [test_name]);

    //   if (testResult.rows.length === 0) {
    //     throw new Error(`Test '${test_name}' not found`);
    //   }

    //   const testId = testResult.rows[0].id; 

    //   return {
    //     ...test,
    //     total_time: totalTime,
    //     total_questions: totalQuestions,
    //     test_id: testId
    //   };
    // });
    const testsWithDetails = await Promise.all(tests.map(async (test) => {
      const totalQuestions = Object.values(test.test_difficulty).reduce((sum, count) => sum + count, 0);
      const totalTime = totalQuestions * QUESTION_TIME_PER_MINUTE;
    
      // Fetch test ID from the database
      const testResult = await client.query('SELECT id, categories FROM "tests" WHERE test_name = $1', [test.test_name]);
    
      if (testResult.rows.length === 0) {
        throw new Error(`Test '${test.test_name}' not found`);
      }
    
      const testId = testResult.rows[0].id;
    
      return {
        ...test,
        total_time: totalTime,
        total_questions: totalQuestions,
        test_id: testId
      };
    }));

    const assessmentLinks = await generateUniqueLink();
    const assessmentData = {
      assessment_name,
      company_id: companyId,
      // tests, // Store test configurations
      tests: testsWithDetails,
      shareableLink: assessmentLinks.shareableLink,
      uniquelink: assessmentLinks.link,
      created_by: req.user.id,
      assessment_time: tests.reduce((totalTime, test) => {
        return totalTime + Object.values(test.test_difficulty).reduce((sum, count) => sum + count, 0) * QUESTION_TIME_PER_MINUTE;
      }, 0),
      job_role_id: jobRoleId,
      work_arrangement_id: workArrangementId,
      job_location_id: jobLocationId,
    };

    const assessment = await saveAssessment(assessmentData);

    // Fetch the names of job role, work arrangement, and job location
    const jobRoleName = await findJobRoleNameById(jobRoleId);
    const workArrangementName = await findWorkArrangementNameById(workArrangementId);
    const jobLocationName = await findJobLocationNameById(jobLocationId);

    analytics.identify({
      userId: String(req.user?.id || 'anonymous'),
      traits: {
        assessmentId: assessment.id,
        assessment_name: assessment.assessment_name,
        createdBy: assessment.created_by,
        company_id: assessment.company_id,
      }
    });

    analytics.identify({
      userId: String(req.user?.id || 'anonymous'),
      traits: {
        name: req.user.name,
        email: req.user.email,
      }
    });

    analytics.track({
      userId: String(req.user?.id || 'anonymous'),
      event: 'Assessment Created',
      properties: {
        assessmentId: assessment.id,
        assessment_name: assessment.assessment_name,
        company_id: assessment.company_id,
        tests: assessment.tests,
        shareableLink: assessment.shareableLink,
        created_at: new Date().toISOString(),
      }
    });

    // res.status(201).json({ assessment });
    res.status(201).json({
      assessment: {
        ...assessment,
        job_role_name: jobRoleName,
        work_arrangement_name: workArrangementName,
        job_location_name: jobLocationName
      }
    });
  } catch (error) {
    console.error("Error creating Assessment:", error.message);
    res.status(500).json({ error: "Error creating Assessment", error: error.message });
  }
};


// Get all assessments
const getAllAssessments = catchAsyncErrors(async (req, res, next) => {
  try {
    const assessments = await client.query('SELECT * FROM assessments');

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    // Track the get all assessments event in Segment
    analytics.track({
      userId: String(req.user?.id || 'anonymous'),
      event: 'Get All Assessments',
      properties: {
        viewedAt: new Date().toISOString(),
        assessmentsCount: assessments.rows.length,
      }
    });

    res.status(200).json({ assessments: assessments.rows });
  } catch (error) {
    console.error("Error fetching assessments:", error.message);
    res.status(500).json({ error: "Error fetching assessments", error: error.message });
  }
});

// Get all user assessments
// const getAllUserAssessments = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const userAssessments = await client.query('SELECT * FROM assessments WHERE created_by = $1', [userId]);

//     // Check if req.user and req.user.id are defined
//     if (!req.user || !req.user.id) {
//       console.error("User ID is missing in the request");
//       return res.status(400).json({ error: "User ID is missing in the request" });
//     }

//     if (userAssessments.rows.length === 0) {
//       return res.status(200).json({ error: "No assessments found for this user" });
//     }

//     // Track the get all user assessments event in Segment
//     analytics.track({
//       userId: String(req.user?.id || 'anonymous'),
//       event: 'Get All User Assessments',
//       properties: {
//         userId,
//         viewedAt: new Date().toISOString(),
//         assessmentCount: userAssessments.rows.length,
//       }
//     });

//     res.status(200).json({ assessments: userAssessments.rows });
//   } catch (error) {
//     console.error("Error fetching user's assessments:", error.message);
//     res.status(500).json({ error: "Error fetching user's assessments", error: error.message });
//   }
// });

const getAllUserAssessments = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userAssessments = await client.query('SELECT * FROM assessments WHERE created_by = $1', [userId]);

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    if (userAssessments.rows.length === 0) {
      return res.status(200).json({ error: "No assessments found for this user" });
    }

    // Fetch names for each assessment
    const assessmentsWithNames = await Promise.all(userAssessments.rows.map(async (assessment) => {
      const jobRoleName = await findJobRoleNameById(assessment.job_role_id);
      const workArrangementName = await findWorkArrangementNameById(assessment.work_arrangement_id);
      const jobLocationName = await findJobLocationNameById(assessment.job_location_id);

      return {
        ...assessment,
        job_role_name: jobRoleName,
        work_arrangement_name: workArrangementName,
        job_location_name: jobLocationName
      };
    }));

    // Track the get all user assessments event in Segment
    analytics.track({
      userId: String(req.user?.id || 'anonymous'),
      event: 'Get All User Assessments',
      properties: {
        userId,
        viewedAt: new Date().toISOString(),
        assessmentCount: userAssessments.rows.length,
      }
    });

    res.status(200).json({ assessments: assessmentsWithNames });
  } catch (error) {
    console.error("Error fetching user's assessments:", error.message);
    res.status(500).json({ error: "Error fetching user's assessments", error: error.message });
  }
});

// Update Assessment
// const updateAssessment = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { assessment_name, company_name, tests } = req.body;

//     // Check if req.user and req.user.id are defined
//     if (!req.user || !req.user.id) {
//       console.error("User ID is missing in the request");
//       return res.status(400).json({ error: "User ID is missing in the request" });
//     }

//     // Validate request data
//     if (!assessment_name || !company_name || !tests) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Find company ID by name
//     const companyId = await findCompanyIdByName(company_name);

//     // Find test IDs by names
//     const testIds = await findTestIdsByName(tests);

//     // Update assessment data in the database
//     const query = `
//           UPDATE assessments 
//           SET assessment_name = $1, company_id = $2, tests = $3
//           WHERE id = $4`;
//     const values = [assessment_name, companyId, testIds, id];
//     const updateAssessment = await client.query(query, values);

//     // Identify the user who updated the assessment in Segment
//     analytics.identify({
//       userId: String(req.user?.id || 'anonymous'),
//       traits: {
//         name: req.user.name,
//         email: req.user.email,
//       }
//     });

//     analytics.identify({
//       userId: String(req.user?.id || 'anonymous'),
//       traits: {
//         name: updateAssessment.assessment_name,
//       }
//     });

//     // Track the assessment update event in Segment
//     analytics.track({
//       userId: String(req.user?.id || 'anonymous'),
//       event: 'Assessment Updated',
//       properties: {
//         assessmentId: id,
//         assessment_name,
//         company_id: companyId,
//         tests: testIds,
//         updated_at: new Date().toISOString(),
//       }
//     });

//     res.status(200).json({ message: 'Assessment updated successfully' });
//   } catch (error) {
//     console.error("Error updating Assessment:", error.message);
//     res.status(500).json({ error: "Error updating Assessment", error: error.message });
//   }
// });

const updateAssessment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assessment_name, company_name, job_role, work_arrangement, job_location, tests } = req.body;

    // Validate user ID
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    // Validate request data
    if (!assessment_name || !company_name || !job_role || !work_arrangement || !job_location || !Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Check if the user already has an assessment with the same name (excluding the current assessment)
    const existingAssessment = await client.query(
      'SELECT id FROM assessments WHERE assessment_name = $1 AND created_by = $2 AND id != $3',
      [assessment_name, req.user.id, id]
    );
    if (existingAssessment.rows.length > 0) {
      return res.status(409).json({ error: "You already have an assessment with this name" });
    }

    // Fetch related IDs
    const companyId = await findCompanyIdByName(company_name);
    const jobRoleId = await findJobRole(job_role);
    const workArrangementId = await findWorkArrangementIdByName(work_arrangement);
    const jobLocationId = await findJobLocationIdByName(job_location);

    // Validate and fetch test details
    let processedTests;
    try {
      processedTests = await findTestIdsByName(tests);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Calculate total_time and total_questions for each test
    const testsWithDetails = await Promise.all(tests.map(async (test) => {
      const totalQuestions = Object.values(test.test_difficulty).reduce((sum, count) => sum + count, 0);
      const totalTime = totalQuestions * QUESTION_TIME_PER_MINUTE;
      
      // Fetch test ID from the database
      const testResult = await client.query('SELECT id, categories FROM "tests" WHERE test_name = $1', [test.test_name]);
      if (testResult.rows.length === 0) {
        throw new Error(`Test '${test.test_name}' not found`);
      }
      
      const testId = testResult.rows[0].id;
      
      return {
        ...test,
        total_time: totalTime,
        total_questions: totalQuestions,
        test_id: testId
      };
    }));

    // Update assessment in the database
    const query = `
      UPDATE assessments 
      SET assessment_name = $1, company_id = $2, job_role_id = $3, work_arrangement_id = $4, job_location_id = $5, tests = $6::jsonb[]
      WHERE id = $7 AND created_by = $8
    `;
    const values = [assessment_name, companyId, jobRoleId, workArrangementId, jobLocationId, testsWithDetails, id, req.user.id];
    await client.query(query, values);

    // Track the assessment update event in analytics
    analytics.identify({
      userId: String(req.user.id),
      traits: {
        name: req.user.name,
        email: req.user.email,
      }
    });

    analytics.track({
      userId: String(req.user.id),
      event: 'Assessment Updated',
      properties: {
        assessmentId: id,
        assessment_name,
        company_id: companyId,
        job_role_id: jobRoleId,
        work_arrangement_id: workArrangementId,
        job_location_id: jobLocationId,
        tests: testsWithDetails,
        updated_at: new Date().toISOString(),
      }
    });

    res.status(200).json({ message: 'Assessment updated successfully' });
  } catch (error) {
    console.error("Error updating Assessment:", error.message);
    res.status(500).json({ error: "Error updating Assessment", error: error.message });
  }
});





// Delete Assessment
const deleteAssessment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    // Delete assessment from the database
    const query = 'DELETE FROM assessments WHERE id = $1';
    const values = [id];
    await client.query(query, values);

    // Track the assessment deletion event in Segment
    analytics.track({
      userId: String(req.user?.id || 'anonymous'),
      event: 'Assessment Deleted',
      properties: {
        assessmentId: id,
        deleted_at: new Date().toISOString(),
      }
    });

    res.status(200).json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error("Error deleting Assessment:", error.message);
    res.status(500).json({ error: "Error deleting Assessment", error: error.message });
  }
});

const inviteCandidate = async (req, res) => {
  try {
    const { assessmentId, candidateEmail, firstName, lastName } = req.body; // Assuming you have userEmail in your request body

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    const result = await client.query('SELECT * FROM "assessments" WHERE id = $1', [assessmentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const assessment = result.rows[0];
    const shareableLink = assessment.shareablelink; // Corrected property name
    const assessmentTotalTime = assessment
    console.log(assessment, " this is assessment from invite candidate function");
    console.log(shareableLink, " this is link from invite candidate function");
    const message = `
      <p>Hi ${firstName},</p>
      <p>Great news! You've been invited to take an assessment for integrity.</p>
      <p>Completing this assessment will allow you to demonstrate the skills required for this role, so the employer can focus on your abilities rather than comparing resumes. This removes potential bias from the process, giving all candidates an equal opportunity to shine. The assessment will take ${assessment.assessment_time} minutes.</p>
      <p>Wondering what's in an assessment? Here's a step-by-step guide</p>
      <p>Which browser should you use? Can you do the assessment on your phone? Here's what you need to know</p>
      <p>Facing an issue with the assessment? Here's how you can troubleshoot</p>
      <a href="${shareableLink}" target="_blank" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start assessment</a>
    `;

    await sendEmail({
      email: candidateEmail,
      subject: `mentiro Assessment Invitation`,
      message,
    });

    // Track the candidate invitation event in Segment
    analytics.track({
      userId: String(req.user?.id),
      event: 'Candidate Invited',
      properties: {
        assessmentId,
        candidateEmail,
        firstName,
        lastName,
        shareableLink,
        invited_at: new Date().toISOString(),
      }
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.log("Error sending Email:", error.message);
    res.status(500).json({ error: "Error sending Email", error: error.message })
  }
}

module.exports = { createAssessment, getAllAssessments, getAssessmentByLink, getAllUserAssessments, updateAssessment, deleteAssessment, inviteCandidate };