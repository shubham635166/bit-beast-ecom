const User = require('../model/userModel')
const jwt = require('jsonwebtoken')
const key = require('./secreteKey')

exports.protect = async (req, res, next) => {
  const token = req.headers.cookie;

    if (!token) {
        return res.json({ status: "failed", message: "Please Login to access this resource" });
    }
    
    // Extracting the token part from the cookie
    const tokenParts = token.split(';').find(part => part.trim().startsWith('token='));
    if (!tokenParts) {
        return res.status(401).json({ status: "failed", message: "Invalid token format" });
    }
    const tokenValue = tokenParts.trim().substring(6);

    try {

        const decodedData = jwt.verify(tokenValue, key.key);
        const user = await User.findById(decodedData.id);

        if (!user) {
            return res.json({ status: "failed", message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ status: "failed", message: "Invalid token" });
    }
}