require("dotenv").config();
const { Sequelize } = require("sequelize");

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Create a backend/.env with DATABASE_URL or set the env var.');
}

// Allow disabling SSL for local dev via DB_SSL=false
const useDbSsl = process.env.DB_SSL !== 'false';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: useDbSsl
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
    logging: process.env.SEQ_LOGGING === 'true' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

module.exports = sequelize;