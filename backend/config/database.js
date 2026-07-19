// const { Pool } = require('pg');

// // Load env vars if not already loaded
// if (!process.env.DB_HOST) {
//   require('dotenv').config();
// }

// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   database: process.env.DB_NAME || 'leather_goods_db',
//   user: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || '',
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });

// pool.on('error', (err) => {
//   console.error('Unexpected database error:', err);
//   process.exit(-1);
// });

// module.exports = pool;


const { Pool } = require('pg');

// Load env vars
require('dotenv').config();

let pool;

// Agar .env me DATABASE_URL mojood hai (Neon Cloud ke liye)
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Neon cloud ke liye yeh lazmi hai
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Thoda time barha diya taake cloud se connect ho sake
  });
} else {
  // Agar DATABASE_URL nahi hai, to local config chalegi
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'leather_goods_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;