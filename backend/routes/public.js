const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public endpoints (no authentication required)
router.get('/schedules', publicController.getAvailableSchedules);
router.get('/schedules/search', publicController.searchSchedules);

module.exports = router;
