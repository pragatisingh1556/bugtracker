// bugtracker backend server
// express server with mysql database
// handles authentication, bug management, and user management

var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");
var path = require("path");

// load env variables
dotenv.config();

var app = express();
var PORT = process.env.PORT || 5000;

// middleware
// cors allows frontend to talk to backend (different ports)
// json parser so we can read request body
app.use(cors());
app.use(express.json());

// serve uploaded files (screenshots etc)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// import routes
var authRoutes = require("./routes/auth");
var bugRoutes = require("./routes/bugs");
var userRoutes = require("./routes/users");

// register routes
app.use("/api/auth", authRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/users", userRoutes);

// basic route to check if server is running
app.get("/", function(req, res) {
    res.json({ message: "BugTracker API is running" });
});

// start the server
app.listen(PORT, function() {
    console.log("Server running on http://localhost:" + PORT);
});
