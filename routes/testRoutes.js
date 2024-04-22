// routes/testRoutes.js
const express = require('express');
const { createTest, editTest, deleteTest, getAllTests } = require('../controllers/testController');
const { verifyTokenAndExtractUserId } = require("../middleware/verifyToken");

const router = express.Router();

router.get("/allTests", getAllTests);
router.post("/create/test", verifyTokenAndExtractUserId, createTest);
router.put("/edit/test/:id", verifyTokenAndExtractUserId, editTest);
router.delete("/delete/test/:id", verifyTokenAndExtractUserId, deleteTest);

module.exports = router;