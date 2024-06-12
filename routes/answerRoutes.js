// routes/answerRouter.js
const express = require('express');
const router = express.Router();
const {verifyAnswer,getAllAnswers} = require('../controllers/answerController');
const {verifyTokenAndExtractUserId} = require("../middleware/verifyToken");

// Route to verify answer
router.post('/verify', verifyAnswer);

// Route to get all answers
router.get("/allAnswers",getAllAnswers);

module.exports = router;
