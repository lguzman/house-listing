require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = process.env.JAWSDB_URL
    ? {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
      }
    : {
        host: 'localhost',
        user: 'root',
        password: 'UPPR1',
        database: 'real_estate'
      };

const pool = mysql.createPool(dbConfig);

module.exports = pool;
