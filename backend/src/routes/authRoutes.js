const express = require("express")

const {
  createAdmin,
  loginUser,
  createEmployee,
} = require("../controllers/authController")

const router = express.Router()

router.post("/create-admin", createAdmin)

router.post("/login", loginUser)

router.post("/create-employee", createEmployee)

module.exports = router