// controllers/jobTitleController.js
const { client } = require('../db/index.js');
const { createJobTitlesTable, saveJobTitle } = require('../models/jobTitle');

const saveJobTitleValues = async (req, res) => {
  const { title } = req.body;
  try {
    const jobTitle = await saveJobTitle(title);
    res.status(201).json(jobTitle);
  } catch (error) {
    console.error("Error saving job title:", error.message);
    res.status(500).json({ error: "Error saving job title" });
  }
};

const getAllJobTitles = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM job_titles');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching job titles:", error.message);
    res.status(500).json({ error: "Error fetching job titles" });
  }
};

module.exports = { saveJobTitleValues, getAllJobTitles };
