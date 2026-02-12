const { sequelize, Seat, SeatLock, Ticket, Schedule, Bus, Route } = require('../models');
const { Op } = require('sequelize');

const LOCK_DURATION_MINUTES = parseInt(process.env.SEAT_LOCK_MINUTES || '7', 10);

const getSeatsForSchedule = async (req, res) => {
  const { scheduleId } = req.params;
  try {
    const schedule = await Schedule.findByPk(scheduleId, { include: [Bus] });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    // load seats for bus
    const seats = await Seat.findAll({ where: { bus_id: schedule.bus_id } });

    // load current locks and confirmed tickets for this schedule
    const now = new Date();
    const locks = await SeatLock.findAll({ where: { schedule_id: scheduleId } });
    const tickets = await Ticket.findAll({ where: { schedule_id: scheduleId } });

    // build a map of seat states
    const seatMap = seats.map((s) => {
      const seatNum = s.seat_number;
      const activeLock = locks.find((l) => l.seat_number === seatNum && l.status === 'ACTIVE' && new Date(l.expires_at) > now);
      const confirmed = tickets.find((t) => t.seat_number === seatNum && t.status === 'CONFIRMED');
      let state = 'AVAILABLE';
      if (confirmed) state = 'BOOKED';
      else if (activeLock) state = 'LOCKED';

      return {
        id: s.id,
        seat_number: seatNum,
        row: s.row,
        col: s.col,
        side: s.side,
        is_window: s.is_window,
        meta: s.meta,
        state,
        lock_expires_at: activeLock ? activeLock.expires_at : null,
      };
    });

    res.json({ seats: seatMap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load seats' });
  }
};

// Create lock + PENDING ticket atomically
const lockSeat = async (req, res) => {
  const { scheduleId } = req.params;
  const { seat_number, passenger_id, price } = req.body;

  if (!seat_number || !passenger_id) return res.status(400).json({ message: 'seat_number and passenger_id required' });

  const t = await sequelize.transaction({ isolationLevel: 'SERIALIZABLE' });
  try {
    const schedule = await Schedule.findByPk(scheduleId, { transaction: t });
    if (!schedule) {
      await t.rollback();
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Ensure schedule is available for booking
    const now = new Date();
    if (schedule.status !== 'scheduled') {
      await t.rollback();
      return res.status(400).json({ message: 'Schedule not available for booking' });
    }
    if (schedule.ticket_status === 'CLOSED') {
      await t.rollback();
      return res.status(400).json({ message: 'Ticket sales closed for this schedule' });
    }
    if (schedule.departure_time && new Date(schedule.departure_time) <= now) {
      await t.rollback();
      return res.status(400).json({ message: 'Ticket sales closed for this schedule' });
    }

    // double-check confirmed ticket exists
    const existingConfirmed = await Ticket.findOne({ where: { schedule_id: scheduleId, seat_number, status: 'CONFIRMED' }, transaction: t, lock: t.LOCK.UPDATE });
    if (existingConfirmed) {
      await t.rollback();
      return res.status(409).json({ message: 'Seat already booked' });
    }

    const expiresAt = new Date(now.getTime() + LOCK_DURATION_MINUTES * 60000);

    // check active locks
    const activeLock = await SeatLock.findOne({ where: { schedule_id: scheduleId, seat_number, status: 'ACTIVE', expires_at: { [Op.gt]: now } }, transaction: t, lock: t.LOCK.UPDATE });
    if (activeLock) {
      await t.rollback();
      return res.status(409).json({ message: 'Seat is temporarily locked' });
    }

    // create ticket (PENDING_PAYMENT)
    const ticket = await Ticket.create({
      passenger_id,
      schedule_id: scheduleId,
      company_id: schedule.company_id,
      seat_number,
      price: price || 0,
      booking_ref: `BK-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      status: 'PENDING_PAYMENT',
    }, { transaction: t });

    // create seat lock
    const lock = await SeatLock.create({
      schedule_id: scheduleId,
      company_id: schedule.company_id,
      seat_number,
      passenger_id,
      ticket_id: ticket.id,
      expires_at: expiresAt,
      status: 'ACTIVE',
    }, { transaction: t });

    // link ticket -> lock
    ticket.lock_id = lock.id;
    await ticket.save({ transaction: t });

    await t.commit();

    res.status(201).json({ lock_id: lock.id, ticket_id: ticket.id, expires_at: expiresAt });
  } catch (error) {
    await t.rollback();
    console.error('lockSeat error', error);
    res.status(500).json({ message: 'Failed to lock seat' });
  }
};

const confirmLock = async (req, res) => {
  const { lockId } = req.params;
  const t = await sequelize.transaction();
  try {
    const lock = await SeatLock.findByPk(lockId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!lock) { await t.rollback(); return res.status(404).json({ message: 'Lock not found' }); }
    if (lock.status !== 'ACTIVE') { await t.rollback(); return res.status(400).json({ message: 'Lock not active' }); }

    // mark ticket confirmed
    const ticket = await Ticket.findByPk(lock.ticket_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!ticket) { await t.rollback(); return res.status(404).json({ message: 'Ticket not found' }); }

    // update ticket status
    ticket.status = 'CONFIRMED';
    await ticket.save({ transaction: t });

    // decrement available seats on schedule and increment booked seats
    const schedule = await Schedule.findByPk(ticket.schedule_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!schedule) { await t.rollback(); return res.status(404).json({ message: 'Schedule not found' }); }
    if (parseInt(schedule.available_seats || 0) <= 0) { await t.rollback(); return res.status(400).json({ message: 'No seats available' }); }
    schedule.available_seats = parseInt(schedule.available_seats) - 1;
    schedule.booked_seats = (parseInt(schedule.booked_seats || 0) + 1);
    await schedule.save({ transaction: t });

    lock.status = 'CONSUMED';
    await lock.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Seat confirmed', ticket_id: ticket.id });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Failed to confirm lock' });
  }
};

const releaseLock = async (req, res) => {
  const { lockId } = req.params;
  const t = await sequelize.transaction();
  try {
    const lock = await SeatLock.findByPk(lockId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!lock) { await t.rollback(); return res.status(404).json({ message: 'Lock not found' }); }
    if (lock.status !== 'ACTIVE') { await t.rollback(); return res.status(400).json({ message: 'Lock not active' }); }

    // expire ticket
    const ticket = await Ticket.findByPk(lock.ticket_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (ticket) {
      ticket.status = 'EXPIRED';
      await ticket.save({ transaction: t });
    }

    lock.status = 'RELEASED';
    await lock.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Lock released' });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Failed to release lock' });
  }
};

// Direct booking: create CONFIRMED ticket and consume any user's active lock atomically
const bookSeat = async (req, res) => {
  const { scheduleId } = req.params;
  // authenticate middleware sets req.userId
  const passenger_id = req.userId || (req.user && req.user.id);
  const { seat_number, price } = req.body;

  if (!seat_number) return res.status(400).json({ message: 'seat_number required' });
  if (!passenger_id) return res.status(401).json({ message: 'Authentication required' });

  const t = await sequelize.transaction({ isolationLevel: 'SERIALIZABLE' });
  try {
    // lock only the schedule row to avoid FOR UPDATE on JOINs (Postgres error)
    const schedule = await Schedule.findByPk(scheduleId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!schedule) { await t.rollback(); return res.status(404).json({ message: 'Schedule not found' }); }

    const now = new Date();
    if (schedule.status !== 'scheduled') { await t.rollback(); return res.status(400).json({ message: 'Schedule not available for booking' }); }
    if (schedule.ticket_status === 'CLOSED') { await t.rollback(); return res.status(400).json({ message: 'Ticket sales closed for this schedule' }); }
    if (schedule.departure_time && new Date(schedule.departure_time) <= now) { await t.rollback(); return res.status(400).json({ message: 'Ticket sales closed for this schedule' }); }

    // check already confirmed ticket
    const existingConfirmed = await Ticket.findOne({ where: { schedule_id: scheduleId, seat_number, status: 'CONFIRMED' }, transaction: t, lock: t.LOCK.UPDATE });
    if (existingConfirmed) { await t.rollback(); return res.status(409).json({ message: 'Seat already booked' }); }

    // check active lock
    const activeLock = await SeatLock.findOne({ where: { schedule_id: scheduleId, seat_number, status: 'ACTIVE', expires_at: { [Op.gt]: now } }, transaction: t, lock: t.LOCK.UPDATE });
    if (activeLock && activeLock.passenger_id !== passenger_id) { await t.rollback(); return res.status(409).json({ message: 'Seat is temporarily locked' }); }

    // create confirmed ticket
    const ticket = await Ticket.create({
      passenger_id,
      schedule_id: scheduleId,
      company_id: schedule.company_id,
      seat_number,
      price: price || 0,
      booking_ref: `BK-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      status: 'CONFIRMED',
      booked_at: new Date(),
    }, { transaction: t });

    // if there was an active lock belonging to this user, consume it and link to ticket
    if (activeLock && activeLock.passenger_id === passenger_id) {
      activeLock.status = 'CONSUMED';
      activeLock.ticket_id = ticket.id;
      await activeLock.save({ transaction: t });
      ticket.lock_id = activeLock.id;
      await ticket.save({ transaction: t });
    }

    // decrement available seats and increment booked
    if (parseInt(schedule.available_seats || 0) <= 0) { await t.rollback(); return res.status(400).json({ message: 'No seats available' }); }
    schedule.available_seats = parseInt(schedule.available_seats) - 1;
    schedule.booked_seats = (parseInt(schedule.booked_seats || 0) + 1);
    await schedule.save({ transaction: t });

    await t.commit();

    // reload ticket with associations for response
    const ticketWithSchedule = await Ticket.findByPk(ticket.id, { include: [{ model: Schedule, include: [Route] }, { model: SeatLock, as: 'lock' }] });

    res.status(201).json({ ticket: ticketWithSchedule });
  } catch (error) {
    await t.rollback();
    console.error('bookSeat error', error);
    const resp = { message: 'Failed to book seat' };
    if (process.env.NODE_ENV !== 'production') {
      resp.error = error && (error.message || String(error));
      resp.stack = error && error.stack;
    }
    res.status(500).json(resp);
  }
};

module.exports = { getSeatsForSchedule, lockSeat, confirmLock, releaseLock, bookSeat };
