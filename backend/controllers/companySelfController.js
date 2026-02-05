const { Company, Bus, Schedule, Ticket, User, Driver, Route } = require('../models');
const { Op } = require('sequelize');
const busService = require('../services/busService');

// Get company for current user
const getCompany = async (req, res) => {
  try {
    // Try to find company by user's company_id or owner_id
    const userId = req.userId;
    const user = await User.findByPk(userId);
    
    let company = null;
    if (user && user.company_id) {
      company = await Company.findByPk(user.company_id);
    }

    if (!company) {
      company = await Company.findOne({ where: { owner_id: userId } });
    }

    if (!company) return res.status(200).json({ company: null });

    // Map DB fields to frontend expected shape
    const mapped = {
      id: company.id,
      name: company.name,
      status: company.status,
      subscriptionStatus: company.subscription_status || 'inactive',
      subscriptionPaid: !!company.subscription_paid
    };

    res.json({ company: mapped });
  } catch (error) {
    console.error('createBus error:', error);
    res.status(400).json({ error: error.message });
  }
};

const getBuses = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.json({ buses: [] });

    const buses = await busService.listBuses(companyId);
    const mapped = buses.map(b => ({
      id: b.id,
      plateNumber: b.plate_number,
      model: b.model,
      capacity: b.capacity,
      seatLayout: b.seat_layout,
      driverId: b.driver_id || null,
      status: b.status.toLowerCase()
    }));
    res.json({ buses: mapped });
  } catch (error) {
    console.error('assignBusDriver error:', error);
    res.status(400).json({ error: error.message });
  }
};

const createBus = async (req, res) => {
  try {
    console.log('createBus request payload:', req.body, 'userId:', req.userId);
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    
    if (!companyId) {
      return res.status(403).json({ error: 'No company associated with user' });
    }

    const payload = {
      plate_number: req.body.plateNumber || req.body.plate_number,
      capacity: req.body.capacity,
      model: req.body.model,
      seat_layout: req.body.seatLayout || req.body.seat_layout,
      driver_id: req.body.driverId || req.body.driver_id || null
    };

    const bus = await busService.createBus(companyId, payload, { assignedBy: userId });

    const mapped = {
      id: bus.id,
      plateNumber: bus.plate_number,
      model: bus.model,
      capacity: bus.capacity,
      seatLayout: bus.seat_layout,
      driverId: bus.driver_id || null,
      status: bus.status.toLowerCase()
    };

    res.status(201).json({ bus: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const assignBusDriver = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;

    if (!companyId) {
      return res.status(403).json({ error: 'No company associated with user' });
    }

    const busId = req.params.id;
    const { driverId } = req.body;

    const payload = { driver_id: driverId || null };
    const bus = await busService.updateBus(companyId, busId, payload, { assignedBy: userId });

    const mapped = {
      id: bus.id,
      plateNumber: bus.plate_number,
      model: bus.model,
      capacity: bus.capacity,
      seatLayout: bus.seat_layout,
      driverId: bus.driver_id || null,
      status: bus.status.toLowerCase()
    };

    res.json({ bus: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateBus = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.status(403).json({ error: 'No company associated with user' });

    const busId = req.params.id;
    const payload = {
      plate_number: req.body.plateNumber || req.body.plate_number,
      capacity: req.body.capacity,
      model: req.body.model,
      seat_layout: req.body.seatLayout || req.body.seat_layout,
      driver_id: req.body.driverId !== undefined ? req.body.driverId : req.body.driver_id,
      status: req.body.status ? req.body.status.toUpperCase() : undefined
    };

    const bus = await busService.updateBus(companyId, busId, payload, { assignedBy: userId });
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const mapped = {
      id: bus.id,
      plateNumber: bus.plate_number,
      model: bus.model,
      capacity: bus.capacity,
      seatLayout: bus.seat_layout,
      driverId: bus.driver_id || null,
      status: bus.status.toLowerCase()
    };

    res.json({ bus: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteBus = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.status(403).json({ error: 'No company associated with user' });

    const busId = req.params.id;
    const result = await busService.deleteBus(companyId, busId);
    res.json({ message: 'Bus deleted', busId: result.busId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSchedules = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.json({ schedules: [] });

    const schedules = await Schedule.findAll({
      where: { company_id: companyId },
      include: [
        {
          model: Route,
          attributes: ['origin', 'destination'],
          required: false
        }
      ]
    });

    const mapped = schedules.map(s => {
      const price = parseFloat(s.price_per_seat || s.price || 0);
      const bookedSeats = s.booked_seats || 0;
      const availableSeats = s.available_seats ?? s.seats_available ?? 0;
      return {
        id: s.id,
        routeFrom: s.Route?.origin || s.route_from || s.from || 'N/A',
        routeTo: s.Route?.destination || s.route_to || s.to || 'N/A',
        departureTime: s.departure_time || s.time || null,
        arrivalTime: s.arrival_time || null,
        date: s.schedule_date || s.date || null,
        price,
        seatsAvailable: availableSeats,
        bookedSeats,
        revenue: bookedSeats * price
      };
    });
    res.json({ schedules: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTickets = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.json({ tickets: [] });

    const tickets = await Ticket.findAll({ where: { company_id: companyId } });
    const mapped = tickets.map(t => ({
      id: t.id,
      price: parseFloat(t.price || 0),
      paymentStatus: t.payment_status || (t.status === 'booked' ? 'paid' : 'unpaid'),
      seatNumber: t.seat_number,
      qrCode: t.qr_code_url || t.qr_code || null,
      status: t.status,
      scanned: !!t.checked_in_at,
      createdAt: t.created_at || t.booked_at || t.createdAt,
      scheduleId: t.schedule_id
    }));
    res.json({ tickets: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getDrivers = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.json({ drivers: [] });

    const drivers = await Driver.findAll({ 
      where: { company_id: companyId },
      include: [{
        model: Bus,
        as: 'buses',
        attributes: ['id', 'plate_number', 'model', 'capacity', 'status']
      }]
    });
    
    const mapped = drivers.map(d => ({
      id: d.id,
      name: d.name,
      license: d.license_number,
      phone: d.phone,
      available: d.is_active,
      buses: d.buses || []
    }));
    res.json({ drivers: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getDriver = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.status(403).json({ error: 'No company associated with user' });

    const driver = await Driver.findByPk(req.params.id);
    if (!driver || driver.company_id !== companyId) return res.status(404).json({ error: 'Driver not found' });

    const mapped = {
      id: driver.id,
      name: driver.name,
      license: driver.license_number,
      phone: driver.phone,
      email: driver.email || null
    };
    res.json({ driver: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createDriver = async (req, res) => {
  try {
    console.log('createDriver request payload:', req.body, 'userId:', req.userId);
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    
    if (!companyId) {
      return res.status(403).json({ error: 'No company associated with user' });
    }

    const { name, license, phone } = req.body;

    if (!name || !license) {
      return res.status(400).json({ error: 'Name and license number are required' });
    }

    const driver = await Driver.create({
      company_id: companyId,
      name,
      license_number: license,
      phone,
      is_active: true
    });

    console.log('createDriver: driver created', driver.id);

    const mapped = {
      id: driver.id,
      name: driver.name,
      license: driver.license_number,
      phone: driver.phone,
      available: driver.is_active,
      buses: []
    };

    res.status(201).json({ driver: mapped });
  } catch (error) {
    console.error('createDriver error:', error);
    // Handle common Sequelize unique constraint for license numbers
    if (error && error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Driver with this license number already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};

const updateDriver = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.status(403).json({ error: 'No company associated with user' });

    const driverId = req.params.id;
    const driver = await Driver.findByPk(driverId);
    if (!driver || driver.company_id !== companyId) return res.status(404).json({ error: 'Driver not found' });

    const { name, license, phone, email } = req.body;

    // Validate required
    if (!name || !license) return res.status(400).json({ error: 'Name and license are required' });

    // Prevent cross-company license/phone duplicates
    const existingLicense = await Driver.findOne({ where: { license_number: license, id: { [Op.ne]: driverId } } });
    if (existingLicense) return res.status(400).json({ error: 'License number already in use' });

    const existingPhone = phone ? await Driver.findOne({ where: { company_id: companyId, phone, id: { [Op.ne]: driverId } } }) : null;
    if (existingPhone) return res.status(400).json({ error: 'Phone number already in use for this company' });

    driver.name = name;
    driver.license_number = license;
    driver.phone = phone || null;
    driver.email = email || null;

    await driver.save();

    res.json({ driver: { id: driver.id, name: driver.name, license: driver.license_number, phone: driver.phone, email: driver.email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.status(403).json({ error: 'No company associated with user' });

    const driverId = req.params.id;
    const driver = await Driver.findByPk(driverId);
    if (!driver || driver.company_id !== companyId) return res.status(404).json({ error: 'Driver not found' });

    // Prevent deleting driver assigned to an active bus
    const assignedBus = await Bus.findOne({ where: { driver_id: driverId } });
    if (assignedBus) return res.status(400).json({ error: 'Cannot delete driver assigned to a bus' });

    await Driver.destroy({ where: { id: driverId } });

    res.json({ message: 'Driver deleted', driverId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    
    if (!companyId) {
      return res.status(403).json({ error: 'No company associated with user' });
    }

    const { busId, routeFrom, routeTo, departureTime, arrivalTime, price, date, driverId } = req.body;

    if (!busId || !routeFrom || !routeTo || !departureTime || !arrivalTime || !price || !date) {
      return res.status(400).json({ error: 'Bus, route, times, price, and date are required' });
    }

    // Verify bus exists and belongs to this company
    const bus = await Bus.findByPk(busId);
    if (!bus || bus.company_id !== companyId) {
      return res.status(400).json({ error: 'Invalid bus for this company' });
    }

    // Reject scheduling on inactive buses
    if (bus.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Cannot schedule an INACTIVE bus' });
    }

    // Verify driver if provided
    if (driverId) {
      const driver = await Driver.findByPk(driverId);
      if (!driver || driver.company_id !== companyId) {
        return res.status(400).json({ error: 'Invalid driver for this company' });
      }
    }

    // Find or create route
    let route = await Route.findOne({
      where: {
        company_id: companyId,
        origin: routeFrom,
        destination: routeTo
      }
    });

    if (!route) {
      route = await Route.create({
        company_id: companyId,
        name: `${routeFrom} - ${routeTo}`,
        origin: routeFrom,
        destination: routeTo
      });
    }

    // Create schedule
    const schedule = await Schedule.create({
      bus_id: busId,
      route_id: route.id,
      driver_id: driverId || null,
      company_id: companyId,
      schedule_date: date,
      departure_time: new Date(`${date}T${departureTime}`),
      arrival_time: new Date(`${date}T${arrivalTime}`),
      price_per_seat: parseFloat(price),
      available_seats: bus.capacity,
      status: 'scheduled',
      created_by: userId
    });

    const mapped = {
      id: schedule.id,
      busId: schedule.bus_id,
      routeFrom: route.origin,
      routeTo: route.destination,
      departureTime: schedule.departure_time,
      arrivalTime: schedule.arrival_time,
      date: schedule.schedule_date,
      price: parseFloat(schedule.price_per_seat),
      seatsAvailable: schedule.available_seats,
      totalSeats: bus.capacity,
      driverId: schedule.driver_id
    };

    res.status(201).json({ schedule: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const reopenScheduleTickets = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.status(403).json({ error: 'No company associated with user' });

    const scheduleId = req.params.id;
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule || schedule.company_id !== companyId) return res.status(404).json({ error: 'Schedule not found' });

    // Only admins can reopen (already enforced by route role guard)
    schedule.ticket_status = 'OPEN';
    await schedule.save();

    // Create schedule journal entry
    const ScheduleJournal = require('../models/ScheduleJournal');
    await ScheduleJournal.create({
      company_id: companyId,
      schedule_id: scheduleId,
      action: 'REOPEN_TICKET_SALES',
      performed_by: userId,
      note: req.body.note || null
    });

    res.json({ message: 'Ticket sales reopened', scheduleId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getScheduleJournals = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.status(403).json({ error: 'No company associated with user' });

    const scheduleId = req.params.id;
    const ScheduleJournal = require('../models/ScheduleJournal');
    const journals = await ScheduleJournal.findAll({ where: { schedule_id: scheduleId, company_id: companyId }, order: [['created_at','DESC']] });

    const mapped = journals.map(j => ({ id: j.id, action: j.action, performedBy: j.performed_by, note: j.note, createdAt: j.created_at }));
    res.json({ journals: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const patchBusStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;

    if (!companyId) return res.status(403).json({ error: 'No company associated with user' });

    const busId = req.params.id;
    const { status } = req.body;

    const bus = await busService.setStatus(companyId, busId, status, { updatedBy: userId });
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const mapped = {
      id: bus.id,
      plateNumber: bus.plate_number,
      model: bus.model,
      capacity: bus.capacity,
      seatLayout: bus.seat_layout,
      driverId: bus.driver_id || null,
      status: bus.status.toLowerCase()
    };

    res.json({ bus: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getCompany,
  getBuses,
  createBus,
  assignBusDriver,
  getSchedules,
  createSchedule,
  getTickets,
  getDrivers,
  createDriver,
  getDriver,
  patchBusStatus,
  updateBus,
  updateDriver,
  deleteDriver,
  deleteBus,
  reopenScheduleTickets,
  getScheduleJournals
};


