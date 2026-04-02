const express = require('express');
const router = express.Router();
const { getScores, addScore, updateScore, deleteScore } = require('../controllers/score.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireSubscription } = require('../middleware/subscription.middleware');

router.use(protect, requireSubscription);
router.get('/', getScores);
router.post('/', addScore);
router.patch('/:id', updateScore);
router.delete('/:id', deleteScore);

module.exports = router;
