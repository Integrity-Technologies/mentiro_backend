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

router.get("/Allcategory", getAllCategory); // tested in postman successfully
router.post("/create", verifyTokenAndExtractUserId, createCategory); // tested in postman successfully
router.get("/categoryByName/:category_name", getCategoryByName); // tested in postman successfully
router.put("/edit/:id", editCategoryById); // tested in postman successfully
router.delete("/delete/:id", deleteCategoryById); // tested in postman successfully

module.exports = router;