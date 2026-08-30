//Import the express library
const express = require('express');
//Create a new router instance
const router = express.Router();
//Import the register and login controller functions from the authController
const {register, login} = require('../controllers/authController');

//Define the POST route for user registration, which calls the register controller function
router.post('/register', register);

//Define the POST route for user login, which calls the login controller function
router.post('/login', login);

//Export the router instance
module.exports = router;