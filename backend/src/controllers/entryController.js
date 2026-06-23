const Entry = require("../models/entryModel")

// GET all entries for logged-in admin only
const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 })

    res.json(entries)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ADD new entry
const addEntry = async (req, res) => {
  try {
    const { application, userId, password } = req.body

    if (!application || !userId || !password) {
      return res.status(400).json({
        message: "All fields are required",
      })
    }

    const entry = await Entry.create({
      application,
      userId,
      password,
      createdBy: req.user._id,
    })

    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// EDIT entry — only if it belongs to this admin
const editEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id)

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" })
    }

    if (entry.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const { application, userId, password } = req.body

    if (application) entry.application = application
    if (userId) entry.userId = userId
    if (password) entry.password = password

    await entry.save()

    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE entry — only if it belongs to this admin
const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id)

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" })
    }

    if (entry.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await entry.deleteOne()

    res.json({ message: "Entry deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getEntries,
  addEntry,
  editEntry,
  deleteEntry,
}