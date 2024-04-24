// controllers/testController.js
const { createTestsTable, saveTest } = require("../models/test");
const { client } = require("../db/index.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Get all tests
const getAllTests = catchAsyncErrors(async (req, res, next) => {
  try {
    await createTestsTable();

    const tests = await client.query('SELECT * FROM "tests"');

    res.status(200).json(tests.rows); // Return all test data in the response
  } catch (error) {
    console.error("Error fetching tests:", error.message);
    res.status(500).json({ error: "Error fetching tests" });
  }
});

// Function to find company ID by name
const findCompanyIdByName = async (companyName) => {
    try {
      const result = await client.query('SELECT id FROM "companies" WHERE name = $1', [companyName]);
      if (result.rows.length > 0) {
        return result.rows[0].id;
      } else {
        // Handle the case if a company with the provided name does not exist
        throw new Error(`Company '${companyName}' not found`);
      }
    } catch (error) {
      throw error;
    }
  };
  
  // Function to find category IDs by names
  const findCategoryIdsByName = async (categoryNames) => {
    try {
      const categoryIds = [];
  
      for (const categoryName of categoryNames) {
        const result = await client.query('SELECT id FROM "category" WHERE category_name = $1', [categoryName]);
        if (result.rows.length > 0) {
          categoryIds.push(result.rows[0].id);
        } else {
          // Handle the case if a category with the provided name does not exist
          throw new Error(`Category '${categoryName}' not found`);
          // return res.status(400).json({ error: `Category `${categoryName}` not found`});
        }
      }
  
      return categoryIds;
    } catch (error) {
      throw error;
    }
  };
  
  // Create test
  const createTest = catchAsyncErrors(async (req, res, next) => {
    try {
        await createTestsTable();
      // Extract user ID from req object (provided by verifyTokenAndExtractUserId middleware)
      const userId = req.user.id;
  
      // Extract test data from the request body
      const { test_name, test_description, category_names, company_name } = req.body;
  
      // Validate request data
      if (!test_name || !category_names || !company_name) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
       // Check if a test with the same name already exists
       const existingTest = await client.query('SELECT * FROM tests WHERE test_name = $1', [test_name]);
       if (existingTest.rows.length > 0) {
           return res.status(400).json({ error: "Test with this name already exists" });
       }

      // Find company ID by name
      const companyId = await findCompanyIdByName(company_name);
  
      // Find category IDs by names
      const categoryIds = await findCategoryIdsByName(category_names);
  
      // Create the test object with the extracted data
      const testData = {
        test_name,
        test_description,
        categories: categoryIds,
        company_id: companyId,
        created_by: userId, // Assign the user ID as the createdBy value
      };
  
      // Save the test data in the database
      // Implement the saveTest function here
      const newTest = await saveTest(testData);
      // Send a success response with the newly created test data
      res.status(201).json({
        success: true,
        message: "Test created successfully",
        test: newTest,
        userId: userId // Optionally, you can include the user ID in the response
      });
    } catch (error) {
      console.error("Error creating test:", error.message);
      res.status(500).json({ error: "Error creating test" });
    }
  });
  
  // Edit test
  const editTest = catchAsyncErrors(async (req, res, next) => {
    try {
      // Extract test ID from request parameters
      const testId = req.params.id;
  
      // Extract updated test data from the request body
      const { test_name, test_description, category_names, company_name } = req.body;
  
      // Validate request data
      if (!test_name || !category_names || !company_name) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Find company ID by name
      const companyId = await findCompanyIdByName(company_name);
  
      // Find category IDs by names
      const categoryIds = await findCategoryIdsByName(category_names);
  
      // Update the test object with the extracted data
      const updatedTest = {
        test_name,
        test_description,
        categories: categoryIds,
        company_id: companyId
      };
  
      // Update the test data in the database
      // Implement the updateTest function here
      const updatedTestRecords = await saveTest(updatedTest);
      // Send a success response with the updated test data
      res.status(200).json({
        success: true,
        message: "Test updated successfully",
        test: updatedTest,
        updatedTestRecords:updatedTestRecords
      });
    } catch (error) {
      console.error("Error updating test:", error.message);
      res.status(500).json({ error: "Error updating test" });
    }
  });
  
  // Delete test
  const deleteTest = catchAsyncErrors(async (req, res, next) => {
    try {
      // Extract test ID from request parameters
      const testId = req.params.id;
  
      // Delete the test data from the database
      // Implement the deleteTest function here
  
      // Send a success response
      res.status(200).json({
        success: true,
        message: "Test deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting test:", error.message);
      res.status(500).json({ error: "Error deleting test" });
    }
  });
  
  module.exports = { createTest, editTest, deleteTest, getAllTests };