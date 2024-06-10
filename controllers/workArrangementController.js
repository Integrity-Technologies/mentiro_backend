// Work Arrangement controller
const { client } = require('../db/index.js');
const { saveWorkArrangement } = require('../models/workArrangement');

const saveWorkArrangementFunction = async (req, res) => {
  const { name } = req.body;
  try {
    const workArrangement = await saveWorkArrangement(name);
    res.status(201).json(workArrangement);
  } catch (error) {
    console.error("Error saving work arrangement:", error.message);
    res.status(500).json({ error: "Error saving work arrangement" });
  }
};

const getAllWorkArrangements = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM work_arrangements');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching work arrangements:", error.message);
    res.status(500).json({ error: "Error fetching work arrangements" });
  }
};

module.exports = { saveWorkArrangementFunction, getAllWorkArrangements };
