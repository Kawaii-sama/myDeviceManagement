const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
{
  type: String,
  message: String
},
{
  timestamps: true
})

module.exports = mongoose.model(
  "Notification",
  notificationSchema
)