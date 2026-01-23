const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const controller = require('../controllers/companySelfController');

router.get('/', auth, controller.getCompany);
router.get('/buses', auth, controller.getBuses);
router.get('/schedules', auth, controller.getSchedules);
router.get('/tickets', auth, controller.getTickets);

module.exports = router;
