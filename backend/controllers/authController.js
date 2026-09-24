//Import the User Mongoose model to interact with the database
const User = require('../models/User');
//Import bcryptjs library to hash and compare passwords
const bcrypt = require('bcryptjs');

//Import jsonwebtoken library to generate and verify JWT tokens
const jwt = require('jsonwebtoken');

//Controller function to handle user registration
exports.register = async (req, res) => {
    try{
        //Extract name, email, and password from the request body
        const {name, email, password, academicField} = req.body;

        //Check if a user with the provided email already exists in the database
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'User already exists with this email.'});
        }

        //Generate a salt and hash the password for secure storage
        const salt = await bcrypt.genSalt(10);
        //Hash the password using the generated salt
        const hashedPassword = await bcrypt.hash(password, salt);

        //Create a new user instance with the provided name, email, and hashed password
        const newUser = new User({
            name, 
            email, 
            password: hashedPassword,
            academicField
        });

        //Save the new user to the database
        await newUser.save();

        //Generate a JWT token for the newly registered user with their ID and a secret key, set to expire in 1 hour
        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: '1d'});

        //Send a success response with the newly created user object (excluding the password) with status 201 (Created)
        res.status(201).json({success: true, message: 'User registered successfully.', data: {user: {id: newUser._id, name: newUser.name, email: newUser.email}, token}});
    }
    catch(err){
        //Catch any server errors and return a 500 status code
        res.status(500).json({message: 'Server error during registration.', error: err.message});
    }
};

//Controller function to handle user login
exports.login = async(req, res) => {
    try{
        //Extract email and password from the request body
        const {email, password} = req.body;

        //Find the user in the database by email
        const user = await User.findOne({email});
        if(!user){
            //If the user is not found, return a 400 status code with an error message
            return res.status(400).json({message: 'Invalid email or password.'});
        }

        //Compare the submitted plain-text password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch){
            //If the passwords do not match, return a 400 status code with an error message
            return res.status(400).json({message: 'Invalid email or password.'});
        }

        //Generate a JWT token with the user's ID and a secret key, set to expire in 1 hour
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        //Send back the generated token and a success message with status 200 (OK)
        res.status(200).json({success: true,
            message: 'Login successful',
            data: {
                user: { id: user._id, name: user.name, email: user.email },
                token
            }});
    }
    catch(err){
        //Catch any server errors and return a 500 status code
        res.status(500).json({success: false, message: 'Server error during login.', error: err.message});
    }
};

exports.logout = async (req, res) => {
    //If using JWT stored on client side (localStorage/sessionStorage), logout is handled on the client side by removing the token.
    res.status(200).json({success: true, message: 'Logout successful.'});
};

//Retrieve current user
exports.getMe = async (req, res) => {
    try{
        //req.user.id comes from your verifyToken middleware
        const user = await User.findById(req.user.id).select('-passwordHash');

        if(!user){
            return res.status(404).json({success: false, message: 'User not found.'});
        }

        res.status(200).json({success: true, message: 'Current user fetched successfully', data: {user}});
    }
    catch(err){
        res.status(500).json({success: false, message: 'Server error while fetching current user.', error: err.message});
    }
};