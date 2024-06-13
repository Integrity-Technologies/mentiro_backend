// test controller 
const { createTestsTable, saveTest } = require("../models/test");
const { client } = require("../db/index.js");
const analytics = require('../segment/segmentConfig');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { sendErrorResponse } = require("../utils/res_error");

// find company id by name (Helper function)
const findCompanyIdByName = async (companyName) => {
  const result = await client.query('SELECT id FROM "companies" WHERE name = $1', [companyName]);
  return result.rows.length > 0 ? result.rows[0].id : null;
};


// find category id's by name (Helper function)
const findCategoryIdsByName = async (categoryNames) => {
  const categoryIds = [];
  for (const categoryName of categoryNames) {
    const result = await client.query('SELECT id FROM "categories" WHERE category_name = $1', [categoryName]);
    if (result.rows.length > 0) {
      categoryIds.push(result.rows[0].id);
    } else {
      return null;
    }
  }
  return categoryIds;
};

// Validate Test Input
const validateTestInput = (testName, testDescription, categoryNames, companyName) => {
  if (!testName || typeof testName !== 'string' || testName.trim() === '') {
    return "Invalid or missing 'test name'";
  }
  if (!testDescription || typeof testDescription !== 'string' || testDescription.trim() === '') {
    return "Invalid or missing 'test description'";
  }
  if (!Array.isArray(categoryNames) || categoryNames.length === 0 || categoryNames.some(name => typeof name !== 'string' || name.trim() === '')) {
    return "Invalid or missing 'category names'";
  }
  if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
    return "Invalid or missing 'company name'";
  }

  // Optional: Check for maximum length constraints
  const MAX_NAME_LENGTH = 255;
  const MAX_DESCRIPTION_LENGTH = 500;

  // Check length of test name
  if (testName.length > MAX_NAME_LENGTH) {
    return `'test name' exceeds maximum length of ${MAX_NAME_LENGTH} characters`;
  }
  // Check length of test description
  if (testDescription.length > MAX_DESCRIPTION_LENGTH) {
    return `'Test description' exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters`;
  }
  if (companyName.length > MAX_NAME_LENGTH) {
    return `'company name' exceeds maximum length of ${MAX_NAME_LENGTH} characters`;
  }
  for (const categoryName of categoryNames) {
    if (categoryName.length > MAX_NAME_LENGTH) {
      return `'category name' exceeds maximum length of ${MAX_NAME_LENGTH} characters`;
    }
  }
};

// get all Tests
const getAllTests = catchAsyncErrors(async (req, res) => {
  await createTestsTable();
  const testsResult = await client.query('SELECT * FROM "tests"');
  const tests = testsResult.rows;

  if (tests.length === 0) {
    return sendErrorResponse(res, 404, "No tests found");
  }

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

  const companyIds = tests.map(test => test.company_id);
  const companyResult = await client.query('SELECT id, name FROM "companies" WHERE id = ANY($1)', [companyIds]);
  const companiesMap = new Map(companyResult.rows.map(company => [company.id, company.name]));

  const categoriesMap = new Map();
  for (const test of tests) {
    const categoryIds = test.categories.filter(Boolean);
    if (categoryIds.length > 0) {
      const categoryResult = await client.query('SELECT id, category_name FROM "categories" WHERE id = ANY($1)', [categoryIds]);
      categoryResult.rows.forEach(category => {
        categoriesMap.set(category.id, category.category_name);
      });
    }
  }

  const testsWithNames = tests.map(test => ({
    ...test,
    company: companiesMap.get(test.company_id),
    categories: test.categories.filter(Boolean).map(categoryId => categoriesMap.get(categoryId))
  }));

  analytics.track({
    userId: String(req.user.id),
    event: 'Viewed All Tests',
    properties: {
      viewedAt: new Date().toISOString(),
    }
  });

  res.status(200).json(testsWithNames);
});

// create Test
const createTest = catchAsyncErrors(async (req, res) => {
  await createTestsTable();
  const userId = req.user.id;
  const { test_name, test_description, category_names, company_name } = req.body;
  
  // Validate test input
  const validationError =  await validateTestInput(test_name, test_description, category_names, company_name);
  if (validationError) {
    return sendErrorResponse(res, 400, validationError);
  }

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

  const existingTest = await client.query('SELECT * FROM tests WHERE test_name = $1', [test_name]);
  if (existingTest.rows.length > 0) {
    return sendErrorResponse(res, 400, "Test with this name already exists");
  }

  const companyId = await findCompanyIdByName(company_name);
  if (!companyId) {
    return sendErrorResponse(res, 400, `Company '${company_name}' not found`);
  }

  const categoryIds = await findCategoryIdsByName(category_names);
  if (!categoryIds) {
    return sendErrorResponse(res, 400, `One or more categories not found`);
  }

  const testData = {
    test_name,
    test_description,
    categories: categoryIds,
    company_id: companyId,
    created_by: userId,
  };

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

  res.status(201).json({
    success: true,
    message: "Test created successfully",
    test: newTest,
    userId: userId
  });
});

// get test by id
const getTestById = catchAsyncErrors(async (req, res) => {
  const testId = req.params.id;
  const test = await client.query('SELECT * FROM tests WHERE id = $1', [testId]);

  if (test.rows.length === 0) {
    return sendErrorResponse(res, 404, "Test not found");
  }

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

  analytics.track({
    userId: String(req.user.id),
    event: 'Viewed Test',
    properties: {
      testId: testId,
      viewedAt: new Date().toISOString(),
    }
  });

  res.status(200).json(test.rows[0]);
});

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

// // Delete test by ID
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

// edit Test
const editTest = catchAsyncErrors(async (req, res, next) => {
  try {
    // Extract test ID from request parameters
    const testId = req.params.id;

    //     // Extract updated test data from the request body
    const { test_name, test_description, category_names, company_name } = req.body;

    // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
}

    validateTestInput(res, test_name, test_description, category_names, company_name);

    //     // Find company ID by name
    const companyId = await findCompanyIdByName(company_name);

    if (!companyId) {
      // return res.status(400).json({ error: `Company '${company_name}' not found` });
      return sendErrorResponse(res, 400, `Company '${company_name}' not found`);
    }

    //     // Find category IDs by names
    const categoryIds = await findCategoryIdsByName(category_names);

    if (!categoryIds) {
      // return res.status(400).json({ error: `One or more categories not found` });
      return sendErrorResponse(res, 400, `One or more categories not found`);
    }

    //     // Fetch the existing test data from the database
    const existingTest = await client.query('SELECT * FROM tests WHERE id = $1', [testId]);

    if (existingTest.rows.length === 0) {
      // return res.status(404).json({ error: "Test not found" });
      return sendErrorResponse(res, 404, `Test not found`);
    }

    //     // Compare the updated fields with existing data
    // if (
    //   test_name === existingTest.rows[0].test_name &&
    //   test_description === existingTest.rows[0].test_description &&
    //   JSON.stringify(categoryIds.sort()) === JSON.stringify(existingTest.rows[0].categories.sort()) &&
    //   companyId === existingTest.rows[0].company_id
    // ) {
    //   // return res.status(400).json({ error: "No changes to update" });
    //   return sendErrorResponse(res, 400, `No changes to update`);
    // }

    //     // Update the test object with the extracted data
    const updatedTest = {
      test_name,
      test_description,
      categories: categoryIds,
      company_id: companyId
    };

    await updateTestById(testId, updatedTest);

    //     // Identify the updated test in Segment
    analytics.identify({
      userId: String(req.user?.id),
      traits: {
        testId: String(testId),
        test_name: updatedTest.test_name,
        test_description: updatedTest.test_description,
        company_id: updatedTest.company_id,
        category_ids: updatedTest.categories
      }
    });

    //     // Track the event of editing a test
    analytics.track({
      userId: String(req.user?.id),
      event: 'Test Edited',
      properties: {
        testId: testId,
        updatedTest: updatedTest,
        updatedAt: new Date().toISOString(),
      }
    });

    //     // Send a success response with the updated test data
    res.status(200).json({
      success: true,
      message: "Test updated successfully",
      test: updatedTest
    });
  } catch (error) {
    console.error("Error updating test:", error.message);
    res.status(500).json({ error: "Error updating test" , error: error.message });
  }
});

const deleteTest = catchAsyncErrors(async (req, res) => {
  const testId = req.params.id;
  const existingTest = await client.query('SELECT * FROM tests WHERE id = $1', [testId]);

  if (existingTest.rows.length === 0) {
    return sendErrorResponse(res, 404, "Test not found");
  }

  // Check if req.user and req.user.id are defined
 if (!req.user || !req.user.id) {
  console.error("User data is missing or incomplete in the request");
  return res.status(400).json({ error: "User data is missing or incomplete in the request" });
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

  res.status(200).json({
    success: true,
    message: "Test deleted successfully"
  });
});

module.exports = { createTest, editTest, deleteTest, getAllTests, getTestById };
