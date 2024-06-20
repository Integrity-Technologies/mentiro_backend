// candidateController.js 
const { createCandidateTable, saveCandidate } = require("../models/candidate");
const { client } = require("../db/index.js");
const analytics = require('../segment/segmentConfig');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { sendErrorResponse } = require("../utils/res_error");
const { body, validationResult } = require('express-validator');

// Common validation rules for candidate
const candidateValidationRules = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('first_name')
    .isString().withMessage('First name must be a string')
    .isLength({ min: 1 }).withMessage('First name is required'),
  body('last_name')
    .isString().withMessage('Last name must be a string')
    .isLength({ min: 1 }).withMessage('Last name is required'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create candidate
const createCandidate = [
  ...candidateValidationRules,
  handleValidationErrors,
  catchAsyncErrors(async (req, res) => {
    const candidateData = req.body;

    await createCandidateTable();

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    // Check if a candidate with the same email already exists
    const existingCandidate = await client.query('SELECT * FROM "candidates" WHERE email = $1', [candidateData.email]);
    if (existingCandidate.rows.length > 0) {
      return sendErrorResponse(res, 409, 'Candidate with this email already exists');
    }

    try {
      // Save the candidate data
      const newCandidate = await saveCandidate(candidateData);

      // Identify the candidate in Segment
      analytics.identify({
        userId: String(newCandidate.id),
        traits: {
          email: newCandidate.email,
          firstName: newCandidate.first_name,
          lastName: newCandidate.last_name,
        }
      });

      // Track the candidate creation event in Segment
      analytics.track({
        userId: String(newCandidate.id),
        event: 'Candidate Created',
        properties: {
          email: newCandidate.email,
          firstName: newCandidate.first_name,
          lastName: newCandidate.last_name,
          createdAt: new Date().toISOString(),
        }
      });

      res.status(201).json(newCandidate);
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(500).json({ error: error.message });
    }
  })
];

// Edit candidate by ID
const editCandidateById = [
  ...candidateValidationRules,
  handleValidationErrors,
  catchAsyncErrors(async (req, res) => {
    const candidateId = req.params.id;
    const updatedData = req.body;

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    // Check if the candidate exists
    const existingCandidate = await client.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
    if (existingCandidate.rows.length === 0) {
      return sendErrorResponse(res, 404, "Candidate not found");
    }

    try {
      // Update candidate data
      const result = await client.query(
        'UPDATE candidates SET first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING *',
        [updatedData.first_name, updatedData.last_name, updatedData.email, candidateId]
      );

      if (result.rows.length === 0) {
        return sendErrorResponse(res, 404, "Candidate not found");
      }

      // Identify the candidate in Segment
      analytics.identify({
        userId: String(candidateId),
        traits: {
          email: updatedData.email,
          firstName: updatedData.first_name,
          lastName: updatedData.last_name,
        }
      });

      // Track the candidate edit event in Segment
      analytics.track({
        userId: String(candidateId),
        event: 'Candidate Edited',
        properties: {
          editedAt: new Date().toISOString(),
          email: updatedData.email,
          firstName: updatedData.first_name,
          lastName: updatedData.last_name,
        }
      });

      res.status(200).json({ success: true, message: "Candidate details updated successfully" });
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(500).json({ error: error.message });
    }
  })
];

// Other controller functions...

// Get all candidates
const getAllCandidate = catchAsyncErrors(async (req, res) => {
  try {

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    const result = await client.query('SELECT * FROM candidates');

    analytics.track({
      userId: String(req.user.id),
      event: 'Admin Viewed All Users',
      properties: {
        fetchedAt: new Date().toISOString(),
      }
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting candidates:", error.message);
    res.status(500).json({ message: "Error getting candidates", error: error.message });
  }
});

// Get candidate by ID
const getCandidateById = catchAsyncErrors(async (req, res) => {
  const candidateId = req.params.id;
  try {
    const result = await client.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error getting candidate", error: error.message });
  }
});

// Get all candidates associated with a user
// const getAllUserCandidate = catchAsyncErrors(async (req, res) => {
//   try {
//     const userId = req.user.id; // Assume userId is extracted from the token

//     // Fetch assessments created by the user
//     const assessmentsQuery = 'SELECT id FROM "assessments" WHERE created_by = $1';
//     const assessmentsResult = await client.query(assessmentsQuery, [userId]);

//     if (assessmentsResult.rows.length === 0) {
//       return res.status(404).json({ error: "No assessments found for this user" });
//     }

//     const assessmentIds = assessmentsResult.rows.map(assessment => assessment.id);

//     // Fetch results for these assessments
//     const resultsQuery = 'SELECT DISTINCT candidate_id FROM "results" WHERE assessment_id = ANY($1)';
//     const results = await client.query(resultsQuery, [assessmentIds]);

//     if (results.rows.length === 0) {
//       return res.status(404).json({ error: "No candidates found for these assessments" });
//     }

//     const candidateIds = results.rows.map(result => result.candidate_id);

//     // Fetch candidates who have attempted these assessments
//     const candidateQuery = 'SELECT * FROM "candidates" WHERE id = ANY($1)';
//     const candidateResult = await client.query(candidateQuery, [candidateIds]);

//     res.status(200).json(candidateResult.rows);
//   } catch (error) {
//     console.error("Error getting candidates:", error.message);
//     res.status(500).json({ message: "Error getting candidates", error: error.message });
//   }
// });

// Get all candidates associated with a user, including company IDs
const getAllUserCandidate = catchAsyncErrors(async (req, res) => {
  try {

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    const userId = req.user.id; // Assume userId is extracted from the token

    // Fetch assessments created by the user
    const assessmentsQuery = `
      SELECT id, company_id 
      FROM "assessments" 
      WHERE created_by = $1
    `;
    const assessmentsResult = await client.query(assessmentsQuery, [userId]);

    if (assessmentsResult.rows.length === 0) {
      return res.status(200).json({ error: "No assessments found for this user" });
    }

    const assessments = assessmentsResult.rows;
    const assessmentIds = assessments.map(assessment => assessment.id);

    // Fetch results for these assessments
    const resultsQuery = `
      SELECT DISTINCT candidate_id, assessment_id 
      FROM "results" 
      WHERE assessment_id = ANY($1)
    `;
    const results = await client.query(resultsQuery, [assessmentIds]);

    if (results.rows.length === 0) {
      return res.status(200).json({ error: "No candidates found for these assessments" });
    }

    const candidateIds = results.rows.map(result => result.candidate_id);

    // Fetch candidates who have attempted these assessments
    const candidateQuery = `
      SELECT * 
      FROM "candidates" 
      WHERE id = ANY($1)
    `;
    // const candidateQuery = `
    //   SELECT id, first_name, last_name, email, is_active, created_at 
    //   FROM candidates 
    //   WHERE id = ANY($1)
    // `;
    const candidateResult = await client.query(candidateQuery, [candidateIds]);

    const candidates = candidateResult.rows;

    // Create a map of assessment_id to company_id
    const assessmentToCompanyMap = {};
    assessments.forEach(assessment => {
      assessmentToCompanyMap[assessment.id] = assessment.company_id;
    });

    // Add company_id information to each candidate
    const candidatesWithCompanies = candidates.map(candidate => {
      const candidateAssessments = results.rows.filter(result => result.candidate_id === candidate.id);
      const companies = candidateAssessments.map(ca => assessmentToCompanyMap[ca.assessment_id]);
      return {
        ...candidate,
        companies: [...new Set(companies)] // Ensure unique company IDs
      };
    });

    analytics.track({
      userId: String(userId),
      event: 'Candidate Assessments Fetched',
      properties: {
        fetchedAt: new Date().toISOString(),
      }
    });

    res.status(200).json(candidatesWithCompanies);
  } catch (error) {
    console.error("Error getting candidates:", error.message);
    res.status(500).json({ message: "Error getting candidates", error: error.message });
  }
});

// Delete candidate by ID
const deleteCandidateById = catchAsyncErrors(async (req, res) => {
  const candidateId = req.params.id;
  try {

    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    const existingCandidate = await client.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
    if (existingCandidate.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const result = await client.query('DELETE FROM candidates WHERE id = $1 RETURNING *', [candidateId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    analytics.track({
      userId: String(candidateId),
      event: 'Candidate Deleted Successfully',
      properties: {
        deletedAt: new Date().toISOString(),
        firstName: existingCandidate.first_name
      }
    });

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting candidate", error: error.message });
  }
});

module.exports = {
  createCandidate,
  editCandidateById,
  getAllCandidate,
  getCandidateById,
  getAllUserCandidate,
  deleteCandidateById,
};
