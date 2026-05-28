const express = require("express")

const {
  getDevices,
  addDevice,
} = require("../controllers/deviceController")

const router = express.Router()

router.get("/", getDevices)

router.post("/", addDevice)

module.exports = router