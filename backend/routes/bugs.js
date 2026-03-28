// bug routes - create, read, update, delete bugs
// all routes are protected - need valid token to access

var express = require("express");
var router = express.Router();
var db = require("../db");
var middleware = require("../middleware");

// apply token verification to all bug routes
router.use(middleware.verifyToken);

// GET /api/bugs
// get all bugs with optional filters
// query params: status, severity, priority, assigned_to
router.get("/", function(req, res) {
    var query = "SELECT bugs.*, " +
        "reporter.name AS reporter_name, " +
        "assignee.name AS assignee_name " +
        "FROM bugs " +
        "LEFT JOIN users AS reporter ON bugs.reported_by = reporter.id " +
        "LEFT JOIN users AS assignee ON bugs.assigned_to = assignee.id";

    var conditions = [];
    var values = [];

    // add filters if provided in query params
    if (req.query.status) {
        conditions.push("bugs.status = ?");
        values.push(req.query.status);
    }
    if (req.query.severity) {
        conditions.push("bugs.severity = ?");
        values.push(req.query.severity);
    }
    if (req.query.priority) {
        conditions.push("bugs.priority = ?");
        values.push(req.query.priority);
    }
    if (req.query.assigned_to) {
        conditions.push("bugs.assigned_to = ?");
        values.push(req.query.assigned_to);
    }

    // if there are filters, add WHERE clause
    if (conditions.length > 0) {
        query = query + " WHERE " + conditions.join(" AND ");
    }

    // most recent bugs first
    query = query + " ORDER BY bugs.created_at DESC";

    db.query(query, values)
        .then(function(result) {
            var bugs = result[0];
            res.json(bugs);
        })
        .catch(function(err) {
            console.log("Error fetching bugs:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

// GET /api/bugs/stats
// get bug statistics for dashboard
router.get("/stats", function(req, res) {
    var statsQuery = "SELECT " +
        "COUNT(*) AS total, " +
        "SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_count, " +
        "SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count, " +
        "SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count, " +
        "SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_count, " +
        "SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) AS critical_count, " +
        "SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) AS high_count, " +
        "SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) AS medium_count, " +
        "SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) AS low_count " +
        "FROM bugs";

    db.query(statsQuery)
        .then(function(result) {
            var stats = result[0][0];
            res.json(stats);
        })
        .catch(function(err) {
            console.log("Error fetching stats:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

// GET /api/bugs/:id
// get a single bug by id with comments
router.get("/:id", function(req, res) {
    var bugId = req.params.id;

    // get bug details
    var bugQuery = "SELECT bugs.*, " +
        "reporter.name AS reporter_name, " +
        "assignee.name AS assignee_name " +
        "FROM bugs " +
        "LEFT JOIN users AS reporter ON bugs.reported_by = reporter.id " +
        "LEFT JOIN users AS assignee ON bugs.assigned_to = assignee.id " +
        "WHERE bugs.id = ?";

    // get comments for this bug
    var commentsQuery = "SELECT comments.*, users.name AS user_name " +
        "FROM comments " +
        "LEFT JOIN users ON comments.user_id = users.id " +
        "WHERE comments.bug_id = ? " +
        "ORDER BY comments.created_at ASC";

    db.query(bugQuery, [bugId])
        .then(function(result) {
            var bugs = result[0];

            if (bugs.length === 0) {
                res.status(404).json({ message: "Bug not found" });
                return;
            }

            var bug = bugs[0];

            // now get comments
            db.query(commentsQuery, [bugId])
                .then(function(commentResult) {
                    bug.comments = commentResult[0];
                    res.json(bug);
                })
                .catch(function(err) {
                    console.log("Error fetching comments:", err.message);
                    res.status(500).json({ message: "Server error" });
                });
        })
        .catch(function(err) {
            console.log("Error fetching bug:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

// POST /api/bugs
// create a new bug report
router.post("/", function(req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var severity = req.body.severity;
    var priority = req.body.priority;
    var assigned_to = req.body.assigned_to;

    // reported_by comes from the token (logged in user)
    var reported_by = req.user.id;

    if (!title || !description) {
        res.status(400).json({ message: "Title and description are required" });
        return;
    }

    // set defaults if not provided
    if (!severity) {
        severity = "medium";
    }
    if (!priority) {
        priority = "medium";
    }

    var query = "INSERT INTO bugs (title, description, severity, priority, reported_by, assigned_to) VALUES (?, ?, ?, ?, ?, ?)";
    var values = [title, description, severity, priority, reported_by, assigned_to || null];

    db.query(query, values)
        .then(function(result) {
            var insertId = result[0].insertId;
            res.status(201).json({
                message: "Bug reported successfully",
                bugId: insertId
            });
        })
        .catch(function(err) {
            console.log("Error creating bug:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

// PUT /api/bugs/:id
// update bug details (status, severity, priority, assigned_to)
router.put("/:id", function(req, res) {
    var bugId = req.params.id;
    var updates = [];
    var values = [];

    // only update fields that are provided
    if (req.body.title) {
        updates.push("title = ?");
        values.push(req.body.title);
    }
    if (req.body.description) {
        updates.push("description = ?");
        values.push(req.body.description);
    }
    if (req.body.status) {
        updates.push("status = ?");
        values.push(req.body.status);
    }
    if (req.body.severity) {
        updates.push("severity = ?");
        values.push(req.body.severity);
    }
    if (req.body.priority) {
        updates.push("priority = ?");
        values.push(req.body.priority);
    }
    if (req.body.assigned_to !== undefined) {
        updates.push("assigned_to = ?");
        values.push(req.body.assigned_to);
    }

    if (updates.length === 0) {
        res.status(400).json({ message: "No fields to update" });
        return;
    }

    var query = "UPDATE bugs SET " + updates.join(", ") + " WHERE id = ?";
    values.push(bugId);

    db.query(query, values)
        .then(function(result) {
            if (result[0].affectedRows === 0) {
                res.status(404).json({ message: "Bug not found" });
                return;
            }
            res.json({ message: "Bug updated successfully" });
        })
        .catch(function(err) {
            console.log("Error updating bug:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

// DELETE /api/bugs/:id
// delete a bug (admin only)
router.delete("/:id", middleware.isAdmin, function(req, res) {
    var bugId = req.params.id;

    var query = "DELETE FROM bugs WHERE id = ?";
    db.query(query, [bugId])
        .then(function(result) {
            if (result[0].affectedRows === 0) {
                res.status(404).json({ message: "Bug not found" });
                return;
            }
            res.json({ message: "Bug deleted successfully" });
        })
        .catch(function(err) {
            console.log("Error deleting bug:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

// POST /api/bugs/:id/comments
// add a comment to a bug
router.post("/:id/comments", function(req, res) {
    var bugId = req.params.id;
    var userId = req.user.id;
    var comment = req.body.comment;

    if (!comment) {
        res.status(400).json({ message: "Comment is required" });
        return;
    }

    var query = "INSERT INTO comments (bug_id, user_id, comment) VALUES (?, ?, ?)";
    db.query(query, [bugId, userId, comment])
        .then(function(result) {
            res.status(201).json({ message: "Comment added successfully" });
        })
        .catch(function(err) {
            console.log("Error adding comment:", err.message);
            res.status(500).json({ message: "Server error" });
        });
});

module.exports = router;
