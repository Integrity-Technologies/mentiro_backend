// routes/answerRouter.js
const express = require('express');
const router = express.Router();
const {saveJobRoleFunction, getAllJobRoles} = require('../controllers/jobRoleController');

// Route to save work arrangement
router.post('/create', saveJobRoleFunction);

// Route to get all answers
router.get("/",getAllJobRoles);

module.exports = router;
