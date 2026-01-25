const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/authenticate');

// All payment routes require authentication
router.post('/initiate', auth, paymentController.initiatePayment);
router.post('/confirm', auth, paymentController.confirmPayment);
router.post('/book', auth, paymentController.bookTicket);

module.exports = router;

