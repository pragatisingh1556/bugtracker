// database connection file
// connects to mysql using mysql2 library
// we use connection pool so multiple queries can run at same time
// supports both local mysql and cloud mysql (aiven, planetscale, etc.)

var mysql = require("mysql2");
var dotenv = require("dotenv");

// load environment variables from .env file
dotenv.config();

// build pool config from env vars
var poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
};

// enable SSL for cloud mysql databases (set DB_SSL=true in .env on production)
// cloud providers like aiven, planetscale require ssl
if (process.env.DB_SSL === "true") {
    poolConfig.ssl = { rejectUnauthorized: true };
}

// create connection pool to mysql
// pool is better than single connection because it can handle multiple requests
var pool = mysql.createPool(poolConfig);

// use promise version so we can use async/await
var db = pool.promise();

module.exports = db;
