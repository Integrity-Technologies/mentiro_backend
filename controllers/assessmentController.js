const { createAssessmentsTable, saveAssessment } = require("../models/assessment");
const { client } = require("../db/index.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Function to generate a unique random string
const generateUniqueLink = async () => {
    let link;
    let checkLinkResult; // Declare checkLinkResult outside the loop
    do {
      link = Math.random().toString(36).substring(2, 15);
      const checkLinkQuery = `
        SELECT * FROM assessments WHERE link = $1
      `;
      checkLinkResult = await client.query(checkLinkQuery, [link]); // Assign checkLinkResult here
    } while (checkLinkResult.rows.length > 0);
    return link;
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

  // Function to find category IDs by names
  const findTestIdsByName = async (tests) => {
    try {
      const testIds = [];
  
      for (const testName of tests) {
        const result = await client.query('SELECT id FROM "tests" WHERE test_name = $1', [testName]);
        if (result.rows.length > 0) {
            testIds.push(result.rows[0].id);
        } else {
          // Handle the case if a category with the provided name does not exist
          throw new Error(`Test '${testName}' not found`);
          // return res.status(400).json({ error: `Category `${categoryName}` not found`});
        }
      }
      return testIds;
    } catch (error) {
      throw error;
    }
  };

const getAssessmentByLink = catchAsyncErrors(async (req, res) => {
    try {
      const { uniqueLink } = req.params;
      const query = `
        SELECT * FROM assessments
        WHERE link = $1`;
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
  const createAssessment = catchAsyncErrors(async (req, res, next) => {
    try {
      await createAssessmentsTable();
  
      const { assessment_name, company_name, tests } = req.body;
  
     // Validate request data
    if (!assessment_name || !company_name || !tests) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Find company ID by name
    const companyId = await findCompanyIdByName(company_name);
  
    // Find test IDs by names
    const testIds = await findTestIdsByName(tests);

      // Generate a unique link
      const link = await generateUniqueLink();
  
      // Create the assessment object with the extracted data
      const assessmentData = {
        assessment_name,
        company_id: companyId, // Can be null if company_name is not provided
        tests:testIds,
        link,
        created_by: req.user.id,
      }
          // Save assessment data in the database
    const assessment = await saveAssessment(assessmentData);
    res.status(201).json({ assessment });
  } catch (error) {
    console.error("Error creating Assessment:", error.message);
      res.status(500).json({ error: "Error creating Assessment" });
  }
});



// Get All Assessments (for authorized users)
const getAllAssessments = catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user.id; // Assuming user ID is retrieved from the request
  
      let query = `SELECT * FROM assessments`;
      if (userId) {
        query += ` WHERE created_by = $1`;
        const values = [userId];
        const assessments = await client.query(query, values);
        res.status(200).json({ assessments: assessments.rows });
      } else {
        res.status(401).json({ error: "Unauthorized access" });
      }
    } catch (error) {
      next(error); // Pass the error to the error handler middleware
    }
  });
  
  module.exports = { createAssessment, getAllAssessments, getAssessmentByLink };