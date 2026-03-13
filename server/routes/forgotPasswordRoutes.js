const express = require('express');
const router = express.Router();
const controller = require('../controllers/forgotPasswordController');

router.post('/', controller.sendCode);
router.post('/verify', controller.verifyCode);
router.post('/reset', controller.resetPassword);

module.exports = router;
