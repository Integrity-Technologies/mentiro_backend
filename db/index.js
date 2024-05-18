const { Client } = require('pg');
const dotenv = require('dotenv');

// Load environment variables from the config file
dotenv.config({ path: './config/config.env' });

const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT, // Default PostgreSQL port
});

async function connect() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  }
}

connect();

module.exports = { client };
