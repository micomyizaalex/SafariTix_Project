const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const companyRoutes = require('./companies');
const adminRoutes = require('./admin');
const companySelfRoutes = require('./company');
const notificationRoutes = require('./notifications');
const publicController = require('../controllers/publicController');
const auth = require('../middleware/authenticate');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/admin', adminRoutes);
router.use('/company', companySelfRoutes);
router.use('/notifications', notificationRoutes);

// Public endpoints (no authentication required)
router.get('/schedules', publicController.getAvailableSchedules);
router.get('/schedules/search', publicController.searchSchedules);
router.get('/tracking', publicController.getLocations);

// User endpoints (authentication required)
router.get('/tickets', auth, publicController.getTickets);

module.exports = router;