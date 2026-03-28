// authentication routes - login and signup
// uses bcrypt for password hashing and jwt for tokens

var express = require("express");
var router = express.Router();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var db = require("../db");

// POST /api/auth/signup
// creates a new user account
router.post("/signup", function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var role = req.body.role;

    // check if all fields are provided
    if (!name || !email || !password || !role) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }

    // check if role is valid
    var validRoles = ["admin", "developer", "tester"];
    var isValidRole = false;
    for (var i = 0; i < validRoles.length; i++) {
        if (validRoles[i] === role) {
            isValidRole = true;
            break;
        }
    }
    if (!isValidRole) {
        res.status(400).json({ message: "Role must be admin, developer, or tester" });
        return;
    }

    // hash the password before saving
    // 10 is the salt rounds - higher is more secure but slower
    var hashedPassword = bcrypt.hashSync(password, 10);

    // insert user into database
    var query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(query, [name, email, hashedPassword, role])
        .then(function(result) {
            res.status(201).json({ message: "Account created successfully" });
        })
        .catch(function(err) {
            // duplicate email check
            if (err.code === "ER_DUP_ENTRY") {
                res.status(400).json({ message: "Email already exists" });
            } else {
                console.log("Signup error:", err.message);
                res.status(500).json({ message: "Server error" });
            }
        });
});

// POST /api/auth/login
// checks email and password, returns jwt token
router.post("/login", function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    // find user by email
    var query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email])
        .then(function(result) {
            var rows = result[0];

            if (rows.length === 0) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            var user = rows[0];

            // compare password with hashed password
            var isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            // create jwt token
            // token contains user id, name, email, role
            // expires in 7 days
            var tokenData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };
            var token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "7d" });

            res.json({
                message: "Login successful",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        })
        .catch(function(err) {
            console.log("Login error:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

module.exports = router;
