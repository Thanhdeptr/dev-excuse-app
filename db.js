const { Pool } = require('pg');

// Load environment variables from .env file
require('dotenv').config();

// Create connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    // Connection pool settings
    max: 20,                          // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,         // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000,    // Return an error after 5 seconds if connection could not be established
});

// Test connection on startup
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    // Don't exit process, let the pool handle reconnection
});

// Test database connection
async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connection test successful:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        return false;
    }
}

// Export pool and test function
module.exports = {
    pool,
    testConnection
};

