//categoryController.js
const { createCategoryTable, saveCategory } = require("../models/category.js");
const { client } = require("../db/index.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");

const getAllCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    await createCategoryTable();
    const category = await client.query('SELECT * FROM "category"');
    res.status(200).json(category.rows);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const createCategory = catchAsyncErrors(async (req, res) => {
  try {
    await createCategoryTable();
    // Extract user ID from req object (provided by verifyTokenAndExtractUserId middleware)
    const userId = req.user.id;

    const { category_name, isActive } = req.body;
    if (!category_name) {
      return res.status(400).json({ error: "Category name is required" });
    }

// Check if a category with the same name already exists
const existingCategory = await client.query('SELECT * FROM category WHERE category_name = $1', [category_name]);
if (existingCategory.rows.length > 0) {
    return res.status(400).json({ error: "Category with this name already exists" });
}

// Create the company object with the extracted data
const categoryData = {
  category_name,
  created_by: userId, // Assign the user ID as the createdBy value
  isActive
};

// Save the company data in the database
const newCategory = await saveCategory(categoryData);

 // Send a success response with the newly created category data
 res.status(201).json({
  success: true,
  message: "Category created successfully",
  category: newCategory,
  userId: userId 
});

  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getCategoryByName = catchAsyncErrors(async (req, res) => {
  try {
    const { category_name } = req.params;
    const query = `
      SELECT * FROM category
      WHERE category_name = $1`;
    const values = [category_name];
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const editCategoryById = catchAsyncErrors(async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Check if the new category name already exists in the database
    const existingCategory = await client.query(
      `SELECT * FROM category WHERE category_name = $1 AND id != $2`,
      [category_name, categoryId]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(400).json({ error: "Category name already exists" });
    }

    const updateCategory = await client.query(
      `UPDATE category SET category_name = $1 WHERE id = $2 RETURNING *`,
      [category_name, categoryId]
    );

    res.status(200).json(updateCategory.rows[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const deleteCategoryById = catchAsyncErrors(async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if the category with the given ID exists
    const checkQuery = `
      SELECT * FROM category
      WHERE id = $1`;
    const checkValues = [categoryId];
    const checkResult = await client.query(checkQuery, checkValues);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete the category
    const deleteQuery = `
      DELETE FROM category
      WHERE id = $1`;
    const deleteValues = [categoryId];
    await client.query(deleteQuery, deleteValues);

    // Send a success message
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  getAllCategory,
  createCategory,
  getCategoryByName,
  editCategoryById,
  deleteCategoryById,
};