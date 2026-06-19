const Notification = require("../models/notificationModel")

const getNotifications = async (req, res) => {
  try {
    // Delete all notifications older than today
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    await Notification.deleteMany({
      createdAt: { $lt: startOfToday },
    })

    // Return today's notifications for this user
    // (public ones with no userId + their own private ones)
    const notifications = await Notification.find({
      createdAt: { $gte: startOfToday },
      $or: [
        { userId: null },
        { userId: { $exists: false } },
        { userId: req.user._id },
      ],
    }).sort({ createdAt: -1 })

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getNotifications }