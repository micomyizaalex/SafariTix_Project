const sequelize = require('./config/database');
const models = require('./models');

const syncDatabase = async () => {
  try {
    console.log('Authenticating database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    console.log('Syncing database schema...');
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized');
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to sync database:', error.message);
    process.exit(1);
  }
};

syncDatabase();
