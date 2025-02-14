const mysql = require('mysql2/promise');
require('dotenv').config(); // Ensure dotenv is required

const dbConfig = process.env.JAWSDB_URL
    ? { uri: process.env.JAWSDB_URL } // Use Heroku's JAWSDB_URL
    : {
        host: 'localhost',
        user: 'root',
        password: 'UPPR1',
        database: 'real_estate'
    };

const pool = mysql.createPool(dbConfig);

module.exports = pool;
