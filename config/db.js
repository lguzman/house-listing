const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'UPPR1',
    database: 'real_estate'
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
