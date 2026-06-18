const mongoose = require("mongoose")

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["assignment", "transfer"],
      default: "assignment",
    },

    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    deviceModel: {
      type: String,
      required: true,
    },

    // Who is making the request
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employeeName: {
      type: String,
      required: true,
    },

    // For transfer requests — who is receiving the device
    toEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    toEmployeeName: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Request", requestSchema)