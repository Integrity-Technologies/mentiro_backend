const express = require("express");
const {
  getAllCandidate,
  getAllUserCandidate,
  createCandidate,
  editCandidateById,
  deleteCandidateById,
  getCandidateById
} = require("../controllers/candidateController.js");
const { verifyTokenAndExtractUserId } = require("../middleware/verifyToken.js");
const router = express.Router();

// Get all candidates
router.get("/allCandidate",verifyTokenAndExtractUserId, getAllCandidate); // tested in postman successfully

// Get all candidates who have attempted the assessments created by the logged-in user
router.get("/user/candidates",verifyTokenAndExtractUserId, getAllUserCandidate );

// Create a new candidate
router.post("/create",verifyTokenAndExtractUserId, createCandidate); // tested in postman successfully

// Edit an existing candidate
router.put("/edit/:id",verifyTokenAndExtractUserId, editCandidateById); // tested in postman successfully

// Delete a candidate
router.delete("/delete/:id",verifyTokenAndExtractUserId, deleteCandidateById); // tested in postman successfully

router.get("/:id",getCandidateById);

module.exports = router;
