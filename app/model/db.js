const mysql = require("mysql");
const config = require('dotenv').config();

module.exports = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
console.log("database connected successfully");
