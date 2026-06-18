const Notification = require("../models/notificationModel")

// GET notifications for current user:
// Returns public notifications (userId: null) + their own private ones
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { userId: null },
        { userId: req.user._id },
      ],
    }).sort({ createdAt: -1 })

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getNotifications }