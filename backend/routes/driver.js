const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const { requireRoles } = require('../middleware/authorize');
const controller = require('../controllers/driverController');

// Driver context and assignments
router.get('/context', auth, requireRoles(['driver']), controller.getDriverContext);

// Ticket validation
router.post('/scan', auth, requireRoles(['driver']), controller.scanTicket);

// Driver location updates
router.post('/location', auth, requireRoles(['driver']), controller.shareLocation);

module.exports = router;