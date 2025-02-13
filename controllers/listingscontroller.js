const mysql = require('../config/db.js');

// Get all listings
exports.getListings = async (req, res) => {
    try {
        const [listings] = await mysql.execute(`
            SELECT listings.*, users.username, users.access_level 
            FROM listings 
            JOIN users ON listings.user_id = users.id
        `);
        res.render('listings/index', { listings, user: req.session.user });
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Show form to create a new listing
exports.showNewForm = (req, res) => {
    if (!req.session.user) return res.status(403).send('Not authorized');
    res.render('listings/new', { user: req.session.user });
};

// Create a new listing (Only Agents & Admins)
exports.createListing = async (req, res) => {
    try {
        if (!req.session.user || (req.session.user.access_level !== 'admin' && req.session.user.access_level !== 'agent')) {
            return res.status(403).send('Not authorized');
        }

        let { price, type, status } = req.body;
        const userId = req.session.user.id;

        // Ensure required fields are provided
        if (!price || !type || !status) {
            return res.status(400).send('Missing required fields.');
        }

        // Convert price to a float
        price = parseFloat(price);

        await mysql.execute(
            'INSERT INTO listings (price, type, status, user_id) VALUES (?, ?, ?, ?)',
            [price, type, status, userId]
        );

        res.redirect('/listings');
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Show single listing
exports.getListing = async (req, res) => {
    try {
        const [listing] = await mysql.execute(`
            SELECT listings.*, users.username, users.access_level 
            FROM listings 
            JOIN users ON listings.user_id = users.id
            WHERE listings.id = ?`, 
            [req.params.id]
        );

        if (!listing.length) return res.status(404).send('Listing not found');

        res.render('listings/show', { listing: listing[0], user: req.session.user });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Show edit form (Only Agents & Admins)
exports.showEditForm = async (req, res) => {
    try {
        const [listing] = await mysql.execute('SELECT * FROM listings WHERE id = ?', [req.params.id]);
        if (!listing.length) return res.status(404).send('Listing not found');

        if (!req.session.user || (req.session.user.access_level !== 'admin' && req.session.user.access_level !== 'agent')) {
            return res.status(403).send('Not authorized');
        }

        res.render('listings/edit', { listing: listing[0], user: req.session.user });
    } catch (error) {
        console.error('Error fetching listing for edit:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Update listing (Only Agents & Admins)
exports.updateListing = async (req, res) => {
    try {
        if (!req.session.user || (req.session.user.access_level !== 'admin' && req.session.user.access_level !== 'agent')) {
            return res.status(403).send('Not authorized');
        }

        let { price, type, status } = req.body;

        // Ensure required fields are provided
        if (!price || !type || !status) {
            return res.status(400).send('Missing required fields.');
        }

        // Convert price to a float
        price = parseFloat(price);

        await mysql.execute(
            'UPDATE listings SET price = ?, type = ?, status = ? WHERE id = ?',
            [price, type, status, req.params.id]
        );

        res.redirect('/listings');
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Delete listing (Only Agents & Admins)
exports.deleteListing = async (req, res) => {
    try {
        if (!req.session.user || (req.session.user.access_level !== 'admin' && req.session.user.access_level !== 'agent')) {
            return res.status(403).send('Not authorized');
        }

        await mysql.execute('DELETE FROM listings WHERE id = ?', [req.params.id]);
        res.redirect('/listings');
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).send('Internal Server Error');
    }
};
