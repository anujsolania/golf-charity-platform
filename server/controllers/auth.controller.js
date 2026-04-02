const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { sendEmail, welcomeEmail } = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register
const register = async (req, res) => {
  const { fullName, email, password, country, phone } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
  const user = await User.create({ fullName, email, password, country, phone });
  // Send welcome email (non-blocking)
  sendEmail(welcomeEmail(user)).catch(console.error);
  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const token = generateToken(user._id);
  res.json({ success: true, token, user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, avatarUrl: user.avatarUrl } });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  const subscription = await Subscription.findOne({ userId: req.user._id }).populate('charityId');
  res.json({ success: true, user, subscription });
};

// PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  const { fullName, country, phone, avatarUrl } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { fullName, country, phone, avatarUrl }, { new: true, runValidators: true });
  res.json({ success: true, user });
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};

module.exports = { register, login, getMe, updateProfile, changePassword };
