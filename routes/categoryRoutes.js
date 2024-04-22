// routes/categoryRoutes.js

const express = require("express");
const {
  getAllCategory,
  createCategory,
  getCategoryByName,
  editCategoryById,
  deleteCategoryById,
} = require("../controllers/categoryController.js");
const {verifyTokenAndExtractUserId} = require("../middleware/verifyToken");
const router = express.Router();

router.get("/Allcategory", getAllCategory);
router.post("/create", verifyTokenAndExtractUserId, createCategory);
router.get("/categoryByName/:category_name", getCategoryByName);
router.put("/edit/:id", editCategoryById);
router.delete("/delete/:id", deleteCategoryById);

module.exports = router;