const { createCompanyTable, saveCompany } = require("../models/company");
const { client } = require("../db/index.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Get all company
const getAllCompany = catchAsyncErrors(async (req, res, next) => {
  try {
    await createCompanyTable();

    const company = await client.query('SELECT * FROM "companies"');

    res.status(200).json(company.rows); // Return all company data in the response
  } catch (error) {
    console.error("Error fetching companies:", error.message);
    res.status(500).json({ error: "Error fetching companies" });
  }
});

// Get all companies of a specific user
const getAllCompaniesOfUser = catchAsyncErrors(async (req, res, next) => {
    try {
        // Extract user ID from req object (provided by verifyTokenAndExtractUserId middleware)
        const userId = req.user.id;

        // Fetch all companies associated with the user from the database
        const userCompanies = await client.query('SELECT * FROM companies WHERE created_by = $1', [userId]);

        // Return the list of user's companies in the response
        res.status(200).json(userCompanies.rows);
    } catch (error) {
        console.error("Error fetching user's companies:", error.message);
        res.status(500).json({ error: "Error fetching user's companies" });
    }
});

// create company
const createCompany = catchAsyncErrors(async (req, res, next) => {
    try {
         // Extract user ID from req object (provided by verifyTokenAndExtractUserId middleware)
         const userId = req.user.id;
         console.log(userId);

        // Extract company data from the request body
        const { name, website, isActive, stripeCustomerId, planId } = req.body;

        // Check if a company with the same name already exists
        const existingCompany = await client.query('SELECT * FROM companies WHERE name = $1', [name]);
        if (existingCompany.rows.length > 0) {
            return res.status(400).json({ error: "Company with this name already exists" });
        }

        // Create the company object with the extracted data
        const companyData = {
            name,
            website,
            created_by: userId, // Assign the user ID as the createdBy value
            isActive,
            stripeCustomerId,
            planId,
        };

        await createCompanyTable();

        // Save the company data in the database
        const newCompany = await saveCompany(companyData);

        // Send a success response with the newly created company data
        res.status(201).json({
            success: true,
            message: "Company created successfully",
            company: newCompany,
            userId: userId // Optionally, you can include the user ID in the response
        });
    } catch (error) {
        console.error("Error creating company:", error.message);
        res.status(500).json({ error: "Error creating company" });
    }
});

module.exports = createCompany;


module.exports = { getAllCompany, createCompany, getAllCompaniesOfUser };