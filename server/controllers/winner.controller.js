const WinnerVerification = require('../models/WinnerVerification');
const DrawEntry = require('../models/DrawEntry');
const Notification = require('../models/Notification');

// POST /api/winners/submit-proof
const submitProof = async (req, res) => {
  const { drawId, drawEntryId, prizeAmount, tier } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: 'Proof image is required' });
  // Check no existing pending verification
  const existing = await WinnerVerification.findOne({ userId: req.user._id, drawId });
  if (existing) return res.status(400).json({ success: false, message: 'Proof already submitted for this draw' });
  const verification = await WinnerVerification.create({
    userId: req.user._id, drawId, drawEntryId,
    proofUrl: req.file.path, prizeAmount, tier,
  });
  res.status(201).json({ success: true, verification });
};

// GET /api/winners/my
const getMyVerifications = async (req, res) => {
  const verifications = await WinnerVerification.find({ userId: req.user._id }).populate('drawId').sort({ createdAt: -1 });
  res.json({ success: true, verifications });
};

// GET /api/winners (Admin)
const getAllVerifications = async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const verifications = await WinnerVerification.find(query)
    .populate('userId', 'fullName email')
    .populate('drawId', 'drawMonth winningNumbers')
    .sort({ submittedAt: -1 });
  res.json({ success: true, verifications });
};

// PATCH /api/winners/:id/review (Admin)
const reviewVerification = async (req, res) => {
  const { status, adminNotes } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
  const verification = await WinnerVerification.findByIdAndUpdate(
    req.params.id,
    { status, adminNotes, reviewedAt: new Date() },
    { new: true }
  ).populate('userId', 'fullName email');
  if (!verification) return res.status(404).json({ success: false, message: 'Verification not found' });
  await Notification.create({
    userId: verification.userId._id, type: 'winner',
    title: `Prize ${status === 'approved' ? 'Approved! 🎉' : 'Rejected'}`,
    body: status === 'approved' ? `Your prize claim has been approved! Payment will be processed shortly.` : `Your claim was rejected. Reason: ${adminNotes}`,
  });
  res.json({ success: true, verification });
};

// PATCH /api/winners/:id/paid (Admin)
const markPaid = async (req, res) => {
  const verification = await WinnerVerification.findByIdAndUpdate(
    req.params.id, { status: 'paid', paidAt: new Date() }, { new: true }
  ).populate('userId', 'fullName email');
  if (!verification) return res.status(404).json({ success: false, message: 'Verification not found' });
  await Notification.create({ userId: verification.userId._id, type: 'winner', title: '💰 Prize Paid!', body: `Your prize of $${verification.prizeAmount} has been paid!` });
  res.json({ success: true, verification });
};

module.exports = { submitProof, getMyVerifications, getAllVerifications, reviewVerification, markPaid };
