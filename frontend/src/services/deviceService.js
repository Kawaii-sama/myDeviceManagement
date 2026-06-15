import axios from "axios"

const API_URL = "https://mydevicemanagement.onrender.com/api/devices"

const getConfig = () => {
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  )
  return {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  }
}

// GET all devices
export const getDevices = async () => {
  const response = await axios.get(API_URL, getConfig())
  return response.data
}

// ADD device (admin only)
export const addDevice = async (deviceData) => {
  const response = await axios.post(API_URL, deviceData, getConfig())
  return response.data
}

// DELETE device (admin only)
export const deleteDevice = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getConfig())
  return response.data
}

// Employee: return their assigned device
export const returnDevice = async (id) => {
  const response = await axios.put(
    `${API_URL}/return/${id}`,
    {},
    getConfig()
  )
  return response.data
}
