// routes/userRoutes.js

const express = require('express');
const { signup,login,getAllUsers,forgotPassword,resetPassword } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login',  login);
router.get("/Allusers",getAllUsers);
router.post("/password/forgot",forgotPassword);
router.put("/password/reset/:token",resetPassword);

module.exports = router;
