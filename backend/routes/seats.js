const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const auth = require('../middleware/authenticate');

// Public read access for available seats for a schedule
router.get('/schedules/:scheduleId', seatController.getSeatsForSchedule);

// Lock a seat (requires auth in production - allow public for testing)
router.post('/schedules/:scheduleId/lock', auth, seatController.lockSeat);

// Confirm lock after successful payment
router.post('/locks/:lockId/confirm', auth, seatController.confirmLock);

// Release lock (e.g., timeout or user cancel)
router.post('/locks/:lockId/release', auth, seatController.releaseLock);

module.exports = router;
