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

// Get candidate by full name
const getCandidateByFullName = async (firstName, lastName) => {
  try {
    const result = await client.query('SELECT * FROM candidates WHERE first_name = $1 AND last_name = $2', [firstName, lastName]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error getting candidate by full name:", error.message);
    throw new Error("Error getting candidate by full name");
  }
};

// Create candidate
const createCandidate = [
  ...candidateValidationRules,
  handleValidationErrors,
  catchAsyncErrors(async (req, res) => {
    const candidateData = req.body;

    await createCandidateTable();

    // Check if a candidate with the same email already exists
    const existingCandidate = await client.query('SELECT * FROM "candidates" WHERE email = $1', [candidateData.email]);
    if (existingCandidate.rows.length > 0) {
      return sendErrorResponse(res, 400, 'Candidate with this email already exists');
    }

    // Check if a candidate with the same first name and last name already exists
    const existingCandidateByName = await getCandidateByFullName(candidateData.first_name, candidateData.last_name);
    if (existingCandidateByName) {
      return sendErrorResponse(res, 400, 'Candidate with this first name and last name already exists');
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
      res.status(500).json({ error: "An internal server error occurred" });
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

    // Check if the candidate exists
    const existingCandidate = await client.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
    if (existingCandidate.rows.length === 0) {
      return sendErrorResponse(res, 404, "Candidate not found");
    }

    // Check if a candidate with the same first name and last name already exists
    const existingCandidateByName = await getCandidateByFullName(updatedData.first_name, updatedData.last_name);
    if (existingCandidateByName) {
      return sendErrorResponse(res, 400, 'Candidate with this first name and last name already exists');
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
      res.status(500).json({ error: "An internal server error occurred" });
    }
  })
];

// Other controller functions...

// Get all candidates
const getAllCandidate = catchAsyncErrors(async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM candidates');
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
const getAllUserCandidate = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user.id; // Assume userId is extracted from the token

    // Fetch assessments created by the user
    const assessmentsQuery = 'SELECT id FROM "assessments" WHERE created_by = $1';
    const assessmentsResult = await client.query(assessmentsQuery, [userId]);

    if (assessmentsResult.rows.length === 0) {
      return res.status(404).json({ error: "No assessments found for this user" });
    }

    const assessmentIds = assessmentsResult.rows.map(assessment => assessment.id);

    // Fetch results for these assessments
    const resultsQuery = 'SELECT DISTINCT candidate_id FROM "results" WHERE assessment_id = ANY($1)';
    const results = await client.query(resultsQuery, [assessmentIds]);

    if (results.rows.length === 0) {
      return res.status(404).json({ error: "No candidates found for these assessments" });
    }

    const candidateIds = results.rows.map(result => result.candidate_id);

    // Fetch candidates who have attempted these assessments
    const candidateQuery = 'SELECT * FROM "candidates" WHERE id = ANY($1)';
    const candidateResult = await client.query(candidateQuery, [candidateIds]);

    res.status(200).json(candidateResult.rows);
  } catch (error) {
    console.error("Error getting candidates:", error.message);
    res.status(500).json({ message: "Error getting candidates", error: error.message });
  }
});

// Delete candidate by ID
const deleteCandidateById = catchAsyncErrors(async (req, res) => {
  const candidateId = req.params.id;
  try {
    const existingCandidate = await client.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
    if (existingCandidate.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const result = await client.query('DELETE FROM candidates WHERE id = $1 RETURNING *', [candidateId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }
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
