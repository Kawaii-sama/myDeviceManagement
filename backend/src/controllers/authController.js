const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  )
}


const createAdmin = async (req, res) => {
  try {
    const adminExists = await User.findOne({
      role: "admin",
    })

    if (adminExists) {
      return res.status(400).json({
        message: "Admin already exists",
      })
    }

    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(
      password,
      10
    )

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    })

    res.status(201).json(admin)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      })
    }

    const match = await bcrypt.compare(
      password,
      user.password
    )

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(
        user._id,
        user.role
      ),
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}



const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const exists = await User.findOne({
      email,
    })

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      })
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    )

    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "employee",
    })

    res.status(201).json(employee)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}


module.exports = {
  createAdmin,
  loginUser,
  registerUser,
}