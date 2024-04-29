// // routes/resultRoutes.js

// const express = require("express");
// const {
//   createResult,
//   getAllResults,
//   getSpecificCandidateResult,
//   getSpecificCandidateResultWithSpecificTest
// } = require("../controllers/resultController");
// const { verifyTokenAndExtractUserId } = require("../middleware/verifyToken");

// const router = express.Router();

// router.get("/AllResults", getAllResults);
// router.post("/create", verifyTokenAndExtractUserId, createResult);
// router.get("/specificCandidateResult/:candidate_id", getSpecificCandidateResult);
// router.get("/specificCandidateResult/:candidate_id/:test_id", getSpecificCandidateResultWithSpecificTest);

// module.exports = router;



// routes/resultRouter.js
const express = require('express');
const router = express.Router();
const {submitAnswer,createResult} = require('../controllers/resultController');

// Route to submit answer
router.post('/submit', submitAnswer);

// Route to create result
router.post('/create', createResult);

module.exports = router;
