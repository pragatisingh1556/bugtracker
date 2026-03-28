// user routes - get users list
// used for assigning bugs to developers

var express = require("express");
var router = express.Router();
var db = require("../db");
var middleware = require("../middleware");

// all routes need authentication
router.use(middleware.verifyToken);

// GET /api/users
// get all users (for assigning bugs)
router.get("/", function(req, res) {
    var query = "SELECT id, name, email, role, created_at FROM users ORDER BY name ASC";

    db.query(query)
        .then(function(result) {
            var users = result[0];
            res.json(users);
        })
        .catch(function(err) {
            console.log("Error fetching users:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

// GET /api/users/developers
// get only developers (for bug assignment dropdown)
router.get("/developers", function(req, res) {
    var query = "SELECT id, name, email FROM users WHERE role = 'developer' ORDER BY name ASC";

    db.query(query)
        .then(function(result) {
            var developers = result[0];
            res.json(developers);
        })
        .catch(function(err) {
            console.log("Error fetching developers:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

// DELETE /api/users/:id
// delete a user (admin only)
router.delete("/:id", middleware.isAdmin, function(req, res) {
    var userId = req.params.id;

    // dont let admin delete themselves
    if (parseInt(userId) === req.user.id) {
        res.status(400).json({ message: "You cannot delete your own account" });
        return;
    }

    var query = "DELETE FROM users WHERE id = ?";
    db.query(query, [userId])
        .then(function(result) {
            if (result[0].affectedRows === 0) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.json({ message: "User deleted successfully" });
        })
        .catch(function(err) {
            console.log("Error deleting user:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

module.exports = router;
