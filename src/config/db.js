const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 54320),
  database: process.env.PGDATABASE || "postgres",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
