//Import the jsonwebtoken library to verify and decode JWT tokens
const jwt = require('jsonwebtoken');

//Defne the middleware function to protect routes
const verifyToken = (req, res, next) => {
    //Retrieve the 'Authorization' header from the incoming request
    const authHeader = req.headers.authorization;

    //Extract the token part from the 'Bearer <token>' string if the header exists
    const token = authHeader && authHeader.split(' ')[1];

    //If no token is found, respond with a 401 Unauthorized status
    if(!token){
        return res.status(401).json({message: 'Access denied. No token provided.'});
    }

    try{
        //Verify the token using the secret key defined in the environment variables
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        //Attach the verified user object to the request object for later use
        req.user = verified;

        //Call the next middleware function in the chain
        next();
    }
    catch(err){
        return res.status(403).json({message: 'Invalid or expired token.'});
    }
};

module.exports = verifyToken;