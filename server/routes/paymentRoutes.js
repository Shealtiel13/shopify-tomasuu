const router = require('express').Router();
const controller = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (req, file, cb) => cb(null, 'gcash-' + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/', admin, controller.getAll);
router.get('/:orderId', auth, controller.getByOrder);
router.post('/:orderId/proof', auth, upload.single('proof'), controller.uploadProof);
router.patch('/:orderId/verify', admin, controller.verify);

module.exports = router;
