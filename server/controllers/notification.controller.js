const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  res.json({ success: true, notifications, unreadCount });
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
};

module.exports = { getNotifications, markRead, markAllRead };
