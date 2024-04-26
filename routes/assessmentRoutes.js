// routes/assessmentRoutes.js
const express = require('express');
const router = express.Router();
const { 
    createAssessment, 
    getAllAssessments, 
    getAssessmentByLink, 
    getAllUserAssessments, 
    updateAssessment, 
    deleteAssessment 
} = require('../controllers/assessmentController');
const {verifyTokenAndExtractUserId} = require("../middleware/verifyToken");

// Create assessment route
router.post('/create/assessment', verifyTokenAndExtractUserId, createAssessment); // tested in postman successfully

// Get all assessments
router.get('/assessments', getAllAssessments); // tested in postman successfully

// Get all user assessments
router.get('/my/assessments', verifyTokenAndExtractUserId, getAllUserAssessments); // tested in postman successfully

// Get assessment by shareable link
router.get("/assessment/:uniqueLink", verifyTokenAndExtractUserId, getAssessmentByLink); // tested in postman successfully

// Update assessment
router.put('/assessment/:id', verifyTokenAndExtractUserId, updateAssessment); // tested in postman successfully

// Delete assessment
router.delete('/assessment/:id', verifyTokenAndExtractUserId, deleteAssessment); // tested in postman successfully

module.exports = router;
