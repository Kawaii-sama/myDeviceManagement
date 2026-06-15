const Device = require("../models/deviceModel")
const Notification = require("../models/notificationModel")

// GET all devices
const getDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 })

    res.json(devices)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ADD new device
const addDevice = async (req, res) => {
  try {
    const { model, deviceId } = req.body

    const device = await Device.create({
      model,
      deviceId,
    })

    res.status(201).json(device)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// CHECKOUT device
const checkoutDevice = async (req, res) => {
  try {
    const {
      engineerName,
      pcNumber,
      floorNumber,
      expectedReturnTime,
    } = req.body

    const device = await Device.findById(req.params.id)

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    device.status = "in-use"
    device.engineerName = engineerName
    device.pcNumber = pcNumber
    device.floorNumber = floorNumber
    device.expectedReturnTime = expectedReturnTime

    await device.save()

    res.json(device)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// CHECKIN device
const checkinDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)

    if (!device) {
      return res.status(404).json({ message: "Device not found" })
    }

    device.status = "available"
    device.engineerName = ""
    device.pcNumber = ""
    device.floorNumber = ""
    device.expectedReturnTime = ""

    await device.save()

    res.json(device)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


  // DELETE device
const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      })
    }

    await device.deleteOne()

    res.json({
      message: "Device deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}


//Return device
const returnDevice = async ( req, res ) => {
  try {
    const device =
      await Device.findById(
        req.params.id
      )

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      })
    }

    if (
      device.assignedTo?.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only return your own device",
      })
    }

    const employeeName =
      device.assignedToName

    device.status = "available"
    device.assignedTo = null
    device.assignedToName = ""

    await device.save()

    await Notification.create({
      message: `${employeeName} returned ${device.model}`,
    })

    res.json({
      message:
        "Device returned successfully",
      device,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  getDevices,
  addDevice,
  checkoutDevice,
  checkinDevice,
  deleteDevice,
  returnDevice,
}