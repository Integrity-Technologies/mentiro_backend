// controllers/companySizeController.js
const { client } = require('../db/index.js');
const { createCompanySizeTable, saveCompanySize } = require('../models/companySize');

const saveCompanySizeValues = async (req, res) => {
  const { sizeRange } = req.body;
  try {
    const companySize = await saveCompanySize(sizeRange);
    res.status(201).json(companySize);
  } catch (error) {
    console.error("Error saving company size:", error.message);
    res.status(500).json({ error: "Error saving company size" });
  }
};

const getAllCompanySizes = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM company_size');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching company sizes:", error.message);
    res.status(500).json({ error: "Error fetching company sizes" });
  }
};

module.exports = { saveCompanySizeValues, getAllCompanySizes };
