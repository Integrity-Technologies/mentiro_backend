// routes/companyRoutes.js

const express = require('express');
const { getAllCompany, createCompany, getAllCompaniesOfUser, updateCompany, deleteCompany } = require('../controllers/companyController');
const { verifyTokenAndExtractUserId } = require("../middleware/verifyToken");

const router = express.Router();

router.get("/AllCompany", getAllCompany); // Retrieve all companies
router.get("/myCompanies", verifyTokenAndExtractUserId, getAllCompaniesOfUser); // Retrieve companies associated with the user
router.post("/create/company", verifyTokenAndExtractUserId, createCompany); // Create a new company
router.put("/update/company/:id", verifyTokenAndExtractUserId, updateCompany); // Update an existing company
router.delete("/delete/company/:id", verifyTokenAndExtractUserId, deleteCompany); // Delete an existing company

module.exports = router;
