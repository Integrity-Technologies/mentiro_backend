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
      console.log(link.link, link.shareableLink + " from generateuniquelink() function in create assessments");
  
      // Create the assessment object with the extracted data
      const assessmentData = {
        assessment_name,
        company_id: companyId, // Can be null if company_name is not provided
        tests:testIds,
        shareableLink:link.shareableLink,
        uniquelink:link.link,
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