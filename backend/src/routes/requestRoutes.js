const express = require("express")

const {
  createRequest,
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

// Employee: create a request
router.post("/", protect, createRequest)

// Employee: get their own requests
// IMPORTANT: this route must come BEFORE "/:id" routes
router.get("/my", protect, getMyRequests)

// Admin: get all requests
router.get("/", protect, adminOnly, getRequests)

// Admin: approve a request
router.put("/:id/approve", protect, adminOnly, approveRequest)

// Admin: reject a request
router.put("/:id/reject", protect, adminOnly, rejectRequest)

module.exports = router
