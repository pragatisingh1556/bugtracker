// database connection file
// connects to mysql using mysql2 library
// we use connection pool so multiple queries can run at same time

var mysql = require("mysql2");
var dotenv = require("dotenv");

// load environment variables from .env file
dotenv.config();

// create connection pool to mysql
// pool is better than single connection because it can handle multiple requests
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// use promise version so we can use async/await
var db = pool.promise();

module.exports = db;
