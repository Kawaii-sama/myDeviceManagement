const express = require("express")

const {
  createRequest,
  createTransferRequest,
  acceptTransfer,
  declineTransfer,
  getRequests,
  getMyRequests,
  getIncomingTransfers,
  approveRequest,
  rejectRequest,
} = require("../controllers/requestController")

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware")

const router = express.Router()

// Assignment requests
router.post("/", protect, createRequest)
router.get("/", protect, adminOnly, getRequests)

// Must come before /:id routes
router.get("/my", protect, getMyRequests)
router.get("/incoming-transfers", protect, getIncomingTransfers)

// Transfer requests
router.post("/transfer", protect, createTransferRequest)
router.put("/:id/accept-transfer", protect, acceptTransfer)
router.put("/:id/decline-transfer", protect, declineTransfer)

// Admin approval
router.put("/:id/approve", protect, adminOnly, approveRequest)
router.put("/:id/reject", protect, adminOnly, rejectRequest)

module.exports = router