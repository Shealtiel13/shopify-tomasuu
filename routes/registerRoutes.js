const router = require('express').Router();
const controller = require('../controllers/registerController');

router.post('/', controller.create);

module.exports = router;
