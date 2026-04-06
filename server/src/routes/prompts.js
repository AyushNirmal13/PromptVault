const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPrompts,
  searchPrompts,
  getPublicPrompt,
  exportPrompts,
  importPrompts,
  getVersionHistory,
  createPrompt,
  updatePrompt,
  deletePrompt,
  toggleFavorite,
  incrementUsage,
} = require('../controllers/promptController');

// Public routes
router.get('/share/:shareId', getPublicPrompt);

// Protected routes
router.use(protect);

router.get('/', getPrompts);
router.get('/search', searchPrompts);
router.get('/export', exportPrompts);
router.post('/import', importPrompts);
router.post('/', createPrompt);
router.put('/:id', updatePrompt);
router.delete('/:id', deletePrompt);
router.put('/:id/favorite', toggleFavorite);
router.put('/:id/use', incrementUsage);
router.get('/:id/history', getVersionHistory);

module.exports = router;
