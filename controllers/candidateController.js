// controllers/candidateController.js

const { createCandidateTable, saveCandidate } = require("../models/candidate");
const { client } = require("../db/index.js");
const analytics = require('../segment/segmentConfig');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const getAllCandidate = catchAsyncErrors(async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM candidates');

    // analytics.track({
    //   // userId: String(req.user.id),
    //   event: 'Admin Viewed All Candidates',
    //   properties: {
    //     viewedAt: new Date().toISOString(),
    //     candidateCount: result.rows.length,
    //   }
    // });

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error getting candidates", error: error.message });
  }
});

const createCandidate = catchAsyncErrors(async (req, res) => {
  try {
    await createCandidateTable();
    const candidateData = req.body;
    const newCandidate = await saveCandidate(candidateData);

    analytics.identify({
      userId: String(newCandidate.id),
      traits: {
        email: newCandidate.email,
        firstName: newCandidate.first_name,
        lastName: newCandidate.last_name,
      }
    });

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
    res.status(500).json({ message: "Error creating candidate", error: error.message });
  }
});

// edit candidate
const editCandidateById = catchAsyncErrors(async (req, res) => {
    const candidateId = req.params.id;
    const updatedData = req.body;
    try {
      // Check if the candidate exists
      const existingCandidate = await client.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
      if (existingCandidate.rows.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Validate request data
    if (!updatedData.email || !updatedData.first_name || !updatedData.last_name) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  

      // Check if the updated email already exists
      const emailCheck = await client.query(
        'SELECT * FROM candidates WHERE email = $1 AND id != $2',
        [updatedData.email, candidateId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      // Perform the update query
      const result = await client.query(
        'UPDATE candidates SET first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING *',
        [updatedData.first_name, updatedData.last_name, updatedData.email, candidateId]
      );
      
      // Check if any rows were affected
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }
  
      analytics.identify({
        userId: String(candidateId),
        traits: {
          email: updatedData.email,
          firstName: updatedData.first_name,
          lastName: updatedData.last_name,
        }
      });
  
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

      res.status(200).json({ success: true, message: "candidate details updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating candidate", error: error.message });
    }
  });
  
// Get candidate by ID
const getCandidateById = catchAsyncErrors(async (req, res) => {
    const candidateId = req.params.id;
    try {
      // Query the database for the candidate with the specified ID
      const result = await client.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
      
      // Check if a candidate was found
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }
  
      analytics.track({
        userId: String(req.user.id),
        event: 'Admin Viewed Candidate Details',
        properties: {
          viewedAt: new Date().toISOString(),
          candidateId: candidateId,
        }
      });

      // Return the candidate data
      res.status(200).json(result.rows[0]);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: "Error getting candidate", error: error.message });
    }
  });

// delete candidate
const deleteCandidateById = catchAsyncErrors(async (req, res) => {
    const candidateId = req.params.id;
    try {
      // Check if the candidate exists
      const existingCandidate = await client.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
      if (existingCandidate.rows.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Start transaction
      await client.query('BEGIN');
      
      // Delete associated records from other tables (e.g., assessments, tests)
      // Adjust the DELETE queries based on your database schema
      await client.query('DELETE FROM assessments WHERE created_by = $1', [candidateId]);
      await client.query('DELETE FROM companies WHERE created_by = $1', [candidateId]);
  
      // Now delete the candidate
      const result = await client.query('DELETE FROM candidates WHERE id = $1 RETURNING *', [candidateId]);
      
      // Commit transaction if successful
      await client.query('COMMIT');
      
      // Check if any rows were affected
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }
  
      analytics.track({
        userId: String(candidateId),
        event: 'Candidate Deleted',
        properties: {
          deletedAt: new Date().toISOString(),
        }
      });

      res.status(200).json({ message: "Candidate deleted successfully" });
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      res.status(500).json({ message: "Error deleting candidate", error: error.message });
    }
  });
  

module.exports = {
  getAllCandidate,
  createCandidate,
  editCandidateById,
  deleteCandidateById,
  getCandidateById
};
