// category controller 
const { createCategoryTable, saveCategory } = require("../models/category.js");
const { client } = require("../db/index.js");
const analytics = require('../segment/segmentConfig');
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const { sendErrorResponse } = require("../utils/res_error");

// Helper function to validate category input
const validateCategoryInput = (category_name, isActive) => {
  if (!category_name || typeof category_name !== 'string' || category_name.trim() === '') {
    return "Invalid or missing 'category_name'";
  }
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return "'isActive' should be a boolean";
  }

  // Optional: Check for maximum length constraints
  const MAX_CATEGORY_NAME_LENGTH = 255;
  if (category_name.length > MAX_CATEGORY_NAME_LENGTH) {
    return `'category_name' exceeds maximum length of ${MAX_CATEGORY_NAME_LENGTH} characters`;
  }

  return null;
};

// Get all categories
const getAllCategory = catchAsyncErrors(async (req, res) => {
  await createCategoryTable();
  const category = await client.query('SELECT * FROM categories');

  analytics.track({
    userId: String(req.user?.id || 'anonymous'),
    event: 'Admin Viewed All Categories',
    properties: {
      viewedAt: new Date().toISOString(),
      categoryCount: category.rows.length,
    }
  });

  res.status(200).json(category.rows);
});

// Create category
const createCategory = catchAsyncErrors(async (req, res) => {
  await createCategoryTable();
  const userId = req.user.id;
  const { category_name, isActive } = req.body;

  // Validate category input
  const validationError = validateCategoryInput(category_name, isActive);
  if (validationError) {
    return sendErrorResponse(res, 400, validationError);
  }

  // Check if a category with the same name already exists
  const existingCategory = await client.query('SELECT * FROM categories WHERE category_name = $1', [category_name]);
  if (existingCategory.rows.length > 0) {
    return sendErrorResponse(res, 400, "Category with this name already exists");
  }

  const categoryData = {
    category_name,
    created_by: userId,
    isActive
  };

  const newCategory = await saveCategory(categoryData);

  analytics.identify({
    userId: (userId || 'anonymous'),
    traits: {
      name: newCategory.category_name,
      createdBy: newCategory.created_by,
      isActive: newCategory.is_active,
    }
  });

  analytics.track({
    userId: (userId || 'anonymous'),
    event: 'Category Created',
    properties: {
      categoryName: newCategory.category_name,
      createdBy: newCategory.created_by,
      isActive: newCategory.is_active,
      createdAt: new Date().toISOString(),
    }
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category: newCategory,
    userId: userId
  });
});

// Get category by name
const getCategoryByName = catchAsyncErrors(async (req, res) => {
  const { category_name } = req.params;
  const query = 'SELECT * FROM categories WHERE category_name = $1';
  const values = [category_name];
  const result = await client.query(query, values);
  
  if (result.rows.length === 0) {
    return sendErrorResponse(res, 404, "Category not found");
  }

  analytics.track({
    userId: String(req.user?.id || 'anonymous'),
    event: 'Admin Viewed Category Details',
    properties: {
      viewedAt: new Date().toISOString(),
      categoryName: category_name,
    }
  });

  res.status(200).json(result.rows[0]);
});

// Edit category by ID
const editCategoryById = catchAsyncErrors(async (req, res) => {
  const categoryId = req.params.id;
  const { category_name, isActive } = req.body;

  // Validate category input
  const validationError = validateCategoryInput(category_name, isActive);
  if (validationError) {
    return sendErrorResponse(res, 400, validationError);
  }

  const category = await client.query('SELECT * FROM categories WHERE id = $1', [categoryId]);

  if (category.rows.length === 0) {
    return sendErrorResponse(res, 404, "Category not found");
  }

  // Check if the new category name already exists in the database
  const existingCategory = await client.query('SELECT * FROM categories WHERE category_name = $1 AND id != $2', [category_name, categoryId]);
  if (existingCategory.rows.length > 0) {
    return sendErrorResponse(res, 400, "Category name already exists");
  }

  const updateCategory = await client.query(
    'UPDATE categories SET category_name = $1, is_active = $2 WHERE id = $3 RETURNING *',
    [category_name, isActive, categoryId]
  );

  analytics.identify({
    userId: String(req.user?.id || 'anonymous'),
    traits: {
      name: updateCategory.rows[0].category_name,
    }
  });

  analytics.track({
    userId: String(req.user?.id || 'anonymous'),
    event: 'Category Edited',
    properties: {
      categoryName: updateCategory.rows[0].category_name,
      editedAt: new Date().toISOString(),
    }
  });

  res.status(200).json(updateCategory.rows[0]);
});

// Delete category by ID
const deleteCategoryById = catchAsyncErrors(async (req, res) => {
  const categoryId = req.params.id;

  // Check if the category with the given ID exists
  const checkResult = await client.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
  if (checkResult.rows.length === 0) {
    return sendErrorResponse(res, 404, "Category not found");
  }

  await client.query('BEGIN');

  try {
    await client.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    await client.query('COMMIT');

    analytics.track({
      userId: String(req.user?.id || 'anonymous'),
      event: 'Category Deleted',
      properties: {
        deletedAt: new Date().toISOString(),
      }
    });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error deleting category:", error.message);
    res.status(500).json({ error: "Error deleting category" });
  }
});

module.exports = {
  getAllCategory,
  createCategory,
  getCategoryByName,
  editCategoryById,
  deleteCategoryById,
};
