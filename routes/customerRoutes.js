const router = require('express').Router();
const controller = require('../controllers/customerController');
const admin = require('../middleware/admin');

router.get('/', admin, controller.getAll);
router.get('/:id', admin, controller.getById);
router.post('/', admin, controller.create);
router.put('/:id', admin, controller.update);
router.patch('/:id', admin, controller.update);
router.delete('/:id', admin, controller.delete);


module.exports = router;