const express = require("express")

const {
  getDevices,
  addDevice,
  checkoutDevice,
  checkinDevice,
  deleteDevice,
} = require("../controllers/deviceController")

const router = express.Router()

router.get("/", getDevices)

router.post("/", addDevice)

router.put("/checkout/:id", checkoutDevice)

router.put("/checkin/:id", checkinDevice)

router.delete("/:id", deleteDevice)

module.exports = router