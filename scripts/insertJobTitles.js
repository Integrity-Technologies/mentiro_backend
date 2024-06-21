// scripts/insertJobTitles.js
const { client } = require('../db/index.js');
const { createJobTitlesTable, saveJobTitle } = require('../models/jobTitle');

const predefinedTitles = [
  'Recruiter',
  'Talent acquisition specialist',
  'Human resources manager',
  'Hiring Manager',
  'Executive/C-Suite',
  'Business Owner',
  'Other'
];

const insertPredefinedJobTitles = async () => {
  try {
    await createJobTitlesTable();

    for (const title of predefinedTitles) {
      await saveJobTitle(title);
    }
    
    console.log("Predefined job titles inserted successfully");
  } catch (error) {
    console.error("Error inserting predefined job titles:", error);
  } finally {
    client.end(); // Close the database connection
  }
};

insertPredefinedJobTitles();
