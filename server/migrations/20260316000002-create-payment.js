'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment', {
      payment_id: {
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
      method: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'cod',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      reference_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      proof_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addColumn('customer_order', 'payment_method', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'cod',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('customer_order', 'payment_method');
    await queryInterface.dropTable('payment');
  },
};
