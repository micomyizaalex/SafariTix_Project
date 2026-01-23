const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authenticate');
const { isAdmin } = require('../middleware/authorize');
const companyController = require('../controllers/companyController');

// Dashboard stats
router.get('/stats', auth, isAdmin, adminController.getStats);

// Companies list (optional query ?filter=pending)
router.get('/companies', auth, isAdmin, adminController.getCompanies);

// Admin approve/reject (proxy to companyController)
router.post('/companies/:id/approve', auth, isAdmin, companyController.approveCompany);
router.post('/companies/:id/reject', auth, isAdmin, companyController.rejectCompany);

module.exports = router;
