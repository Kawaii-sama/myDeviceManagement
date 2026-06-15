const express = require("express")


const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware")



const {
  getDevices,
  addDevice,
  checkoutDevice,
  checkinDevice,
  deleteDevice,
  returnDevice,
} = require("../controllers/deviceController")

const router = express.Router()

router.get("/", protect, getDevices)

router.post(
  "/",
  protect,
  adminOnly,
  addDevice
)

router.put(
  "/checkout/:id",
  protect,
  checkoutDevice
)

router.put(
  "/checkin/:id",
  protect,
  checkinDevice
)

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteDevice
)

router.put(
  "/return/:id",
  protect,
  returnDevice
)

module.exports = router