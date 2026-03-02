'use strict';

module.exports = {
  async up(queryInterface) {
    // Drop existing FK constraint and re-add with CASCADE
    await queryInterface.sequelize.query(`
      ALTER TABLE customer_order
      DROP CONSTRAINT IF EXISTS customer_order_product_id_fkey;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE customer_order
      ADD CONSTRAINT customer_order_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE customer_order
      DROP CONSTRAINT IF EXISTS customer_order_product_id_fkey;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE customer_order
      ADD CONSTRAINT customer_order_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES product(product_id);
    `);
  },
};
