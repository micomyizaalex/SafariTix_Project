const { Op } = require('sequelize');
const pool = require('../config/pgPool');
const { Driver, Bus, Schedule, Location } = require('../models');

function mapTicketRow(row) {
  return {
    id: row.id,
    qrCode: row.id,
    bookingRef: row.booking_ref,
    status: row.status,
    checkedInAt: row.checked_in_at,
    price: row.price ? parseFloat(row.price) : null,
    seatNumber: row.seat_number,
    commuter: {
      id: row.passenger_id,
      name: row.passenger_name,
      email: row.passenger_email,
      phone: row.passenger_phone,
    },
    schedule: {
      id: row.schedule_id,
      routeFrom: row.route_from,
      routeTo: row.route_to,
      departureTime: row.departure_time,
      arrivalTime: row.arrival_time,
      date: row.schedule_date,
      busPlate: row.bus_plate,
    },
    bus: {
      id: row.bus_id,
      plateNumber: row.bus_plate,
    },
    companyId: row.company_id,
    isUsed: row.status === 'checked_in',
  };
}

// Return driver profile and assigned buses/schedules for UI dropdowns
const getDriverContext = async (req, res) => {
  try {
    const driver = await Driver.findOne({ where: { user_id: req.userId } });

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found', message: 'No driver linked to this account' });
    }

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT 
           b.id,
           b.plate_number,
           b.company_id,
           s.id AS schedule_id,
           s.departure_time,
           s.schedule_date,
           r.origin AS route_from,
           r.destination AS route_to
         FROM buses b
         LEFT JOIN schedules s 
           ON s.bus_id = b.id 
          AND s.status IN ('scheduled', 'in_progress')
         LEFT JOIN routes r ON r.id = s.route_id
         WHERE b.driver_id = $1 AND b.is_active = true
         ORDER BY s.departure_time ASC NULLS LAST`,
        [driver.id]
      );

      const buses = rows.map((row) => ({
        id: row.id,
        plateNumber: row.plate_number,
        companyId: row.company_id,
        scheduleId: row.schedule_id,
        routeFrom: row.route_from,
        routeTo: row.route_to,
        departureTime: row.departure_time,
        scheduleDate: row.schedule_date,
      }));

      return res.json({
        driver: {
          id: driver.id,
          name: driver.name,
          companyId: driver.company_id,
        },
        buses,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load driver data', message: error.message });
  }
};

// Validate and mark ticket as used (checked-in) with a transaction to avoid double scans
const scanTicket = async (req, res) => {
  let client;

  try {
    const { qrCode } = req.body || {};

    if (!qrCode || typeof qrCode !== 'string') {
      return res.status(400).json({ error: 'QR code is required', valid: false, message: 'QR code missing' });
    }

    const driver = await Driver.findOne({ where: { user_id: req.userId } });
    if (!driver) {
      return res.status(403).json({ error: 'Driver profile not found', valid: false, message: 'Driver profile missing' });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const ticketResult = await client.query(
      `SELECT 
         t.id,
         t.seat_number,
         t.booking_ref,
         t.price,
         t.status,
         t.booked_at,
         t.checked_in_at,
         t.company_id,
         t.schedule_id,
         u.id AS passenger_id,
         u.full_name AS passenger_name,
         u.email AS passenger_email,
         u.phone_number AS passenger_phone,
         s.departure_time,
         s.arrival_time,
         s.schedule_date,
         s.bus_id,
         r.origin AS route_from,
         r.destination AS route_to,
         b.plate_number AS bus_plate
       FROM tickets t
       INNER JOIN users u ON t.passenger_id = u.id
       INNER JOIN schedules s ON t.schedule_id = s.id
       INNER JOIN routes r ON s.route_id = r.id
       LEFT JOIN buses b ON s.bus_id = b.id
       WHERE t.id = $1 OR t.booking_ref = $1
       FOR UPDATE`,
      [qrCode]
    );

    if (ticketResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ticket not found', valid: false, message: 'Invalid ticket' });
    }

    const ticketRow = ticketResult.rows[0];

    if (ticketRow.company_id && ticketRow.company_id !== driver.company_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Ticket not in your company', valid: false, message: 'Unauthorized ticket' });
    }

    if (ticketRow.status === 'cancelled' || ticketRow.status === 'refunded') {
      await client.query('ROLLBACK');
      return res.status(400).json({ valid: false, message: 'Ticket is not valid for travel', ticket: mapTicketRow(ticketRow) });
    }

    if (ticketRow.status === 'checked_in') {
      await client.query('COMMIT');
      return res.status(200).json({ valid: false, message: 'Ticket already used', ticket: mapTicketRow(ticketRow) });
    }

    // Attempt status transition atomically to prevent double scanning
    const updateResult = await client.query(
      'UPDATE tickets SET status = $1, checked_in_at = NOW() WHERE id = $2 AND status = $3 RETURNING checked_in_at',
      ['checked_in', ticketRow.id, 'booked']
    );

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ valid: false, message: 'Ticket already used', ticket: mapTicketRow(ticketRow) });
    }

    await client.query('COMMIT');

    const mapped = mapTicketRow({ ...ticketRow, status: 'checked_in', checked_in_at: updateResult.rows[0].checked_in_at });
    return res.json({ valid: true, message: 'Ticket validated', ticket: mapped });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        // Ignore rollback errors
      }
    }
    return res.status(500).json({ error: 'Failed to scan ticket', valid: false, message: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Persist driver location so commuters can follow live trips
const shareLocation = async (req, res) => {
  try {
    const { busId, lat, lng, speed, heading, accuracy } = req.body || {};

    if (!busId || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'busId, lat, and lng are required' });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const driver = await Driver.findOne({ where: { user_id: req.userId } });
    if (!driver) {
      return res.status(403).json({ error: 'Driver profile not found' });
    }

    const bus = await Bus.findByPk(busId);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    if (bus.company_id !== driver.company_id || (bus.driver_id && bus.driver_id !== driver.id)) {
      return res.status(403).json({ error: 'You are not assigned to this bus' });
    }

    const schedule = await Schedule.findOne({
      where: {
        bus_id: busId,
        status: { [Op.in]: ['scheduled', 'in_progress'] },
      },
      order: [['departure_time', 'ASC']],
    });

    await Location.create({
      bus_id: busId,
      driver_id: driver.id,
      schedule_id: schedule ? schedule.id : null,
      latitude,
      longitude,
      speed: speed !== undefined ? speed : null,
      heading: heading !== undefined ? heading : null,
      accuracy: accuracy !== undefined ? accuracy : null,
      timestamp: new Date(),
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update location', message: error.message });
  }
};

module.exports = {
  getDriverContext,
  scanTicket,
  shareLocation,
};