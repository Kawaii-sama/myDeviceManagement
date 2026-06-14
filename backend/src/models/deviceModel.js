const mongoose = require("mongoose")

const deviceSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },

    deviceId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: [
        "available",
        "pending",
        "assigned",
      ],
      default: "available",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedToName: {
      type: String,
      default: "",
    },

    engineerName: {
      type: String,
      default: "",
    },

    pcNumber: {
      type: String,
      default: "",
    },

    floorNumber: {
      type: String,
      default: "",
    },

    expectedReturnTime: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model(
  "Device",
  deviceSchema
)