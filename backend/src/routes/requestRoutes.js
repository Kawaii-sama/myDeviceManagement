const express = require("express")

const {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/requestController")

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware")

const router = express.Router()

router.post(
  "/",
  protect,
  createRequest
)

router.get(
  "/",
  protect,
  adminOnly,
  getRequests
)

router.put(
  "/:id/approve",
  protect,
  adminOnly,
  approveRequest
)

router.put(
  "/:id/reject",
  protect,
  adminOnly,
  rejectRequest
)

module.exports = router