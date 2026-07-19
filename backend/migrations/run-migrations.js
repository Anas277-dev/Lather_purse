const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
require('dotenv').config();

async function runMigrations() {
  try {
    const migrationFile = path.join(__dirname, '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('Running migrations...');
    await pool.query(sql);
    console.log('✅ Migrations completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
