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
        },
        {
          model: Bus,
          attributes: ['plate_number'],
          required: false
        },
        {
          model: Driver,
          attributes: ['name'],
          required: false
        }
      ]
    });

    const mapped = schedules.map(s => {
      const price = parseFloat(s.price_per_seat || s.price || 0);
      const bookedSeats = s.booked_seats || 0;
      const availableSeats = s.available_seats ?? s.seats_available ?? 0;
      const totalSeats = s.total_seats || (bookedSeats + availableSeats) || 0;
      return {
        id: s.id,
        routeFrom: s.Route?.origin || s.route_from || s.from || 'N/A',
        routeTo: s.Route?.destination || s.route_to || s.to || 'N/A',
        departureTime: s.departure_time || s.time || null,
        scheduleDate: s.schedule_date || s.date || null,
        arrivalTime: s.arrival_time || null,
        price,
        seatsAvailable: availableSeats,
        totalSeats,
        bookedSeats,
        busPlateNumber: s.Bus?.plate_number || null,
        driverName: s.Driver?.name || null,
        status: s.status || 'scheduled',
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
    if (!companyId) {
      console.log('No company ID found for user:', userId);
      return res.json({ tickets: [] });
    }

    console.log('Fetching tickets for company:', companyId);
    
    const tickets = await Ticket.findAll({ 
      where: { company_id: companyId },
      include: [
        {
          model: User,
          as: 'passenger',
          attributes: ['id', 'full_name', 'email', 'phone_number'],
          required: false
        },
        {
          model: Schedule,
          attributes: ['id', 'schedule_date', 'departure_time', 'price_per_seat'],
          required: false,
          include: [
            {
              model: Route,
              attributes: ['id', 'origin', 'destination'],
              required: false
            },
            {
              model: Bus,
              attributes: ['id', 'plate_number', 'model'],
              required: false
            }
          ]
        }
      ],
      order: [['booked_at', 'DESC']]
    });

    console.log(`Found ${tickets.length} tickets for company ${companyId}`);

    const mapped = tickets.map(t => {
      const passenger = t.passenger;
      const schedule = t.Schedule;
      const route = schedule?.Route;
      const bus = schedule?.Bus;

      return {
        id: t.id,
        bookingRef: t.booking_ref,
        price: parseFloat(t.price || 0),
        paymentStatus: t.status === 'CONFIRMED' || t.status === 'CHECKED_IN' ? 'paid' : 'unpaid',
        seatNumber: t.seat_number,
        qrCode: t.qr_code_url || null,
        status: t.status,
        scanned: !!t.checked_in_at,
        bookedAt: t.booked_at,
        checkedInAt: t.checked_in_at,
        scheduleId: t.schedule_id,
        // Passenger info
        passengerName: passenger ? passenger.full_name : 'N/A',
        passengerEmail: passenger?.email || 'N/A',
        passengerPhone: passenger?.phone_number || 'N/A',
        // Schedule info
        scheduleDate: schedule?.schedule_date || null,
        departureTime: schedule?.departure_time || null,
        // Route info
        routeFrom: route?.origin || 'N/A',
        routeTo: route?.destination || 'N/A',
        // Bus info
        busPlateNumber: bus?.plate_number || 'N/A',
        busModel: bus?.model || 'N/A'
      };
    });

    console.log(`Returning ${mapped.length} mapped tickets`);
    res.json({ tickets: mapped });
  } catch (error) {
    console.error('getTickets error:', error);
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

const updateSchedule = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    
    if (!companyId) {
      return res.status(403).json({ error: 'No company associated with user' });
    }

    const scheduleId = req.params.id;
    const schedule = await Schedule.findByPk(scheduleId);

    if (!schedule || schedule.company_id !== companyId) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const { route_from, route_to, schedule_date, departure_time, bus_plate_number, price_per_seat, total_seats } = req.body;

    // Update schedule fields
    if (route_from) schedule.route_from = route_from;
    if (route_to) schedule.route_to = route_to;
    if (schedule_date) schedule.schedule_date = schedule_date;
    if (departure_time) schedule.departure_time = new Date(departure_time);
    if (price_per_seat) schedule.price_per_seat = parseFloat(price_per_seat);
    if (total_seats) schedule.total_seats = parseInt(total_seats);

    // Update bus if plate number provided
    if (bus_plate_number) {
      const bus = await Bus.findOne({ where: { plate_number: bus_plate_number, company_id: companyId } });
      if (bus) {
        schedule.bus_id = bus.id;
      }
    }

    await schedule.save();

    res.json({ message: 'Schedule updated successfully', schedule });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    const companyId = user?.company_id;
    
    if (!companyId) {
      return res.status(403).json({ error: 'No company associated with user' });
    }

    const scheduleId = req.params.id;
    const schedule = await Schedule.findByPk(scheduleId);

    if (!schedule || schedule.company_id !== companyId) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Check if there are any bookings
    const bookingCount = schedule.booked_seats || 0;
    if (bookingCount > 0) {
      return res.status(400).json({ error: 'Cannot delete schedule with existing bookings' });
    }

    await schedule.destroy();

    res.json({ message: 'Schedule deleted successfully' });
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

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    
    // Find company ID (same logic as getCompany)
    let companyId = user?.company_id;
    
    if (!companyId) {
      const company = await Company.findOne({ where: { owner_id: userId } });
      companyId = company?.id;
    }
    
    console.log('getDashboardStats for user:', userId, 'company:', companyId);
    
    if (!companyId) {
      console.log('No company found, returning empty stats');
      return res.json({
        balance: 0,
        sales: 0,
        totalProfit: 0,
        balanceGrowth: 0,
        salesGrowth: 0,
        weekData: [],
        recentSales: [],
        lastOrders: [],
        profitBreakdown: {}
      });
    }

    // Get all confirmed tickets for this company
    const allTickets = await Ticket.findAll({
      where: {
        company_id: companyId,
        status: { [Op.in]: ['CONFIRMED', 'CHECKED_IN'] }
      },
      include: [
        {
          model: User,
          as: 'passenger',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: Schedule,
          attributes: ['id', 'schedule_date', 'departure_time'],
          required: false,
          include: [
            {
              model: Route,
              attributes: ['origin', 'destination'],
              required: false
            }
          ]
        }
      ],
      order: [['booked_at', 'DESC']]
    });

    // Calculate total revenue
    const totalRevenue = allTickets.reduce((sum, ticket) => sum + parseFloat(ticket.price || 0), 0);
    
    // Get tickets from last 30 days for growth calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30DaysTickets = allTickets.filter(t => new Date(t.booked_at) >= thirtyDaysAgo);
    const last30DaysRevenue = last30DaysTickets.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
    
    // Get tickets from previous 30 days for comparison
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const previous30DaysTickets = allTickets.filter(t => {
      const bookedAt = new Date(t.booked_at);
      return bookedAt >= sixtyDaysAgo && bookedAt < thirtyDaysAgo;
    });
    const previous30DaysRevenue = previous30DaysTickets.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
    
    // Calculate growth percentages
    const revenueGrowth = previous30DaysRevenue > 0 
      ? ((last30DaysRevenue - previous30DaysRevenue) / previous30DaysRevenue * 100).toFixed(1)
      : 0;
    
    const salesCountGrowth = previous30DaysTickets.length > 0
      ? ((last30DaysTickets.length - previous30DaysTickets.length) / previous30DaysTickets.length * 100).toFixed(1)
      : 0;

    // Get last 7 days data for weekly chart
    const weekData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayTickets = allTickets.filter(t => {
        const bookedAt = new Date(t.booked_at);
        return bookedAt >= date && bookedAt < nextDate;
      });
      
      const dayRevenue = dayTickets.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
      
      weekData.push({
        day: days[date.getDay()],
        value: Math.round(dayRevenue)
      });
    }

    // Get recent sales (last 10 bookings)
    const recentSales = allTickets.slice(0, 10).map(ticket => {
      const timeDiff = Date.now() - new Date(ticket.booked_at).getTime();
      const minutesAgo = Math.floor(timeDiff / 60000);
      
      let timestamp;
      if (minutesAgo < 60) {
        timestamp = `${minutesAgo} Minutes Ago`;
      } else if (minutesAgo < 1440) {
        timestamp = `${Math.floor(minutesAgo / 60)} Hours Ago`;
      } else {
        timestamp = `${Math.floor(minutesAgo / 1440)} Days Ago`;
      }
      
      return {
        id: ticket.id,
        customerName: ticket.passenger?.full_name || 'Anonymous',
        customerAvatar: '👤',
        amount: parseFloat(ticket.price || 0),
        timestamp
      };
    });

    // Get top orders (highest value tickets)
    const topOrders = [...allTickets]
      .sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
      .slice(0, 5)
      .map(ticket => {
        const bookedDate = new Date(ticket.booked_at);
        const formattedDate = bookedDate.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
        
        return {
          id: ticket.id,
          customerName: ticket.passenger?.full_name || 'Anonymous',
          customerAvatar: '👤',
          amount: parseFloat(ticket.price || 0),
          status: ticket.status === 'CHECKED_IN' ? 'completed' : 'completed',
          date: formattedDate
        };
      });

    // Calculate profit breakdown by route
    const routeRevenue = {};
    allTickets.forEach(ticket => {
      const route = ticket.Schedule?.Route;
      if (route) {
        const routeKey = `${route.origin} - ${route.destination}`;
        if (!routeRevenue[routeKey]) {
          routeRevenue[routeKey] = 0;
        }
        routeRevenue[routeKey] += parseFloat(ticket.price || 0);
      }
    });

    // Get top 3 routes by revenue
    const sortedRoutes = Object.entries(routeRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const profitBreakdown = {};
    let topRoutesTotal = 0;
    
    sortedRoutes.forEach(([route, revenue], index) => {
      const percentage = totalRevenue > 0 ? (revenue / totalRevenue * 100).toFixed(0) : 0;
      profitBreakdown[route] = {
        amount: Math.round(revenue),
        percentage: parseInt(percentage)
      };
      topRoutesTotal += revenue;
    });

    // Add "Other" category for remaining routes
    const otherRevenue = totalRevenue - topRoutesTotal;
    if (otherRevenue > 0) {
      const percentage = totalRevenue > 0 ? (otherRevenue / totalRevenue * 100).toFixed(0) : 0;
      profitBreakdown['Other Routes'] = {
        amount: Math.round(otherRevenue),
        percentage: parseInt(percentage)
      };
    }

    const responseData = {
      balance: Math.round(totalRevenue),
      sales: Math.round(last30DaysRevenue),
      totalProfit: Math.round(totalRevenue),
      balanceGrowth: parseFloat(revenueGrowth),
      salesGrowth: parseFloat(salesCountGrowth),
      weekData,
      recentSales,
      lastOrders: topOrders,
      profitBreakdown
    };

    console.log('Returning dashboard stats:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (error) {
    console.error('getDashboardStats error:', error);
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
  updateSchedule,
  deleteSchedule,
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
  getScheduleJournals,
  getDashboardStats
};


