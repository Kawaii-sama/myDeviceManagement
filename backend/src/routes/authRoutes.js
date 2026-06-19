const express = require("express")

const {
  createAdmin,
  loginUser,
  registerUser,
  getAllUsers,
  getAllEmployees,
} = require("../controllers/authController")

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/create-admin", createAdmin)
router.post("/login", loginUser)
router.post("/register", registerUser)

// Admin only — full user list with roles
router.get("/users", protect, adminOnly, getAllUsers)

// Any logged-in user — employee list for transfer dropdown
router.get("/employees", protect, getAllEmployees)

module.exports = router