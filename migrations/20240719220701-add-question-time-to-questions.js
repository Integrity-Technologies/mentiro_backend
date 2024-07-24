'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding the 'question_time' column to the 'questions' table
    await queryInterface.addColumn('questions', 'question_time', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Time allocated for each question in seconds'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Removing the 'question_time' column from the 'questions' table
    await queryInterface.removeColumn('questions', 'question_time');
  }
};
