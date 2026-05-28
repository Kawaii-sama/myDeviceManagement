const Device = require("../models/deviceModel")

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

module.exports = {
  getDevices,
  addDevice,
}