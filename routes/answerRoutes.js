// routes/answerRouter.js
const express = require('express');
const router = express.Router();
const {verifyAnswer} = require('../controllers/answerController');

// Route to verify answer
router.post('/verify', verifyAnswer);

module.exports = router;
