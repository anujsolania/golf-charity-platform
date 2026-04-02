const express = require('express');
const router = express.Router();
const { getMySubscription, createSubscription, cancelSubscription, updateCharity, getPlans } = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/plans', getPlans);
router.get('/my', protect, getMySubscription);
router.post('/create', protect, createSubscription);
router.post('/cancel', protect, cancelSubscription);
router.patch('/charity', protect, updateCharity);

module.exports = router;
