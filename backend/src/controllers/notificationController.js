const Notification = require(
  "../models/notificationModel"
)

const getNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await Notification.find()
        .sort({ createdAt: -1 })

    res.json(notifications)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  getNotifications,
}