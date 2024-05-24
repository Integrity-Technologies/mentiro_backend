// routes/answerRouter.js
const express = require('express');
const router = express.Router();
const {saveWorkArrangementFunction, getAllWorkArrangements} = require('../controllers/workArrangementController');

// Route to save work arrangement
router.post('/create', saveWorkArrangementFunction);

// Route to get all answers
router.get("/",getAllWorkArrangements);

module.exports = router;
