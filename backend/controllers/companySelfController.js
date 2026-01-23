const { Company, Bus, Schedule, Ticket, User, Driver, Route } = require('../models');

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
    res.status(400).json({ error: error.message });
  }
};

const getBuses = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    if (!companyId) return res.json({ buses: [] });

    const buses = await Bus.findAll({ where: { company_id: companyId } });
    const mapped = buses.map(b => ({
      id: b.id,
      plateNumber: b.plate_number,
      model: b.model,
      capacity: b.capacity,
      driverId: b.driver_id || null,
      status: b.is_active ? 'active' : 'inactive'
    }));
    res.json({ buses: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createBus = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    
    if (!companyId) {
      return res.status(403).json({ error: 'No company associated with user' });
    }

    const { plateNumber, capacity, model, driverId } = req.body;

    if (!plateNumber || !capacity || !model) {
      return res.status(400).json({ error: 'Plate number, capacity, and model are required' });
    }

    const bus = await Bus.create({
      company_id: companyId,
      plate_number: plateNumber,
      capacity: parseInt(capacity),
      model,
      driver_id: driverId || null,
      is_active: true
    });

    const mapped = {
      id: bus.id,
      plateNumber: bus.plate_number,
      model: bus.model,
      capacity: bus.capacity,
      driverId: bus.driver_id || null,
      status: bus.is_active ? 'active' : 'inactive'
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

    const bus = await Bus.findByPk(busId);
    if (!bus || bus.company_id !== companyId) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    if (driverId) {
      const driver = await Driver.findByPk(driverId);
      if (!driver || driver.company_id !== companyId) {
        return res.status(400).json({ error: 'Invalid driver for this company' });
      }
      bus.driver_id = driverId;
    } else {
      bus.driver_id = null;
    }

    await bus.save();

    const mapped = {
      id: bus.id,
      plateNumber: bus.plate_number,
      model: bus.model,
      capacity: bus.capacity,
      driverId: bus.driver_id || null,
      status: bus.is_active ? 'active' : 'inactive'
    };

    res.json({ bus: mapped });
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

    const schedules = await Schedule.findAll({ where: { company_id: companyId } });
    const mapped = schedules.map(s => ({
      id: s.id,
      routeFrom: s.route_from || s.from || 'N/A',
      routeTo: s.route_to || s.to || 'N/A',
      departureTime: s.departure_time || s.time || null,
      arrivalTime: s.arrival_time || null,
      date: s.date || s.schedule_date || null,
      price: parseFloat(s.price || 0),
      seatsAvailable: s.seats_available || 0,
      totalSeats: s.total_seats || 0
    }));
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
        attributes: ['id', 'plate_number', 'model', 'capacity', 'is_active']
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

const createDriver = async (req, res) => {
  try {
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

module.exports = {
  getCompany,
  getBuses,
  createBus,
  assignBusDriver,
  getSchedules,
  createSchedule,
  getTickets,
  getDrivers,
  createDriver
};
