// controllers/candidateController.js

const { createCandidateTable, saveCandidate } = require("../models/candidate");
const { client } = require("../db/index.js");
const bcrypt = require('bcrypt');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const saltRounds = 10;

const getAllCandidate = catchAsyncErrors(async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM candidate');
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
      const existingCandidate = await client.query('SELECT * FROM candidate WHERE id = $1', [candidateId]);
      if (existingCandidate.rows.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Validate request data
    if (!updatedData.email || !updatedData.password || !updatedData.first_name || !updatedData.last_name || !updatedData.phone) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  

      // Check if the updated email already exists
      const emailCheck = await client.query(
        'SELECT * FROM candidate WHERE email = $1 AND id != $2',
        [updatedData.email, candidateId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      // Hash the password if provided
      if (updatedData.password) {
        const hashedPassword = await bcrypt.hash(updatedData.password, saltRounds);
        updatedData.password = hashedPassword;
      }
  
      // Perform the update query
      const result = await client.query(
        'UPDATE candidate SET first_name = $1, last_name = $2, email = $3, phone = $4, password = $5 WHERE id = $6 RETURNING *',
        [updatedData.first_name, updatedData.last_name, updatedData.email, updatedData.phone, updatedData.password, candidateId]
      );
      
      // Check if any rows were affected
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }
  
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
      const result = await client.query('SELECT * FROM candidate WHERE id = $1', [candidateId]);
      
      // Check if a candidate was found
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }
  
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
      const existingCandidate = await client.query('SELECT * FROM candidate WHERE id = $1', [candidateId]);
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
      const result = await client.query('DELETE FROM candidate WHERE id = $1 RETURNING *', [candidateId]);
      
      // Commit transaction if successful
      await client.query('COMMIT');
      
      // Check if any rows were affected
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }
  
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
