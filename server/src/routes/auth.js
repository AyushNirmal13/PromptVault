const express = require('express');
const router = express.Router();
const { googleAuth, getMe, addCustomCategory, removeCategory } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.post('/categories', protect, addCustomCategory);
router.delete('/categories/:value', protect, removeCategory);

module.exports = router;
