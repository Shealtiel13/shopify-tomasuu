const router = require('express').Router();
const controller = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Users can only view products
router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);

// Only admins can create, update, delete products
router.post('/', admin, controller.create);
router.put('/:id', admin, controller.update);
router.patch('/:id', admin, controller.update);
router.delete('/:id', admin, controller.delete);

module.exports = router;
