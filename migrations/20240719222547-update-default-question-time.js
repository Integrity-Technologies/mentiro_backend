'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the default value of the 'question_time' column to 1
    await queryInterface.sequelize.query(`
      ALTER TABLE questions ALTER COLUMN question_time SET DEFAULT 1;
    `);

    // Update existing rows where question_time is 0
    await queryInterface.sequelize.query(`
      UPDATE questions
      SET question_time = 1
      WHERE question_time = 0;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the default value of the 'question_time' column to 0
    await queryInterface.sequelize.query(`
      ALTER TABLE questions ALTER COLUMN question_time SET DEFAULT 0;
    `);

    // Optionally revert the updated rows back to 0
    // Comment this section if you don't want to revert the values in existing rows
    await queryInterface.sequelize.query(`
      UPDATE questions
      SET question_time = 0
      WHERE question_time = 1;
    `);
  }
};
