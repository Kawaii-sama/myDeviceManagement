const Request = require("../models/requestModel")
const Device = require("../models/deviceModel")

// CREATE REQUEST
const createRequest = async (req, res) => {
  try {
    const device = await Device.findById(
      req.body.deviceId
    )

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      })
    }

    const request = await Request.create({
      deviceId: device._id,
      deviceModel: device.model,
      employeeId: req.user._id,
      employeeName: req.user.name,
    })

    res.status(201).json(request)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// GET ALL REQUESTS
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// APPROVE REQUEST
const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(
      req.params.id
    )

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      })
    }

    const device = await Device.findById(
      request.deviceId
    )

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      })
    }

    request.status = "approved"

    device.status = "in-use"
    device.engineerName =
      request.employeeName

    await request.save()
    await device.save()

    res.json({
      message: "Request approved and device assigned",
      request,
      device,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// REJECT REQUEST
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(
      req.params.id
    )

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      })
    }

    request.status = "rejected"

    await request.save()

    res.json(request)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
}