const { client } = require('../db/index.js');
const { saveJobRole } = require('../models/jobRole');

const saveJobRoleFunction = async (req, res) => {
  const { name } = req.body;
  try {
    const jobRole = await saveJobRole(name);
    res.status(201).json(jobRole);
  } catch (error) {
    console.error("Error saving job role:", error.message);
    res.status(500).json({ error: "Error saving job role" });
  }
};

const getAllJobRoles = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM job_roles');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching job roles:", error.message);
    res.status(500).json({ error: "Error fetching job roles" });
  }
};

module.exports = { saveJobRoleFunction, getAllJobRoles };
