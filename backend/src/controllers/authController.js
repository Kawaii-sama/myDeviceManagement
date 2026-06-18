
// GET ALL USERS (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createAdmin,
  loginUser,
  registerUser,
  getAllUsers,
}