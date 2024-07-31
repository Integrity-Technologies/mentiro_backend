const { client } = require("../db/index.js");
const { createAssessmentsTableQuery } = require("../models/assessment.js");
const { createCompaniesTableQuery } = require("../models/company.js");
const { createCompanySizeTableQuery } = require("../models/companySize.js");
const { createJobTitlesTableQuery } = require("../models/jobTitle.js");
const { createAnswersTableQuery } = require("../models/answer.js");
const { createCandidatesTableQuery } = require("../models/candidate.js");
const { createCategoryTableQuery } = require("../models/category.js");
const { createJobLocationsTableQuery } = require("../models/jobLocation.js");
const { createJobRolesTableQuery } = require("../models/jobRole.js");
const { createQuestionTableQuery } = require("../models/question.js");
const { createResultsTableQuery } = require("../models/result.js");
const { createTestsTableQuery } = require("../models/test.js");
const { createUsersTableQuery } = require("../models/user.js");
const { createWorkArrangementsTableQuery } = require("../models/workArrangement.js");

const {createAssessment_attemptsTableQuery} = require("../models/assessment_attempts.js");

const initializeTables = async () => {
  try {
    const tableQueries = [
      createAssessmentsTableQuery,
      createCompaniesTableQuery,
      createCompanySizeTableQuery,
      createJobTitlesTableQuery,
      createAnswersTableQuery,
      createCandidatesTableQuery,
      createCategoryTableQuery,
      createJobLocationsTableQuery,
      createJobRolesTableQuery,
      createQuestionTableQuery,
      createResultsTableQuery,
      createTestsTableQuery,
      createUsersTableQuery,
      createWorkArrangementsTableQuery,
      createAssessment_attemptsTableQuery
    ];

    for (const query of tableQueries) {
      // console.log("Executing query:", query);
      await client.query(query);
    }

    console.log("All tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

module.exports = { initializeTables };
