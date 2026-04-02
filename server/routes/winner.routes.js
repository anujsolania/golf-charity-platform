const express = require('express');
const router = express.Router();
const { submitProof, getMyVerifications, getAllVerifications, reviewVerification, markPaid } = require('../controllers/winner.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { upload } = require('../config/cloudinary');

router.post('/submit-proof', protect, upload.single('proof'), submitProof);
router.get('/my', protect, getMyVerifications);
router.get('/', protect, adminOnly, getAllVerifications);
router.patch('/:id/review', protect, adminOnly, reviewVerification);
router.patch('/:id/paid', protect, adminOnly, markPaid);

module.exports = router;
