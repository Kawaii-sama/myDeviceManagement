const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  )
}

// CREATE ADMIN — allows multiple admins
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    })

    res.status(201).json(admin)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// LOGIN
const loginUser = async (req, res) => {
  try {
    console.log("========== LOGIN ATTEMPT ==========")
    console.log("BODY:", req.body)

    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    console.log("LOGIN SUCCESS")

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// REGISTER
const registerUser = async (req, res) => {
  try {
    console.log("========== REGISTER ==========")
    console.log("BODY:", req.body)

    const { name, email, password } = req.body

    const exists = await User.findOne({ email })

    if (exists) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "employee",
    })

    console.log("USER CREATED:", employee)

    res.status(201).json(employee)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET ALL USERS — admin only, for Users tab
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET ALL EMPLOYEES — any logged-in user, for transfer dropdown
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select("_id name email")
      .sort({ name: 1 })
    res.json(employees)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


module.exports = {
  createAdmin,
  loginUser,
  registerUser,
  getAllUsers,
  getAllEmployees,
}