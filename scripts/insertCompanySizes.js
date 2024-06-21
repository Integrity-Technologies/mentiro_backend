// scripts/insertCompanySizes.js
const { client } = require('../db/index.js');
const { createCompanySizeTable, saveCompanySize } = require('../models/companySize');

const predefinedSizes = [
  '1-15 employees',
  '16-30 employees',
  '31-50 employees',
  '51-100 employees',
  '101-200 employees',
  '201-300 employees',
  '301-400 employees',
  '401-500 employees',
  '501-750 employees',
  '751-1000 employees',
  '1000+ employees'
];

const insertPredefinedCompanySizes = async () => {
  try {
    await createCompanySizeTable();

    for (const size of predefinedSizes) {
      await saveCompanySize(size);
    }
    
    console.log("Predefined company sizes inserted successfully");
  } catch (error) {
    console.error("Error inserting predefined company sizes:", error);
  } finally {
    client.end(); // Close the database connection
  }
};

insertPredefinedCompanySizes();
