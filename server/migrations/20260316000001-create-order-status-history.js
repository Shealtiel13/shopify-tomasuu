'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_status_history', {
      history_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'customer_order', key: 'order_id' },
        onDelete: 'CASCADE',
      },
      from_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      to_status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      changed_by: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_status_history');
  },
};
