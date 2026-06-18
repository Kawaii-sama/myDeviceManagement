const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    // null = public (visible to all), userId = private (only that user sees it)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Notification", notificationSchema)