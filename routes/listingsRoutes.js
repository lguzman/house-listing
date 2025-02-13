const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user) return res.status(403).send('Not authorized');
    next();
}

// Middleware to check if the user is an admin or agent
function requireAgentOrAdmin(req, res, next) {
    if (!req.session.user || (req.session.user.access_level !== 'admin' && req.session.user.access_level !== 'agent')) {
        return res.status(403).send('Not authorized');
    }
    next();
}

// CRUD Routes
router.get('/', listingsController.getListings);
router.get('/new', requireAgentOrAdmin, listingsController.showNewForm); // ⬅️ Only agents/admins can see form
router.post('/', requireAgentOrAdmin, listingsController.createListing); // ⬅️ Only agents/admins can create
router.get('/:id', listingsController.getListing);
router.get('/:id/edit', requireAgentOrAdmin, listingsController.showEditForm); // ⬅️ Only agents/admins can edit
router.post('/:id', requireAgentOrAdmin, listingsController.updateListing); // ⬅️ FIXED: Now handles POST /listings/:id
router.post('/:id/delete', requireAgentOrAdmin, listingsController.deleteListing); // ⬅️ Only agents/admins can delete

module.exports = router;
