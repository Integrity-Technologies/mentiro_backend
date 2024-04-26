const express = require("express");
const {
  getAllCandidate,
  createCandidate,
  editCandidateById,
  deleteCandidateById,
} = require("../controllers/candidateController.js");
const { verifyTokenAndExtractUserId } = require("../middleware/verifyToken.js");
const router = express.Router();

// Get all candidates
router.get("/all", getAllCandidate); // tested in postman successfully

// Create a new candidate
router.post("/create", createCandidate); // tested in postman successfully

// Edit an existing candidate
router.put("/edit/:id", editCandidateById); // tested in postman successfully

// Delete a candidate
router.delete("/delete/:id", deleteCandidateById); // tested in postman successfully

module.exports = router;
