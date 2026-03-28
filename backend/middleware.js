// middleware to verify jwt token
// this runs before protected routes
// checks if the user has a valid token in the header

var jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    // get token from authorization header
    var authHeader = req.headers["authorization"];

    if (!authHeader) {
        res.status(401).json({ message: "No token provided. Please login first." });
        return;
    }

    // token comes as "Bearer <token>" so we split and take second part
    var parts = authHeader.split(" ");
    var token = parts[1];

    if (!token) {
        res.status(401).json({ message: "Invalid token format" });
        return;
    }

    // verify the token using our secret key
    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        // attach user info to request so routes can use it
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token expired or invalid. Please login again." });
    }
}

// middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        res.status(403).json({ message: "Access denied. Admin only." });
        return;
    }
    next();
}

module.exports = {
    verifyToken: verifyToken,
    isAdmin: isAdmin
};
