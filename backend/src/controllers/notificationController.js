const Notification = require('../models/Notification');

// @desc    Get all notifications for the authenticated user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit, page } = req.query;

    const query = { user: req.user._id };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    const pageSize = parseInt(limit, 10) || 20;
    const pageNum = parseInt(page, 10) || 1;
    const skip = (pageNum - 1) * pageSize;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this notification' });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead
};
