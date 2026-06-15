const Request = require("../models/requestModel")
const Device = require("../models/deviceModel")
const Notification = require("../models/notificationModel")

// CREATE REQUEST (works for any device status — waitlist support)
const createRequest = async (req, res) => {
  try {
    const device = await Device.findById(req.body.deviceId)

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      })
    }

    // Prevent duplicate request from same employee for same device
    const existingRequest = await Request.findOne({
      deviceId: device._id,
      employeeId: req.user._id,
      status: "pending",
    })

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request for this device",
      })
    }

    // If device is available, mark it pending
    // If already pending/assigned, just queue the request — don't change device status
    if (device.status === "available") {
      device.status = "pending"
      await device.save()
    }

    const request = await Request.create({
      deviceId: device._id,
      deviceModel: device.model,
      employeeId: req.user._id,
      employeeName: req.user.name,
    })

    // NO notification on request creation — only on approve and return

    res.status(201).json(request)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET ALL REQUESTS (admin only)
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 })
    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET MY REQUESTS (logged-in employee only)
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      employeeId: req.user._id,
    }).sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// APPROVE REQUEST
const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer pending" })
    }

    const device = await Device.findById(request.deviceId)

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Approve this request
    request.status = "approved"
    await request.save()

    // Assign device to this employee
    device.status = "assigned"
    device.assignedTo = request.employeeId
    device.assignedToName = request.employeeName
    await device.save()

   

    // Broadcast notification
    await Notification.create({
      message: `${device.model} has been assigned to ${request.employeeName}`,
    })

    res.json({
      message: "Request approved and device assigned",
      request,
      device,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// REJECT REQUEST (admin manually rejects one)
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    request.status = "rejected"
    await request.save()

    // If no more pending requests for this device, make it available again
    const remainingPending = await Request.findOne({
      deviceId: request.deviceId,
      status: "pending",
    })

    if (!remainingPending) {
      await Device.findByIdAndUpdate(request.deviceId, {
        status: "available",
      })
    }

    res.json(request)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createRequest,
  getRequests,
  getMyRequests,
  approveRequest,
  rejectRequest,
}
