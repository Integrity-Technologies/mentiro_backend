const { client } = require("../db/index.js");
const { createAssessmentsTable } = require("../models/assessment.js");
const { createCompanyTable } = require("../models/company.js");
const { createCompanySizeTable } = require("../models/companySize.js");
const { createJobTitlesTable } = require("../models/jobTitle.js");
const { createAnswersTable } = require("../models/answer.js");
const { createCandidateTable } = require("../models/candidate.js");
const { createCategoryTable } = require("../models/category.js");
const { createJobLocationsTable } = require("../models/jobLocation.js");
const { createJobRolesTable } = require("../models/jobRole.js");
const { createQuestionTable } = require("../models/question.js");
const { createResultsTable } = require("../models/result.js");
const { createTestsTable } = require("../models/test.js");
const { createUserTable } = require("../models/user.js");
const { createWorkArrangementsTable } = require("../models/workArrangement.js");

const initializeTables = async () => {
  try {
    await client.query(createAssessmentsTable);
    await client.query(createCompanyTable);
    await client.query(createCompanySizeTable);
    await client.query(createJobTitlesTable);
    await client.query(createAnswersTable);
    await client.query(createCandidateTable);
    await client.query(createCategoryTable);
    await client.query(createJobLocationsTable);
    await client.query(createJobRolesTable);
    await client.query(createQuestionTable);
    await client.query(createResultsTable);
    await client.query(createTestsTable);
    await client.query(createUserTable);
    await client.query(createWorkArrangementsTable);
    console.log("All tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

module.exports = { initializeTables };
