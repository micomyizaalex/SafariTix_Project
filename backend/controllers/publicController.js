const { Schedule, Route, Bus, Company, Driver, Location, Ticket } = require('../models');
const { Op } = require('sequelize');

// Get all available schedules for public booking
const getAvailableSchedules = async (req, res) => {
  try {
    const { from, to } = req.query;

    // Build where clause for schedules
    let scheduleWhere = {
      status: 'scheduled'
    };

    // Build include clause with Route
    const includeOptions = [
      {
        model: Route,
        attributes: ['id', 'origin', 'destination'],
        where: {},
        required: false
      }
    ];

    // Add route filtering if provided
    if (from || to) {
      if (from) {
        includeOptions[0].where.origin = {
          [Op.iLike]: `%${from}%`
        };
      }
      if (to) {
        includeOptions[0].where.destination = {
          [Op.iLike]: `%${to}%`
        };
      }
      includeOptions[0].required = true;
    }

    // Get schedules with available seats
    const schedules = await Schedule.findAll({
      where: scheduleWhere,
      include: includeOptions,
      attributes: [
        'id',
        'bus_id',
        'schedule_date',
        'departure_time',
        'arrival_time',
        'price_per_seat',
        'available_seats',
        'booked_seats',
        'status'
      ]
    });

    // Map and filter schedules with available seats
    const mapped = schedules
      .filter(s => s.available_seats > 0) // Only include schedules with available seats
      .map(s => ({
        id: s.id,
        busId: s.bus_id,
        routeFrom: s.Route?.origin || 'N/A',
        routeTo: s.Route?.destination || 'N/A',
        date: s.schedule_date,
        departureTime: s.departure_time,
        arrivalTime: s.arrival_time,
        price: parseFloat(s.price_per_seat || 0),
        seatsAvailable: s.available_seats,
        bookedSeats: s.booked_seats || 0,
        status: s.status
      }));

    res.json({ schedules: mapped });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch schedules' });
  }
};

// Search schedules by route
const searchSchedules = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'From and to locations are required' });
    }

    const whereClause = {
      status: 'scheduled',
      available_seats: {
        [Op.gt]: 0
      }
    };

    // Add date filter if provided
    if (date) {
      whereClause.schedule_date = date;
    }

    const schedules = await Schedule.findAll({
      where: whereClause,
      include: [
        {
          model: Route,
          attributes: ['id', 'origin', 'destination'],
          required: true,
          where: {
            origin: {
              [Op.iLike]: `%${from}%`
            },
            destination: {
              [Op.iLike]: `%${to}%`
            }
          }
        },
        {
          model: Bus,
          attributes: ['id', 'plate_number', 'company_id', 'driver_id'],
          required: false,
          include: [
            {
              model: Company,
              attributes: ['id', 'name'],
              required: false
            },
            {
              model: Driver,
              attributes: ['id', 'name'],
              required: false
            }
          ]
        }
      ],
      attributes: [
        'id',
        'bus_id',
        'route_id',
        'schedule_date',
        'departure_time',
        'arrival_time',
        'price_per_seat',
        'available_seats',
        'booked_seats',
        'status'
      ]
    });

    const mapped = schedules.map(s => ({
      id: s.id,
      busId: s.bus_id,
      routeFrom: s.Route?.origin || 'N/A',
      routeTo: s.Route?.destination || 'N/A',
      date: s.schedule_date,
      departureTime: s.departure_time,
      arrivalTime: s.arrival_time,
      price: parseFloat(s.price_per_seat || 0),
      seatsAvailable: s.available_seats,
      bookedSeats: s.booked_seats || 0,
      status: s.status,
      companyName: s.Bus?.Company?.name || 'N/A',
      busPlateNumber: s.Bus?.plate_number || 'N/A',
      driverName: s.Bus?.Driver?.name || 'No driver assigned',
      driverId: s.Bus?.driver_id || null
    }));

    res.json({ schedules: mapped });
  } catch (error) {
    console.error('Search schedules error:', error);
    res.status(500).json({ error: error.message || 'Failed to search schedules' });
  }
};

// Get locations (bus tracking data)
const getLocations = async (req, res) => {
  try {
    // Get recent locations (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const locations = await Location.findAll({
      where: {
        timestamp: {
          [Op.gte]: oneDayAgo
        }
      },
      include: [
        {
          model: Bus,
          attributes: ['id', 'plate_number', 'model'],
          required: false
        },
        {
          model: Driver,
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Schedule,
          attributes: ['id', 'schedule_date', 'departure_time'],
          required: false
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    const mapped = locations.map(l => ({
      id: l.id,
      busId: l.bus_id,
      busPlate: l.Bus?.plate_number || 'N/A',
      latitude: parseFloat(l.latitude),
      longitude: parseFloat(l.longitude),
      speed: l.speed ? parseFloat(l.speed) : 0,
      heading: l.heading ? parseFloat(l.heading) : 0,
      timestamp: l.timestamp,
      driverName: l.Driver?.name || 'N/A'
    }));

    res.json({ locations: mapped });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch locations' });
  }
};

// Get user tickets (requires authentication)
const getTickets = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const tickets = await Ticket.findAll({
      where: { passenger_id: userId },
      include: [
        {
          model: Schedule,
          attributes: ['id', 'schedule_date', 'departure_time', 'arrival_time', 'route_id', 'bus_id'],
          required: false,
          include: [
            {
              model: Route,
              attributes: ['origin', 'destination'],
              required: false
            },
            {
              model: Bus,
              attributes: ['plate_number', 'model'],
              required: false
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const mapped = tickets.map(t => ({
      id: t.id,
      price: parseFloat(t.price || 0),
      paymentStatus: t.payment_status || (t.status === 'booked' ? 'paid' : 'unpaid'),
      seatNumber: t.seat_number,
      qrCode: t.qr_code_url || t.qr_code || null,
      status: t.status,
      scanned: !!t.checked_in_at,
      createdAt: t.created_at || t.booked_at,
      scheduleId: t.schedule_id,
      routeFrom: t.Schedule?.Route?.origin || 'N/A',
      routeTo: t.Schedule?.Route?.destination || 'N/A',
      departureTime: t.Schedule?.departure_time,
      busPlate: t.Schedule?.Bus?.plate_number || 'N/A'
    }));

    res.json({ tickets: mapped });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tickets' });
  }
};

module.exports = {
  getAvailableSchedules,
  searchSchedules,
  getLocations,
  getTickets
};
