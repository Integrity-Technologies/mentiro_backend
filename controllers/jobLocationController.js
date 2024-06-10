// job location controller
const { client } = require('../db/index.js');
const { saveJobLocation } = require('../models/jobLocation');

const saveJobLocationFunction = async (req, res) => {
  const { name } = req.body;
  try {
    const jobLocation = await saveJobLocation(name);
    res.status(201).json(jobLocation);
  } catch (error) {
    console.error("Error saving job location:", error.message);
    res.status(500).json({ error: "Error saving job location" });
  }
};

const getAllJobLocations = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM job_locations');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching job locations:", error.message);
    res.status(500).json({ error: "Error fetching job locations" });
  }
};

module.exports = { saveJobLocationFunction, getAllJobLocations };
