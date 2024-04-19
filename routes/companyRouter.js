// routes/companyRoutes.js

const express = require('express');
const { getAllCompany, createCompany, getAllCompaniesOfUser} = require('../controllers/companyController');
const {verifyTokenAndExtractUserId} = require("../middleware/verifyToken");

const router = express.Router();

router.get("/AllCompany",getAllCompany);
router.get("/myCompanies", verifyTokenAndExtractUserId, getAllCompaniesOfUser);
router.post("/create/company",verifyTokenAndExtractUserId,createCompany);

module.exports = router;