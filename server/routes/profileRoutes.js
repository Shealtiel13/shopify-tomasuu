const router = require('express').Router();
const auth = require('../middleware/auth');
const profile = require('../controllers/profileController');

router.get('/', auth, profile.getProfile);
router.patch('/', auth, profile.updateProfile);
router.patch('/address', auth, profile.updateAddress);
router.patch('/password', auth, profile.changePassword);

module.exports = router;
