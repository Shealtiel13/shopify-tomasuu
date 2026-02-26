const router = require('express').Router();
const controller = require('../controllers/loginController');
const admin = require('../middleware/admin');

router.post('/authenticate', controller.authenticate);
router.get('/', admin, controller.getAll);
router.patch('/:id', admin, controller.update);
router.delete('/:id', admin, controller.delete);

module.exports = router;
