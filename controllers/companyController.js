const { createCompanyTable, saveCompany } = require("../models/company");
const { client } = require("../db/index.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Get all company
const getAllCompany = catchAsyncErrors(async (req, res, next) => {
  try {
    await createCompanyTable();

    const companyResult = await client.query(`
      SELECT companies.*, "user".id as created_by, "user".first_name as created_by_user
      FROM companies
      LEFT JOIN "user" ON companies.created_by = "user".id
    `);

    // If no companies found, return an empty array
    if (companyResult.rows.length === 0) {
      return res.status(400).json({ error: "No companies found" });
    }

    res.status(200).json(companyResult.rows); // Return all company data in the response
  } catch (error) {
    console.error("Error fetching companies:", error.message);
    if (error.code === '42P01') {
      return res.status(500).json({ error: "Table does not exist. Please create the table first." });
    }
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
        await createCompanyTable();

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

// Update company
const updateCompany = catchAsyncErrors(async (req, res, next) => {
    try {
      // Extract company ID from request parameters
      const companyId = req.params.id;
  
      // Extract updated company data from the request body
      const { name, website, isActive, stripeCustomerId, planId } = req.body;
  
      // Validate request data
      if (!name) {
        return res.status(400).json({ error: "Company name is required" });
      }
  
      // Check if the company exists
      const existingCompany = await client.query('SELECT * FROM companies WHERE id = $1', [companyId]);
      if (existingCompany.rows.length === 0) {
        return res.status(404).json({ error: "Company not found" });
      }

      // Check if the updated company name already exists
      const duplicateCompany = await client.query('SELECT * FROM companies WHERE name = $1 AND id != $2', [name, companyId]);
      if (duplicateCompany.rows.length > 0) {
        return res.status(400).json({ error: "Another company with this name already exists" });
      }
  
      // Update the company object with the extracted data
      const updatedCompanyData = {
        name,
        website: website || existingCompany.rows[0].website, // Use existing website if not provided in the request body
        isActive: isActive || existingCompany.rows[0].isActive, // Use existing isActive value if not provided in the request body
        stripeCustomerId: stripeCustomerId || existingCompany.rows[0].stripeCustomerId, // Use existing stripeCustomerId if not provided in the request body
        planId: planId || existingCompany.rows[0].planId // Use existing planId if not provided in the request body
      };
  
      // Update the company data in the database
      await client.query(
        'UPDATE companies SET name = $1, website = $2, is_active = $3, stripe_customer_id = $4, plan_id = $5 WHERE id = $6',
        [updatedCompanyData.name, updatedCompanyData.website, updatedCompanyData.isActive, updatedCompanyData.stripeCustomerId, updatedCompanyData.planId, companyId]
      );
  
      // Send a success response
      res.status(200).json({ success: true, message: "Company updated successfully" });
    } catch (error) {
      console.error("Error updating company:", error.message);
      res.status(500).json({ error: "Error updating company" });
    }
  });

  
 // Delete company
const deleteCompany = catchAsyncErrors(async (req, res, next) => {
    try {
      // Extract company ID from request parameters
      const companyId = req.params.id;
  
      // Check if the company exists
      const existingCompany = await client.query('SELECT * FROM companies WHERE id = $1', [companyId]);
      if (existingCompany.rows.length === 0) {
        return res.status(404).json({ error: "Company not found" });
      }
  
      // Begin a transaction
      await client.query('BEGIN');
  
      // Delete assessments associated with the company
      await client.query('DELETE FROM assessments WHERE company_id = $1', [companyId]);
  
      // Delete tests associated with the company
      await client.query('DELETE FROM tests WHERE company_id = $1', [companyId]);
  
      // Delete the company data from the database
      await client.query('DELETE FROM companies WHERE id = $1', [companyId]);
  
      // Commit the transaction
      await client.query('COMMIT');
  
      // Send a success response
      res.status(200).json({ success: true, message: "Company deleted successfully" });
    } catch (error) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      console.error("Error deleting company:", error.message);
      res.status(500).json({ error: "Error deleting company" });
    }
  });
  

module.exports = { getAllCompany, createCompany, getAllCompaniesOfUser, updateCompany, deleteCompany };
