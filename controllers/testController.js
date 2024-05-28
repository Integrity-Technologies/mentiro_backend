// controllers/testController.js
const { createTestsTable, saveTest } = require("../models/test");
const { client } = require("../db/index.js");
const analytics = require('../segment/segmentConfig');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Get all tests
const getAllTests = catchAsyncErrors(async (req, res, next) => {
  try {
    await createTestsTable();

    // Fetch all tests
    const testsResult = await client.query('SELECT * FROM "tests"');
    const tests = testsResult.rows;

    // If no tests found, return an empty array
    if (tests.length === 0) {
      return res.status(400).json({ error: "Test not found" });;
    }

    // Fetch company names for each test
    const companyIds = tests.map(test => test.company_id);
    const companyResult = await client.query('SELECT id, name FROM "companies" WHERE id = ANY($1)', [companyIds]);
    const companiesMap = new Map(companyResult.rows.map(company => [company.id, company.name]));

    // Fetch category names for each test
    const categoriesMap = new Map(); // Initialize an empty map for category names
    for (const test of tests) {
      const categoryIds = test.categories.filter(Boolean); // Filter out null or undefined values
      if (categoryIds.length > 0) {
        const categoryResult = await client.query('SELECT id, category_name FROM "categories" WHERE id = ANY($1)', [categoryIds]);
        categoryResult.rows.forEach(category => {
          categoriesMap.set(category.id, category.category_name);
        });
      }
    }

    // Replace company_id with company name and categories with their respective names
    const testsWithNames = tests.map(test => ({
      ...test,
      company: companiesMap.get(test.company_id),
      categories: test.categories.filter(Boolean).map(categoryId => categoriesMap.get(categoryId))
    }));

    analytics.track({
      userId: String(req.user.id),
      event: 'Viewed All Test',
      properties: {
        viewedAt: new Date().toISOString(),
        // testCount: testsWithNames.rows.length,
      }
    });

    res.status(200).json(testsWithNames); // Return all test data with names in the response
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
        // throw new Error(`Company '${companyName}' not found`);
        return null;
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
        const result = await client.query('SELECT id FROM "categories" WHERE category_name = $1', [categoryName]);
        if (result.rows.length > 0) {
          categoryIds.push(result.rows[0].id);
        } else {
          // Handle the case if a category with the provided name does not exist
          // throw new Error(`Category '${categoryName}' not found`);
          return null;
        }
      }
  
      return categoryIds;
    } catch (error) {
      throw error;
    }
  };
  
// Update test by ID
const updateTestById = async (testId, updatedTest) => {
  try {
    // Update the test data in the database
    const query = `
      UPDATE tests 
      SET test_name = $1, test_description = $2, categories = $3, company_id = $4
      WHERE id = $5`;
    const values = [updatedTest.test_name, updatedTest.test_description, updatedTest.categories, updatedTest.company_id, testId];
    await client.query(query, values);
  } catch (error) {
    throw error;
  }
};

// Delete test by ID
const deleteTestById = async (testId) => {
  try {
    // Delete the test data from the database
    const query = 'DELETE FROM tests WHERE id = $1';
    const values = [testId];
    await client.query(query, values);
  } catch (error) {
    throw error;
  }
};

  // Validate input data
const validateTestInput = (test_name, test_description, category_names, company_name) => {
  if (!test_name || typeof test_name !== 'string') {
    throw new Error("Invalid or missing 'test_name'");
  }
  if (!test_description || typeof test_description !== 'string') {
    throw new Error("Invalid or missing 'test_description'");
  }
  if (!Array.isArray(category_names) || category_names.length === 0) {
    throw new Error("Invalid or missing 'category_names'");
  }
  if (!company_name || typeof company_name !== 'string') {
    throw new Error("Invalid or missing 'company_name'");
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
  
      validateTestInput(test_name, test_description, category_names, company_name);
  
       // Check if a test with the same name already exists
       const existingTest = await client.query('SELECT * FROM tests WHERE test_name = $1', [test_name]);
       if (existingTest.rows.length > 0) {
           return res.status(400).json({ error: "Test with this name already exists" });
       }

      // Find company ID by name
      const companyId = await findCompanyIdByName(company_name);
      if (!companyId) {
        return res.status(400).json({ error: `Company '${company_name}' not found` });
      }

      // Find category IDs by names
      const categoryIds = await findCategoryIdsByName(category_names);
      if (!categoryIds) {
        return res.status(400).json({ error: `One or more categories not found` });
      }
  
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

      analytics.identify({
        userId: String(userId),
        traits: {
          test_name: newTest.test_name,
          createdBy: newTest.created_by,
          company_id: newTest.company_id,
          category_ids: newTest.categories
        }
      });
      

      analytics.track({
        userId: userId.toString(),
        event: 'Test Created',
        properties: {
          test_name: newTest.test_name,
          test_description: newTest.test_description,
          category_names: category_names,
          company_name: company_name,
          createdBy: userId,
          isActive: newTest.is_active,
          createdAt: new Date().toISOString(),
        }
      });
  

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
  
// Get test by ID
const getTestById = catchAsyncErrors(async (req, res, next) => {
  try {
    // Extract test ID from request parameters
    const testId = req.params.id;

    // Fetch the test data from the database
    const test = await client.query('SELECT * FROM tests WHERE id = $1', [testId]);

    if (test.rows.length === 0) {
      return res.status(404).json({ error: "Test not found" });
    }

    analytics.track({
      userId: String(req.user.id),
      event: 'Viewed Test',
      properties: {
        testId: testId,
        viewedAt: new Date().toISOString(),
      }
    });

    // Send the test data in the response
    res.status(200).json(test.rows[0]);
  } catch (error) {
    console.error("Error fetching test:", error.message);
    res.status(500).json({ error: "Error fetching test" });
  }
});

 // Edit test
const editTest = catchAsyncErrors(async (req, res, next) => {
  try {
    // Extract test ID from request parameters
    const testId = req.params.id;

    // Extract updated test data from the request body
    const { test_name, test_description, category_names, company_name } = req.body;

    validateTestInput(test_name, test_description, category_names, company_name);

    // Find company ID by name
    const companyId = await findCompanyIdByName(company_name);

    if (!companyId) {
      return res.status(400).json({ error: `Company '${company_name}' not found` });
    }

    // Find category IDs by names
    const categoryIds = await findCategoryIdsByName(category_names);

    if (!categoryIds) {
      return res.status(400).json({ error: `One or more categories not found` });
    }

    // Fetch the existing test data from the database
    const existingTest = await client.query('SELECT * FROM tests WHERE id = $1', [testId]);

    if (existingTest.rows.length === 0) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Compare the updated fields with existing data
    if (
      test_name === existingTest.rows[0].test_name &&
      test_description === existingTest.rows[0].test_description &&
      JSON.stringify(categoryIds.sort()) === JSON.stringify(existingTest.rows[0].categories.sort()) &&
      companyId === existingTest.rows[0].company_id
    ) {
      return res.status(400).json({ error: "No changes to update" });
    }

    // Update the test object with the extracted data
    const updatedTest = {
      test_name,
      test_description,
      categories: categoryIds,
      company_id: companyId
    };

    await updateTestById(testId, updatedTest);

    // Identify the updated test in Segment
    analytics.identify({
      userId: String(req.user.id),
      traits: {
        testId: String(testId),
        test_name: updatedTest.test_name,
        test_description: updatedTest.test_description,
        company_id: updatedTest.company_id,
        category_ids: updatedTest.categories
      }
    });

    // Track the event of editing a test
    analytics.track({
      userId: String(req.user.id),
      event: 'Test Edited',
      properties: {
        testId: testId,
        updatedTest: updatedTest,
        updatedAt: new Date().toISOString(),
      }
    });

    // Send a success response with the updated test data
    res.status(200).json({
      success: true,
      message: "Test updated successfully",
      test: updatedTest
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

    // Check if the test exists
    const existingTest = await client.query('SELECT * FROM tests WHERE id = $1', [testId]);
    if (existingTest.rows.length === 0) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Delete the test data from the database
    await deleteTestById(testId);

    analytics.track({
      userId: String(req.user.id),
      event: 'Test Deleted',
      properties: {
        testId: testId,
        deletedAt: new Date().toISOString(),
      }
    });

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

  
  module.exports = { createTest, editTest, deleteTest, getAllTests, getTestById };