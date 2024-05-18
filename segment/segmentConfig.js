// segmentConfig.js

const { Analytics } = require('@segment/analytics-node');
const dotenv = require('dotenv');

// Load environment variables from the config file
dotenv.config({ path: './config/config.env' });

const analytics = new Analytics({
  // writeKey: "Fc746gEKNf9xtgCO3ErDhjvNzX4jkblg"
  writeKey: process.env.SEGMENT_WRITE_KEY
});

module.exports = analytics;