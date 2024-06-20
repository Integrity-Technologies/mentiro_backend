// routes/userRoutes.js

const express = require('express');
const { signup,login,getAllUsers,forgotPassword,resetPassword, logout, getUserDetails, editUser, deleteUser, addUser } = require('../controllers/userController');
const {isAuthenticatedUser} = require("../middleware/auth");
const {verifyTokenAndExtractUserId} = require("../middleware/verifyToken");

const router = express.Router();

router.post('/signup', signup); // tested in postman successfully
router.post('/login', login); // tested in postman successfully
router.get("/Allusers",verifyTokenAndExtractUserId, getAllUsers); // tested in postman successfully
router.post("/password/forgot", forgotPassword); // tested in postman successfully
router.put("/password/reset/:token", resetPassword); // tested in postman successfully
router.get("/logout", verifyTokenAndExtractUserId,logout); // tested in postman successfully

router.get("/me", verifyTokenAndExtractUserId,getUserDetails); // tested in postman successfully

router.put("/update/:id",verifyTokenAndExtractUserId,editUser); // tested in postman successfully
router.delete("/delete/:id",verifyTokenAndExtractUserId,deleteUser); // tested in postman successfully
router.post("/add",verifyTokenAndExtractUserId,addUser);

module.exports = router;

// User CRUD Completed!