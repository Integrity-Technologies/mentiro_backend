// routes/assessmentRoutes.js
const express = require('express');
const router = express.Router();
const { createAssessment, getAllAssessments, getAssessmentByLink } = require('../controllers/assessmentController');
const {verifyTokenAndExtractUserId} = require("../middleware/verifyToken");

// Create assessment route
router.post('/create/assessment', verifyTokenAndExtractUserId, createAssessment);

// Get all assessments
router.get('/my/assessments',verifyTokenAndExtractUserId, getAllAssessments);

// Get assessment by shareable link
router.get("/assessment/:uniqueLink", verifyTokenAndExtractUserId, getAssessmentByLink );

module.exports = router;
