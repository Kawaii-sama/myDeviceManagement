const express = require("express")

const {
  getEntries,
  addEntry,
  editEntry,
  deleteEntry,
} = require("../controllers/entryController")

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware")

const router = express.Router()

// All routes — logged-in admin only
router.get("/", protect, adminOnly, getEntries)
router.post("/", protect, adminOnly, addEntry)
router.put("/:id", protect, adminOnly, editEntry)
router.delete("/:id", protect, adminOnly, deleteEntry)

module.exports = router