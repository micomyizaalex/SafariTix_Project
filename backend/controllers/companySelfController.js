const { Company, Bus, Schedule, Ticket, User } = require('../models');

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

module.exports = {
  getCompany,
  getBuses,
  getSchedules,
  getTickets
};
