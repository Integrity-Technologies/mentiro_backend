// scripts/insertWorkArrangement.js
const { client } = require('../db/index.js');
const { createWorkArrangementsTable,saveWorkArrangement } = require('../models/workArrangement.js');

const predefinedTitles = [
  'Online',
'Remote',
'Hybrid'
];

const insertPredefinedWorkArrangement = async () => {
  try {
    await createWorkArrangementsTable();

    for (const title of predefinedTitles) {
      await saveWorkArrangement(title);
    }
    
    console.log("Predefined job titles inserted successfully");
  } catch (error) {
    console.error("Error inserting predefined job titles:", error);
  } finally {
    client.end(); // Close the database connection
  }
};

insertPredefinedWorkArrangement();
