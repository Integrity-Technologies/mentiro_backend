// routes/answerRouter.js
const express = require('express');
const router = express.Router();
const {saveJobLocationFunction, getAllJobLocations} = require('../controllers/jobLocationController');

// Route to save work arrangement
router.post('/create', saveJobLocationFunction);

// Route to get all answers
router.get("/",getAllJobLocations);

module.exports = router;
