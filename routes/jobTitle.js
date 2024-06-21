// routes/answerRouter.js
const express = require('express');
const router = express.Router();
const {saveJobTitleValues, getAllJobTitles} = require('../controllers/jobTitleController');

// Route to save work arrangement
router.post('/create', saveJobTitleValues);

// Route to get all answers
router.get("/", getAllJobTitles);

module.exports = router;
