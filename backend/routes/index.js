const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const companyRoutes = require('./companies');
const adminRoutes = require('./admin');
const companySelfRoutes = require('./company');
const Notification = require("./notifications")
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/admin', adminRoutes);
router.use('/company', companySelfRoutes);
router.use('/notifications', Notification);

module.exports = router;