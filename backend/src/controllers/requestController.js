const Request = require("../models/requestModel")
const Device = require("../models/deviceModel")
const Notification = require("../models/notificationModel")
const User = require("../models/userModel")

// ─── ASSIGNMENT REQUEST (employee → admin approves) ───────────────
const createRequest = async (req, res) => {
  try {
    const device = await Device.findById(req.body.deviceId)

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Block duplicate pending assignment request from same employee
    const existingRequest = await Request.findOne({
      deviceId: device._id,
      employeeId: req.user._id,
      status: "pending",
      type: "assignment",
    })

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request for this device",
      })
    }

    // Only change device status if it was available
    if (device.status === "available") {
      device.status = "pending"
      await device.save()
    }

    const request = await Request.create({
      type: "assignment",
      deviceId: device._id,
      deviceModel: device.model,
      employeeId: req.user._id,
      employeeName: req.user.name,
    })

    res.status(201).json(request)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── TRANSFER REQUEST (Employee A → Employee B accepts) ───────────
const createTransferRequest = async (req, res) => {
  try {
    const { deviceId, toEmployeeId } = req.body

    const device = await Device.findById(deviceId)

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Only the person who has the device can transfer it
    if (device.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only transfer a device assigned to you",
      })
    }

    const toEmployee = await User.findById(toEmployeeId)

    if (!toEmployee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    // Block duplicate pending transfer for same device
    const existingTransfer = await Request.findOne({
      deviceId: device._id,
      status: "pending",
      type: "transfer",
    })

    if (existingTransfer) {
      return res.status(400).json({
        message: "A transfer request for this device is already pending",
      })
    }

    const request = await Request.create({
      type: "transfer",
      deviceId: device._id,
      deviceModel: device.model,
      employeeId: req.user._id,
      employeeName: req.user.name,
      toEmployeeId: toEmployee._id,
      toEmployeeName: toEmployee.name,
    })

    // Private notification to the receiving employee
    await Notification.create({
      message: `${req.user.name} wants to transfer ${device.model} to you`,
      userId: toEmployee._id,
    })

    res.status(201).json(request)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── ACCEPT TRANSFER (Employee B accepts) ────────────────────────
const acceptTransfer = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)

    if (!request || request.type !== "transfer") {
      return res.status(404).json({ message: "Transfer request not found" })
    }

    // Only the intended recipient can accept
    if (request.toEmployeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the intended recipient can accept this transfer",
      })
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer pending" })
    }

    const device = await Device.findById(request.deviceId)

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    // Transfer the device
    device.assignedTo = request.toEmployeeId
    device.assignedToName = request.toEmployeeName
    device.status = "assigned"
    await device.save()

    request.status = "approved"
    await request.save()

    // Private notification to the person who initiated the transfer
    await Notification.create({
      message: `${request.toEmployeeName} accepted your transfer of ${device.model}`,
      userId: request.employeeId,
    })

    res.json({ message: "Transfer accepted", request, device })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── DECLINE TRANSFER (Employee B declines) ──────────────────────
const declineTransfer = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)

    if (!request || request.type !== "transfer") {
      return res.status(404).json({ message: "Transfer request not found" })
    }

    if (request.toEmployeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the intended recipient can decline this transfer",
      })
    }

    request.status = "rejected"
    await request.save()

    // Private notification back to sender
    await Notification.create({
      message: `${request.toEmployeeName} declined your transfer of ${request.deviceModel}`,
      userId: request.employeeId,
    })

    res.json({ message: "Transfer declined", request })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── GET ALL REQUESTS (admin only) ───────────────────────────────
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ type: "assignment" })
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── GET MY REQUESTS (logged-in employee) ────────────────────────
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

// ─── GET INCOMING TRANSFERS (requests where I am the recipient) ───
const getIncomingTransfers = async (req, res) => {
  try {
    const requests = await Request.find({
      toEmployeeId: req.user._id,
      type: "transfer",
      status: "pending",
    }).sort({ createdAt: -1 })
    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── APPROVE ASSIGNMENT REQUEST (admin only) ──────────────────────
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

    request.status = "approved"
    await request.save()

    device.status = "assigned"
    device.assignedTo = request.employeeId
    device.assignedToName = request.employeeName
    await device.save()

    // Private notification — only the assigned employee sees this
    await Notification.create({
      message: `${device.model} has been assigned to you`,
      userId: request.employeeId,
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

// ─── REJECT ASSIGNMENT REQUEST (admin only) ───────────────────────
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
      type: "assignment",
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
  createTransferRequest,
  acceptTransfer,
  declineTransfer,
  getRequests,
  getMyRequests,
  getIncomingTransfers,
  approveRequest,
  rejectRequest,
}