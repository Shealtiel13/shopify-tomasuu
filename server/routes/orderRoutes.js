const router = require('express').Router();
const controller = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.getAll);
router.get('/my', auth, controller.getMyOrders);
router.patch('/my/:id/confirm', auth, controller.confirmReceived);
router.get('/:id', auth, controller.getById);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.patch('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);

module.exports = router;