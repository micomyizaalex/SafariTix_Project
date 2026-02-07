const { Schedule, Route, Bus, Company, Driver, Location, Ticket } = require('../models');
const { Op } = require('sequelize');
const pool = require('../config/pgPool');

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
      },
      {
        model: Bus,
        attributes: ['id','plate_number','status'],
        where: { status: 'ACTIVE' },
        required: true
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
        'status',
        'ticket_status'
      ]
    });

    // Map and filter schedules with available seats
    const now = new Date();

    const mapped = schedules
      .filter(s => s.available_seats > 0) // Only include schedules with available seats
      .filter(s => {
        // Exclude schedules where ticket sales are closed or departure time has passed
        if (s.ticket_status === 'CLOSED') return false;
        if (s.departure_time && new Date(s.departure_time) <= now) return false;
        return true;
      })
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
        ,
        ticketStatus: s.ticket_status || 'OPEN',
        ticketReason: (s.ticket_status === 'CLOSED') ? 'manual' : null
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
            attributes: ['id', 'plate_number', 'company_id', 'driver_id','status'],
            required: false,
            where: { status: 'ACTIVE' },
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
        'status',
        'ticket_status'
      ]
    });

    const now = new Date();

    const mapped = schedules
      .filter(s => s.available_seats > 0)
      .filter(s => {
        if (s.ticket_status === 'CLOSED') return false;
        if (s.departure_time && new Date(s.departure_time) <= now) return false;
        return true;
      })
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

// Get single schedule details and bookability
const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id, { include: [Route, Bus] });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    const now = new Date();
    const bookable = schedule.status === 'scheduled' && schedule.ticket_status !== 'CLOSED' && (!(schedule.departure_time) || new Date(schedule.departure_time) > now);
    res.json({ schedule: {
      id: schedule.id,
      routeId: schedule.route_id,
      busId: schedule.bus_id,
      date: schedule.schedule_date,
      departureTime: schedule.departure_time,
      arrivalTime: schedule.arrival_time,
      price: parseFloat(schedule.price_per_seat || 0),
      availableSeats: schedule.available_seats,
      bookedSeats: schedule.booked_seats,
      status: schedule.status,
      bookable,
      routeFrom: schedule.Route?.origin || null,
      routeTo: schedule.Route?.destination || null,
      busPlate: schedule.Bus?.plate_number || null,
      busCapacity: schedule.Bus?.capacity || null
    }});
  } catch (err) {
    console.error('getScheduleById error', err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

// Get user tickets (requires authentication)
// Updated to include payment information using pg Pool
const getTickets = async (req, res) => {
  let client;
  
  try {
    const userId = req.userId; // From auth middleware
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    client = await pool.connect();

    // Query to get tickets with payment, schedule, passenger, and bus information
    const query = `
      SELECT 
        t.id,
        t.seat_number,
        t.booking_ref,
        t.price,
        t.status,
        t.booked_at,
        t.created_at,
        t.schedule_id,
        u.full_name as passenger_name,
        u.email as passenger_email,
        p.payment_method,
        p.status as payment_status,
        p.transaction_ref,
        s.departure_time,
        s.arrival_time,
        s.schedule_date,
        r.origin as route_from,
        r.destination as route_to,
        b.plate_number as bus_plate,
        b.model as bus_model
      FROM tickets t
      INNER JOIN users u ON t.passenger_id = u.id
      LEFT JOIN payments p ON t.payment_id = p.id
      INNER JOIN schedules s ON t.schedule_id = s.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses b ON s.bus_id = b.id
      WHERE t.passenger_id = $1
      ORDER BY t.created_at DESC
    `;

    const result = await client.query(query, [userId]);
    client.release();

    const tickets = result.rows.map(row => ({
      id: row.id,
      seatNumber: row.seat_number,
      bookingRef: row.booking_ref,
      price: parseFloat(row.price || 0),
      status: row.status,
      paymentMethod: row.payment_method || 'N/A',
      paymentStatus: row.payment_status || 'N/A',
      transactionRef: row.transaction_ref,
      scanned: row.status === 'CHECKED_IN',
      createdAt: row.created_at || row.booked_at,
      scheduleId: row.schedule_id,
      passengerName: row.passenger_name || 'N/A',
      passengerEmail: row.passenger_email || 'N/A',
      routeFrom: row.route_from || 'N/A',
      routeTo: row.route_to || 'N/A',
      departureTime: row.departure_time,
      arrivalTime: row.arrival_time,
      scheduleDate: row.schedule_date,
      busPlate: row.bus_plate || 'N/A',
      busModel: row.bus_model || 'N/A'
    }));

    res.json({ tickets });
  } catch (error) {
    if (client) client.release();
    console.error('Get tickets error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tickets' });
  }
};

/**
 * Search schedules using PostgreSQL Pool with parameterized queries
 * This endpoint uses direct SQL queries (not Sequelize) as required
 * 
 * Accepts 'from' and 'to' as query or body parameters
 * Returns schedules with available_seats > 0 matching the locations
 */
const searchSchedulesPg = async (req, res) => {
  let client;
  let fromLocation = '';
  let toLocation = '';
  
  try {
    // Extract from and to from query params or body
    const from = req.query.from || req.body.from;
    const to = req.query.to || req.body.to;

    // Validate input
    if (!from || !to) {
      return res.status(400).json({ 
        error: 'Please enter both From and To',
        message: 'Both from and to locations are required'
      });
    }

    // Trim whitespace
    fromLocation = from.trim();
    toLocation = to.trim();

    // Check for empty strings after trimming
    if (!fromLocation || !toLocation) {
      return res.status(400).json({ 
        error: 'Please enter both From and To',
        message: 'Both from and to locations cannot be empty'
      });
    }

    // Validate pool is available
    if (!pool) {
      console.error('Pool is not initialized');
      return res.status(500).json({ 
        error: 'Database pool not initialized',
        message: 'Database connection pool is not available. Please check server configuration.'
      });
    }

    // Get a client from the pool
    try {
      client = await pool.connect();
    } catch (poolError) {
      console.error('Pool connection error:', poolError);
      console.error('Pool error details:', {
        code: poolError.code,
        message: poolError.message,
        stack: poolError.stack
      });
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check DATABASE_URL environment variable.',
        detail: poolError.message,
        ...(process.env.NODE_ENV === 'development' && { 
          code: poolError.code,
          hint: 'Make sure DATABASE_URL is set in your .env file'
        })
      });
    }

    // Parameterized SQL query using ILIKE for case-insensitive matching
    // Includes bus plate number, driver name, and travel date
    // Uses schedule.driver_id first, falls back to bus.driver_id if schedule driver is not assigned
    const query = `
      SELECT 
        s.id,
        r.origin as from_location,
        r.destination as to_location,
        s.departure_time,
        s.schedule_date,
        s.available_seats,
        s.booked_seats,
        s.price_per_seat as price,
        s.company_id,
        c.name as company_name,
        b.plate_number as bus_plate_number,
        COALESCE(sd.name, bd.name) as driver_name
      FROM schedules s
      INNER JOIN routes r ON s.route_id = r.id
      LEFT JOIN companies c ON s.company_id = c.id
      LEFT JOIN buses b ON s.bus_id = b.id
      LEFT JOIN drivers sd ON s.driver_id = sd.id
      LEFT JOIN drivers bd ON b.driver_id = bd.id
      WHERE 
        r.origin ILIKE $1
        AND r.destination ILIKE $2
        AND s.available_seats > 0
        AND s.status = 'scheduled'
      ORDER BY s.departure_time ASC
    `;

    // Use parameterized query to prevent SQL injection
    // % wildcards for partial matching
    const fromPattern = `%${fromLocation}%`;
    const toPattern = `%${toLocation}%`;

    // Log search parameters (for debugging)
    console.log('Searching schedules:', { from: fromLocation, to: toLocation });

    const result = await client.query(query, [fromPattern, toPattern]);
    
    console.log(`Found ${result.rows.length} matching schedules`);

    // Handle no results
    if (!result.rows || result.rows.length === 0) {
      return res.status(200).json({
        schedules: [],
        message: 'No schedules available for this route'
      });
    }

    // Format the results
    const schedules = result.rows.map(row => ({
      id: row.id,
      from_location: row.from_location,
      to_location: row.to_location,
      departure_time: row.departure_time,
      schedule_date: row.schedule_date, // Travel date
      available_seats: parseInt(row.available_seats, 10),
      booked_seats: parseInt(row.booked_seats || 0, 10),
      price: parseFloat(row.price || 0),
      company_id: row.company_id,
      company_name: row.company_name || 'N/A',
      bus_plate_number: row.bus_plate_number || 'N/A',
      driver_name: row.driver_name || 'No driver assigned'
    }));

    res.json({
      schedules,
      count: schedules.length
    });

  } catch (error) {
    console.error('Database search error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
      hint: error.hint,
      from: fromLocation,
      to: toLocation
    });
    
    // Handle database-specific errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please try again later.'
      });
    }

    if (error.code === '42P01') {
      // Table doesn't exist
      return res.status(500).json({ 
        error: 'Database schema error',
        message: 'The schedules table or required columns may not exist. Please check the database schema.',
        detail: error.detail
      });
    }

    if (error.code === '42703') {
      // Column doesn't exist
      return res.status(500).json({ 
        error: 'Database schema error',
        message: 'A required column does not exist in the database. Please check the database schema.',
        detail: error.detail
      });
    }

    // Generic error response - ensure we always send a response
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to search schedules',
        message: error.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { 
          detail: error.detail,
          code: error.code,
          stack: error.stack
        })
      });
    } else {
      // If headers already sent, log the error
      console.error('Response already sent, cannot send error response');
    }
  } finally {
    // Always release the client back to the pool
    if (client) {
      client.release();
    }
  }
};

/**
 * Test database connection endpoint (for debugging)
 */
const testDbConnection = async (req, res) => {
  let client;
  try {
    if (!pool) {
      return res.status(500).json({ error: 'Pool not initialized' });
    }
    
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    client.release();
    
    res.json({
      success: true,
      message: 'Database connection successful',
      time: result.rows[0].current_time,
      version: result.rows[0].pg_version
    });
  } catch (error) {
    if (client) client.release();
    console.error('DB connection test error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
      code: error.code
    });
  }
};

/**
 * Get a single ticket by ID with full details
 * Only the ticket owner can view their ticket
 */
const getTicketById = async (req, res) => {
  let client;
  
  try {
    const userId = req.userId;
    const { ticketId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    client = await pool.connect();

    // Query to get full ticket details with all joins
    const query = `
      SELECT 
        t.id,
        t.seat_number,
        t.booking_ref,
        t.price,
        t.status,
        t.booked_at,
        t.checked_in_at,
        t.created_at,
        t.schedule_id,
        u.id as passenger_id,
        u.full_name as passenger_name,
        u.email as passenger_email,
        u.phone_number as passenger_phone,
        p.payment_method,
        p.status as payment_status,
        p.transaction_ref,
        s.departure_time,
        s.arrival_time,
        s.schedule_date,
        r.origin as route_from,
        r.destination as route_to,
        b.plate_number as bus_plate,
        b.model as bus_model,
        c.name as company_name
      FROM tickets t
      INNER JOIN users u ON t.passenger_id = u.id
      LEFT JOIN payments p ON t.payment_id = p.id
      INNER JOIN schedules s ON t.schedule_id = s.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses b ON s.bus_id = b.id
      LEFT JOIN companies c ON t.company_id = c.id
      WHERE t.id = $1 AND t.passenger_id = $2
    `;

    const result = await client.query(query, [ticketId, userId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Ticket not found',
        message: 'Ticket not found or you do not have permission to view it'
      });
    }

    const row = result.rows[0];
    const ticket = {
      id: row.id,
      ticketId: row.id,
      seatNumber: row.seat_number,
      bookingRef: row.booking_ref,
      price: parseFloat(row.price || 0),
      status: row.status,
      paymentMethod: row.payment_method || null,
      paymentStatus: row.payment_status || null,
      transactionRef: row.transaction_ref || null,
      scanned: !!row.checked_in_at,
      checkedInAt: row.checked_in_at,
      bookedAt: row.booked_at || row.created_at,
      createdAt: row.created_at,
      scheduleId: row.schedule_id,
      passengerId: row.passenger_id,
      passengerName: row.passenger_name,
      passengerEmail: row.passenger_email,
      passengerPhone: row.passenger_phone,
      routeFrom: row.route_from,
      routeTo: row.route_to,
      departureTime: row.departure_time,
      arrivalTime: row.arrival_time,
      scheduleDate: row.schedule_date,
      travelDate: row.schedule_date,
      busPlate: row.bus_plate,
      busPlateNumber: row.bus_plate,
      busModel: row.bus_model,
      companyName: row.company_name
    };

    res.json({ ticket });
  } catch (error) {
    if (client) client.release();
    console.error('Get ticket by ID error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch ticket' });
  }
};

/**
 * Scan ticket by QR code (for inspectors/drivers)
 * Can be accessed without authentication for scanning purposes
 * Returns full ticket details
 */
const scanTicket = async (req, res) => {
  let client;
  
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    client = await pool.connect();

    // Query to get full ticket details for scanning
    const query = `
      SELECT 
        t.id,
        t.seat_number,
        t.booking_ref,
        t.price,
        t.status,
        t.booked_at,
        t.checked_in_at,
        t.created_at,
        t.schedule_id,
        u.id as passenger_id,
        u.full_name as passenger_name,
        u.email as passenger_email,
        u.phone_number as passenger_phone,
        p.payment_method,
        p.status as payment_status,
        p.transaction_ref,
        s.departure_time,
        s.arrival_time,
        s.schedule_date,
        r.origin as route_from,
        r.destination as route_to,
        b.plate_number as bus_plate,
        b.model as bus_model,
        c.name as company_name
      FROM tickets t
      INNER JOIN users u ON t.passenger_id = u.id
      LEFT JOIN payments p ON t.payment_id = p.id
      INNER JOIN schedules s ON t.schedule_id = s.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses b ON s.bus_id = b.id
      LEFT JOIN companies c ON t.company_id = c.id
      WHERE t.id = $1 OR t.booking_ref = $1
    `;

    const result = await client.query(query, [ticketId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Ticket not found',
        message: 'Invalid ticket ID or booking reference'
      });
    }

    const row = result.rows[0];
    const ticket = {
      id: row.id,
      ticketId: row.id,
      seatNumber: row.seat_number,
      bookingRef: row.booking_ref,
      price: parseFloat(row.price || 0),
      status: row.status,
      paymentMethod: row.payment_method || null,
      paymentStatus: row.payment_status || null,
      transactionRef: row.transaction_ref || null,
      scanned: !!row.checked_in_at,
      checkedInAt: row.checked_in_at,
      bookedAt: row.booked_at || row.created_at,
      createdAt: row.created_at,
      scheduleId: row.schedule_id,
      passengerId: row.passenger_id,
      passengerName: row.passenger_name,
      passengerEmail: row.passenger_email,
      passengerPhone: row.passenger_phone,
      routeFrom: row.route_from,
      routeTo: row.route_to,
      departureTime: row.departure_time,
      arrivalTime: row.arrival_time,
      scheduleDate: row.schedule_date,
      travelDate: row.schedule_date,
      busPlate: row.bus_plate,
      busPlateNumber: row.bus_plate,
      busModel: row.bus_model,
      companyName: row.company_name,
      isValid: row.status === 'CONFIRMED' || row.status === 'CHECKED_IN',
      isUsed: row.status === 'CHECKED_IN'
    };

    res.json({ ticket });
  } catch (error) {
    if (client) client.release();
    console.error('Scan ticket error:', error);
    res.status(500).json({ error: error.message || 'Failed to scan ticket' });
  }
};

module.exports = {
  getAvailableSchedules,
  searchSchedules,
  searchSchedulesPg, // New endpoint using pg Pool
  testDbConnection, // Test endpoint
  getLocations,
  getTickets,
  getTicketById, // Get single ticket by ID
  scanTicket, // Scan ticket by QR code
  getScheduleById
};
