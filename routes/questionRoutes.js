// routes/companyRoutes.js

const express = require('express');
const { createQuestionAndAnswer, getAllQuestion, deleteQuestion, updateQuestion, getQuestionById} = require('../controllers/questionController');
const {verifyTokenAndExtractUserId} = require("../middleware/verifyToken");

const router = express.Router();

router.get("/AllQuestion",verifyTokenAndExtractUserId, getAllQuestion);
// router.post("/filterAllQUestion",getAllQuestionByCategoryandDifficultyLevel) // tested in postman successfully
router.post("/create/question",verifyTokenAndExtractUserId,createQuestionAndAnswer); // tested in postman successfully
router.delete("/delete/:id", verifyTokenAndExtractUserId, deleteQuestion); // tested in postman successfully
router.put("/update/:id", verifyTokenAndExtractUserId, updateQuestion); // tested in postman successfully
router.get("/:id", getQuestionById); // tested in postman successfully
module.exports = router;