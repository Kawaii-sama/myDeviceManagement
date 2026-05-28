const express = require("express")

const {
  getDevices,
  addDevice,
  checkoutDevice,
  checkinDevice,
} = require("../controllers/deviceController")

const router = express.Router()

router.get("/", getDevices)

router.post("/", addDevice)

router.put("/checkout/:id", checkoutDevice)

router.put("/checkin/:id", checkinDevice)

module.exports = router