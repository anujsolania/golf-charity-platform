const express = require('express');
const router = express.Router();
const { getCharities, getFeatured, getCharityBySlug, createCharity, updateCharity, deleteCharity, donate, getStats } = require('../controllers/charity.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.get('/stats', getStats);
router.get('/featured', getFeatured);
router.get('/', getCharities);
router.get('/:slug', getCharityBySlug);
router.post('/donate', protect, donate);
router.post('/', protect, adminOnly, createCharity);
router.patch('/:id', protect, adminOnly, updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);

module.exports = router;
