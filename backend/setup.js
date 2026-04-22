// database setup script
// run this once to create all the tables
// command: node setup.js

var mysql = require("mysql2");
var dotenv = require("dotenv");

dotenv.config();

// first connect with the database name (cloud mysql requires db to exist already)
// for local dev, we create it if not exists below
var connectionConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// enable SSL for cloud mysql
if (process.env.DB_SSL === "true") {
    connectionConfig.ssl = { rejectUnauthorized: true };
}

var connection = mysql.createConnection(connectionConfig);

console.log("Setting up BugTracker database...");

// for cloud mysql, database already exists (we connected to it above)
// we just need to create the tables
(function() {
    {
        // create users table
        // role can be: admin, developer, tester
        var usersTable = "CREATE TABLE IF NOT EXISTS users (" +
            "id INT AUTO_INCREMENT PRIMARY KEY," +
            "name VARCHAR(100) NOT NULL," +
            "email VARCHAR(100) NOT NULL UNIQUE," +
            "password VARCHAR(255) NOT NULL," +
            "role ENUM('admin', 'developer', 'tester') NOT NULL DEFAULT 'tester'," +
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")";

        connection.query(usersTable, function(err) {
            if (err) {
                console.log("Error creating users table:", err.message);
                process.exit(1);
            }
            console.log("Users table created");

            // create bugs table
            // status flow: open -> in_progress -> resolved -> closed
            // severity: low, medium, high, critical
            // priority: low, medium, high
            var bugsTable = "CREATE TABLE IF NOT EXISTS bugs (" +
                "id INT AUTO_INCREMENT PRIMARY KEY," +
                "title VARCHAR(200) NOT NULL," +
                "description TEXT NOT NULL," +
                "status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open'," +
                "severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium'," +
                "priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium'," +
                "reported_by INT NOT NULL," +
                "assigned_to INT," +
                "screenshot VARCHAR(255)," +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "FOREIGN KEY (reported_by) REFERENCES users(id)," +
                "FOREIGN KEY (assigned_to) REFERENCES users(id)" +
                ")";

            connection.query(bugsTable, function(err) {
                if (err) {
                    console.log("Error creating bugs table:", err.message);
                    process.exit(1);
                }
                console.log("Bugs table created");

                // create comments table
                // users can add comments on bugs
                var commentsTable = "CREATE TABLE IF NOT EXISTS comments (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "bug_id INT NOT NULL," +
                    "user_id INT NOT NULL," +
                    "comment TEXT NOT NULL," +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                    "FOREIGN KEY (bug_id) REFERENCES bugs(id) ON DELETE CASCADE," +
                    "FOREIGN KEY (user_id) REFERENCES users(id)" +
                    ")";

                connection.query(commentsTable, function(err) {
                    if (err) {
                        console.log("Error creating comments table:", err.message);
                        process.exit(1);
                    }
                    console.log("Comments table created");

                    // insert a default admin user
                    // password is "admin123" (hashed with bcrypt)
                    var bcrypt = require("bcryptjs");
                    var hashedPassword = bcrypt.hashSync("admin123", 10);

                    var insertAdmin = "INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
                    connection.query(insertAdmin, ["Admin", "admin@bugtracker.com", hashedPassword, "admin"], function(err) {
                        if (err) {
                            console.log("Error inserting admin:", err.message);
                        } else {
                            console.log("Default admin user created (email: admin@bugtracker.com, password: admin123)");
                        }

                        console.log("\nDatabase setup complete!");
                        console.log("You can now start the server with: npm start");
                        connection.end();
                    });
                });
            });
        });
    }
})();
