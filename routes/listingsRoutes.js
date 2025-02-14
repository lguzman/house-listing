const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// ✅ Debug log to check if the controller is loading properly
const listingsController = require('../controllers/listingsController');
console.log('Loaded Listings Controller:', Object.keys(listingsController));

// ✅ Set up storage for Multer
const storage = multer.diskStorage({
    destination: './public/uploads/', // Ensure this folder exists
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

// ✅ Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user) return res.status(403).send('Not authorized');
    next();
}

// ✅ Middleware to check if the user is an admin or agent
function requireAgentOrAdmin(req, res, next) {
    if (!req.session.user || (req.session.user.access_level !== 'admin' && req.session.user.access_level !== 'agent')) {
        return res.status(403).send('Not authorized');
    }
    next();
}

// ✅ CRUD Routes (Now Supports Images)
router.get('/', listingsController.getListings);
router.get('/new', requireAgentOrAdmin, listingsController.showNewForm);
router.post('/', requireAgentOrAdmin, upload.single('image'), listingsController.createListing); // ⬅️ Handles image upload
router.get('/:id', listingsController.getListing);
router.get('/:id/edit', requireAgentOrAdmin, listingsController.showEditForm);
router.post('/:id', requireAgentOrAdmin, upload.single('image'), listingsController.updateListing); // ⬅️ Handles image update
router.post('/:id/delete', requireAgentOrAdmin, listingsController.deleteListing);

// ✅ Like/Unlike Listing Route (Only add if it exists)
if (typeof listingsController.toggleLike === 'function') {
    router.post('/:id/like', requireAuth, listingsController.toggleLike);
} else {
    console.warn('⚠️ Warning: toggleLike function is missing in listingsController.');
}

module.exports = router;
