'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('@admin2000', 10);

    // Insert into register table
    await queryInterface.bulkInsert('register', [{
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      email: null,
      first_name: null,
      last_name: null,
      phone: null,
      age: null,
      birth_date: null,
    }]);

    // Get the inserted register id
    const [results] = await queryInterface.sequelize.query(
      "SELECT id FROM register WHERE username = 'admin' AND role = 'admin' ORDER BY id DESC LIMIT 1"
    );
    const regId = results[0].id;

    // Insert into login table
    await queryInterface.bulkInsert('login', [{
      reg_id: regId,
      username: 'admin',
      password: hashedPassword,
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('login', { username: 'admin' });
    await queryInterface.bulkDelete('register', { username: 'admin', role: 'admin' });
  }
};
