require("dotenv").config();
const { Pool } = require("pg");

/**
 * PostgreSQL connection pool for direct database queries
 * Uses Neon-hosted PostgreSQL database via DATABASE_URL
 */

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your .env file or environment variables.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? {
    rejectUnauthorized: false, // Required for Neon PostgreSQL
  } : undefined,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Increased timeout for initial connection
});

// Handle pool errors
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  // Don't exit process on pool errors, just log them
  // process.exit(-1);
});

module.exports = pool;

