// routes/companyRoutes.js

const express = require('express');
const { createQuestionAndAnswer, getAllQuestion, deleteQuestion, updateQuestion} = require('../controllers/questionController');
const {verifyTokenAndExtractUserId} = require("../middleware/verifyToken");

const router = express.Router();

router.get("/AllQuestion", getAllQuestion);
router.post("/create/question",verifyTokenAndExtractUserId,createQuestionAndAnswer);
router.delete("/delete/:id", verifyTokenAndExtractUserId, deleteQuestion);
router.put("/update/:id", verifyTokenAndExtractUserId, updateQuestion);

module.exports = router;