const express = require("express")

const {
  createRequest,
  createTransferRequest,
  getIncomingRequests,
  getIncomingTransfers,
  approvePeerRequest,
  declinePeerRequest,
  acceptTransfer,
  declineTransfer,
  getRequests,
  getMyRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/requestController")

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware")

const router = express.Router()

// ── Must come before /:id routes ──
router.get("/my", protect, getMyRequests)
router.get("/incoming-requests", protect, getIncomingRequests)
router.get("/incoming-transfers", protect, getIncomingTransfers)

// ── Assignment requests ──
router.post("/", protect, createRequest)
router.get("/", protect, adminOnly, getRequests)

// ── Transfer requests ──
router.post("/transfer", protect, createTransferRequest)
router.put("/:id/accept-transfer", protect, acceptTransfer)
router.put("/:id/decline-transfer", protect, declineTransfer)

// ── Peer approve/decline (device owner) ──
router.put("/:id/approve-peer", protect, approvePeerRequest)
router.put("/:id/decline-peer", protect, declinePeerRequest)

// ── Admin approve/reject ──
router.put("/:id/approve", protect, adminOnly, approveRequest)
router.put("/:id/reject", protect, adminOnly, rejectRequest)

module.exports = router