const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const controller = require('../controllers/companySelfController');

router.get('/', auth, controller.getCompany);
router.get('/buses', auth, controller.getBuses);
router.post('/buses', auth, controller.createBus);
router.post('/buses/:id/assign-driver', auth, controller.assignBusDriver);
router.get('/schedules', auth, controller.getSchedules);
router.post('/schedules', auth, controller.createSchedule);
router.get('/tickets', auth, controller.getTickets);
router.get('/drivers', auth, controller.getDrivers);
router.post('/drivers', auth, controller.createDriver);

module.exports = router;
