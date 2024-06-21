// routes/answerRouter.js
const express = require('express');
const router = express.Router();
const {saveCompanySizeValues, getAllCompanySizes} = require('../controllers/companySizeController');

// Route to save work arrangement
router.post('/create', saveCompanySizeValues);

// Route to get all answers
router.get("/", getAllCompanySizes);

module.exports = router;
