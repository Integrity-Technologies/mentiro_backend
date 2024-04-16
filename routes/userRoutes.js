// routes/userRoutes.js

const express = require('express');
const { signup,login,getAllUsers } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login',  login);
router.get("/Allusers",getAllUsers);

module.exports = router;
