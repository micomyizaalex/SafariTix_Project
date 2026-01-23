const { Company, Bus, Ticket } = require('../models');
const { Sequelize } = require('sequelize');

// Return admin dashboard stats
const getStats = async (req, res) => {
  try {
    const totalCompanies = await Company.count();
    const activeCompanies = await Company.count({ where: { status: 'approved' } });
    const totalBuses = await Bus.count();
    const totalTickets = await Ticket.count();

    const revenueResult = await Ticket.findAll({
      attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('price')), 0), 'total']]
    });
    const totalRevenue = parseFloat(revenueResult[0].get('total')) || 0;

    res.json({
      totalCompanies,
      activeCompanies,
      totalBuses,
      totalTickets,
      totalRevenue
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Return companies list (optionally filter pending)
const getCompanies = async (req, res) => {
  try {
    const { filter } = req.query; // e.g., 'pending'
    const where = {};
    if (filter === 'pending') where.status = 'pending';

    const companies = await Company.findAll({ where });

    // Map fields to frontend expected shapes (camelCase)
    const mapped = companies.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      subscriptionStatus: c.subscription_status || c.subscriptionStatus || 'inactive',
      ownerId: c.owner_id
    }));

    res.json({ companies: mapped });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getStats,
  getCompanies
};
