const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

const connectDB = require("./src/config/db")
const deviceRoutes = require("./src/routes/deviceRoutes")
const authRoutes = require("./src/routes/authRoutes")
const requestRoutes = require("./src/routes/requestRoutes")



dotenv.config()

console.log(process.env.MONGO_URI)

connectDB()

const app = express()

app.use(cors())
app.use(express.json())



app.use("/api/auth", authRoutes)
app.use("/api/devices", deviceRoutes)
app.use("/api/requests", requestRoutes)




app.get("/", (req, res) => {
  res.send("API Running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})