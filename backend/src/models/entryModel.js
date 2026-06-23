const mongoose = require("mongoose")

const entrySchema = new mongoose.Schema(
  {
    application: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Which admin created this entry
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Entry", entrySchema)