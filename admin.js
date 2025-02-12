const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdminUser() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'yourpassword',
        database: 'yourdatabase'
    });

    const username = 'admin';
    const password = 'admin'; // This will be hashed
    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
        'INSERT INTO users (username, password, access_level) VALUES (?, ?, ?)',
        [username, hashedPassword, 'admin']
    );

    console.log('Admin user created.');
    await connection.end();
}

createAdminUser().catch(console.error);
