'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customer_order', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'Pending',
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('customer_order', 'status');
  },
};
