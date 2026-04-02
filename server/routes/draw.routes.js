const express = require('express');
const router = express.Router();
const { getDraws, getUpcomingDraw, getDrawById, getMyEntry, getMyHistory, simulateDraw, publishDraw } = require('../controllers/draw.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { requireSubscription } = require('../middleware/subscription.middleware');

router.get('/upcoming', getUpcomingDraw);
router.get('/', getDraws);
router.get('/my-history', protect, requireSubscription, getMyHistory);
router.get('/:id', getDrawById);
router.get('/:id/my-entry', protect, getMyEntry);
router.post('/simulate', protect, adminOnly, simulateDraw);
router.post('/publish', protect, adminOnly, publishDraw);

module.exports = router;
