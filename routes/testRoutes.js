// routes/testRoutes.js
const express = require('express');
const { createTest, editTest, deleteTest, getAllTests, getTestById } = require('../controllers/testController');
const { verifyTokenAndExtractUserId } = require("../middleware/verifyToken");

const router = express.Router();

router.get("/allTests",verifyTokenAndExtractUserId, getAllTests); // tested in postman successfully
router.post("/create/test", verifyTokenAndExtractUserId, createTest); // tested in postman successfully
router.get("/:id",verifyTokenAndExtractUserId,getTestById); // tested in postman successfully
router.put("/edit/test/:id",verifyTokenAndExtractUserId, editTest); // tested in postman successfully
router.delete("/delete/test/:id",verifyTokenAndExtractUserId, deleteTest); // tested in postman successfully

module.exports = router;