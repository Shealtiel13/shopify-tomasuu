const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'images', 'products'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Users can only view products
router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);

// Only admins can create, update, delete products
router.post('/', admin, upload.single('image'), controller.create);
router.put('/:id', admin, upload.single('image'), controller.update);
router.patch('/:id', admin, upload.single('image'), controller.update);
router.delete('/:id', admin, controller.delete);

module.exports = router;
