const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // For form data
app.use(express.json()); // For JSON requests
app.use(express.static('public')); // Serve static files

// Setup session middleware
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// MySQL Connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'yourdatabase'
};

// ✅ Serve Home Page
app.get('/', (req, res) => {
    res.render('home');
});

// ✅ Serve Register Page
app.get('/register', (req, res) => {
    res.render('register');
});

// ✅ Serve Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Registration Route
app.post('/register', async (req, res) => {
    const { username, password, access_level } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    if (!['user', 'agent'].includes(access_level)) {
        return res.status(403).send('Invalid access level');
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.execute(
            'INSERT INTO users (username, password, access_level) VALUES (?, ?, ?)',
            [username, hashedPassword, access_level]
        );
        await connection.end();
        res.redirect('/login'); // Redirect to login after registration
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        await connection.end();

        if (users.length === 0) return res.status(401).send('Invalid credentials');
        const user = users[0];

        if (await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user.id, username: user.username, access_level: user.access_level };
            res.redirect('/'); // Redirect to home after login
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// ✅ Session Route (Check if user is logged in)
app.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user) return res.status(403).send('Not authorized');
    next();
}

// Admin-only route to create new admin users
app.post('/create-admin', requireAuth, async (req, res) => {
    if (req.session.user.access_level !== 'admin') {
        return res.status(403).send('Access denied');
    }

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password required');
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.execute(
            'INSERT INTO users (username, password, access_level) VALUES (?, ?, ?)',
            [username, hashedPassword, 'admin']
        );
        await connection.end();
        res.send('Admin account created');
    } catch (error) {
        res.status(500).send('Error creating admin');
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
