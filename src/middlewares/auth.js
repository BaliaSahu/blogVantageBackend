const express = require('express');
const jwt = require('jsonwebtoken');

const auth = async (req, res) => {
    try {
        // console.log("authentication");
        const cookies = req.cookies;
        // console.log(cookies.token);
        if (!cookies || !cookies.token) {
            // console.log("ebatk");
            return { success: false, message: "Please login" };
            // return res.status(401).send("Please login");
        }
        
        const { token } = cookies;
        // console.log(token,"----->");
        
        const decodedMessage = await jwt.verify(token, "Secret@123");
        req._id = decodedMessage._id;
        return { success: true };
    } catch (err) {
        // console.log("Authentication Error:", err.message);
        // return res.status(401).send("Bad Request! " + err.message);
        return { success: false, message: "Bad Request! " + err.message };
    }
};

module.exports = { auth };
