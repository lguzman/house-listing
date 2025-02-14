const mysql = require('../config/db.js');
const path = require('path');

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
        let image_url = req.body.image_url || null;

        // Ensure required fields are provided
        if (!price || !type || !status) {
            return res.status(400).send('Missing required fields.');
        }

        // Convert price to a float
        price = parseFloat(price);

        // Check if file was uploaded
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        await mysql.execute(
            'INSERT INTO listings (price, type, status, user_id, image_url) VALUES (?, ?, ?, ?, ?)',
            [price, type, status, userId, image_url]
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

        // Fetch total like count
        const [[{ likeCount }]] = await mysql.execute(
            'SELECT COUNT(*) AS likeCount FROM likes WHERE listing_id = ?',
            [req.params.id]
        );

        let userLiked = false;
        if (req.session.user) {
            const [likes] = await mysql.execute(
                'SELECT * FROM likes WHERE user_id = ? AND listing_id = ?',
                [req.session.user.id, req.params.id]
            );
            userLiked = likes.length > 0;
        }

        res.render('listings/show', { listing: listing[0], user: req.session.user, likeCount, userLiked });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Toggle like on a listing
exports.toggleLike = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = req.session.user.id;
        const listingId = req.params.id;

        // Check if the user already liked the listing
        const [existingLike] = await mysql.execute(
            'SELECT * FROM likes WHERE user_id = ? AND listing_id = ?',
            [userId, listingId]
        );

        let liked;
        if (existingLike.length > 0) {
            // Unlike the listing
            await mysql.execute('DELETE FROM likes WHERE user_id = ? AND listing_id = ?', [userId, listingId]);
            liked = false;
        } else {
            // Like the listing
            await mysql.execute('INSERT INTO likes (user_id, listing_id) VALUES (?, ?)', [userId, listingId]);
            liked = true;
        }

        // Get updated like count
        const [likeCountResult] = await mysql.execute(
            'SELECT COUNT(*) AS likeCount FROM likes WHERE listing_id = ?',
            [listingId]
        );

        res.json({ liked, likeCount: likeCountResult[0].likeCount });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
        let image_url = req.body.image_url; // Default to existing image

        // Ensure required fields are provided
        if (!price || !type || !status) {
            return res.status(400).send('Missing required fields.');
        }

        // Convert price to a float
        price = parseFloat(price);

        // Check if file was uploaded
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const [result] = await mysql.execute(
            'UPDATE listings SET price = ?, type = ?, status = ?, image_url = ? WHERE id = ?',
            [price, type, status, image_url, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('Listing not found or no changes made');
        }

        res.redirect(`/listings/${req.params.id}`);
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
