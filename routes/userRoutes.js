// routes/userRoutes.js

const express = require('express');
const { signup,login,getAllUsers,forgotPassword,resetPassword, logout, getUserDetails } = require('../controllers/userController');
const {isAuthenticatedUser} = require("../middleware/auth");

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get("/Allusers", getAllUsers);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.get("/logout", logout);
router.get("/me",isAuthenticatedUser, getUserDetails);

module.exports = router;
