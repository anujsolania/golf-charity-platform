const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateUser, deleteUser, getUserScores, getReports } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/scores', getUserScores);
router.get('/reports', getReports);

module.exports = router;
