// routes/userRoutes.js

const express = require('express');
const { signup,login,getAllUsers,forgotPassword,resetPassword, logout, getUserDetails, editUser, deleteUser } = require('../controllers/userController');
const {isAuthenticatedUser} = require("../middleware/auth");

const router = express.Router();

router.post('/signup', signup); // tested in postman successfully
router.post('/login', login); // tested in postman successfully
router.get("/Allusers", getAllUsers); // tested in postman successfully
router.post("/password/forgot", forgotPassword); // tested in postman successfully
router.put("/password/reset/:token", resetPassword); // tested in postman successfully
router.get("/logout", logout); // tested in postman successfully
router.get("/me",isAuthenticatedUser, getUserDetails); // tested in postman successfully
router.put("/update/:id",isAuthenticatedUser,editUser); // tested in postman successfully
router.delete("/delete/:id",isAuthenticatedUser,deleteUser); // tested in postman successfully

module.exports = router;

// User CRUD Completed!