const router = require('express').Router();
const controller = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.getCart);
router.post('/items', auth, controller.addItem);
router.patch('/items/:id', auth, controller.updateItem);
router.delete('/items/:id', auth, controller.removeItem);
router.delete('/clear', auth, controller.clearCart);
router.post('/checkout', auth, controller.checkout);

module.exports = router;
