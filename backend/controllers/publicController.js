const { Schedule, Route, Bus, Company, Driver } = require('../models');

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
        where: {}
      }
    ];

    // Add route filtering if provided
    if (from || to) {
      if (from) {
        includeOptions[0].where.origin = {
          [require('sequelize').Op.iLike]: `%${from}%`
        };
      }
      if (to) {
        includeOptions[0].where.destination = {
          [require('sequelize').Op.iLike]: `%${to}%`
        };
      }
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
    res.status(400).json({ error: error.message });
  }
};

// Search schedules by route
const searchSchedules = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'From and to locations are required' });
    }

    const schedules = await Schedule.findAll({
      where: {
        status: 'scheduled',
        available_seats: {
          [require('sequelize').Op.gt]: 0
        }
      },
      include: [
        {
          model: Route,
          attributes: ['id', 'origin', 'destination'],
          where: {
            origin: {
              [require('sequelize').Op.iLike]: `%${from}%`
            },
            destination: {
              [require('sequelize').Op.iLike]: `%${to}%`
            }
          }
        },
        {
          model: Bus,
          attributes: ['id', 'plate_number', 'company_id', 'driver_id'],
          include: [
            {
              model: Company,
              attributes: ['id', 'name']
            },
            {
              model: Driver,
              attributes: ['id', 'name']
            }
          ]
        }
      ],
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
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAvailableSchedules,
  searchSchedules
};
