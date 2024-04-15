const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'mentiro',
  password: 'admin',
  port: 5432, // Default PostgreSQL port
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
