const express = require('express');
const router = express.Router();
const mysql = require('../config/db.js');

router.post('/like/:listingId', async (req, res) => {
    if (!req.session.user) return res.status(403).send('Not authorized');

    try {
        const userId = req.session.user.id;
        const listingId = req.params.listingId;

        // Check if the user already liked this listing
        const [existingLike] = await mysql.execute(
            'SELECT * FROM likes WHERE user_id = ? AND listing_id = ?',
            [userId, listingId]
        );

        if (existingLike.length > 0) {
            return res.status(400).json({ success: false, message: 'Already liked' });
        }

        await mysql.execute('INSERT INTO likes (user_id, listing_id) VALUES (?, ?)', [userId, listingId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error liking listing:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/unlike/:listingId', async (req, res) => {
    if (!req.session.user) return res.status(403).send('Not authorized');

    try {
        const userId = req.session.user.id;
        const listingId = req.params.listingId;

        await mysql.execute('DELETE FROM likes WHERE user_id = ? AND listing_id = ?', [userId, listingId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error unliking listing:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
