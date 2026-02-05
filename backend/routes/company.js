const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const { requireRoles } = require('../middleware/authorize');
const controller = require('../controllers/companySelfController');

router.get('/', auth, controller.getCompany);
router.get('/buses', auth, requireRoles(['company_admin','admin']), controller.getBuses);
router.post('/buses', auth, requireRoles(['company_admin','admin']), controller.createBus);
router.patch('/buses/:id/status', auth, requireRoles(['company_admin','admin']), controller.patchBusStatus);
router.post('/buses/:id/assign-driver', auth, requireRoles(['company_admin','admin']), controller.assignBusDriver);
router.put('/buses/:id', auth, requireRoles(['company_admin','admin']), controller.updateBus);
router.delete('/buses/:id', auth, requireRoles(['company_admin','admin']), controller.deleteBus);
router.get('/schedules', auth, requireRoles(['company_admin','admin']), controller.getSchedules);
router.post('/schedules', auth, requireRoles(['company_admin','admin']), controller.createSchedule);
router.patch('/schedules/:id/reopen', auth, requireRoles(['company_admin','admin']), controller.reopenScheduleTickets);
router.get('/schedules/:id/journals', auth, requireRoles(['company_admin','admin']), controller.getScheduleJournals);
router.get('/tickets', auth, requireRoles(['company_admin','admin']), controller.getTickets);
router.get('/drivers', auth, requireRoles(['company_admin','admin']), controller.getDrivers);
router.get('/drivers/:id', auth, requireRoles(['company_admin','admin']), controller.getDriver);
router.post('/drivers', auth, requireRoles(['company_admin','admin']), controller.createDriver);
router.put('/drivers/:id', auth, requireRoles(['company_admin','admin']), controller.updateDriver);
router.delete('/drivers/:id', auth, requireRoles(['company_admin','admin']), controller.deleteDriver);

module.exports = router;
