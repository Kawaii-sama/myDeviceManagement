const express = require("express")

const {
  createAdmin,
  loginUser,
  registerUser,
  getAllUsers,
} = require("../controllers/authController")

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/create-admin", createAdmin)
router.post("/login", loginUser)
router.post("/register", registerUser)
router.get("/users", protect, adminOnly, getAllUsers)

module.exports = router