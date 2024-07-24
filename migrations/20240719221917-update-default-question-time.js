'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('questions', 'question_time', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Time allocated for each question in minutes'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('questions', 'question_time', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Time allocated for each question in minutes'
    });
  }
};
