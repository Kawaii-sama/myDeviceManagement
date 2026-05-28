import axios from "axios"

const API_URL = "http://localhost:5000/api/devices"

// GET devices
export const getDevices = async () => {
  const response = await axios.get(API_URL)

  return response.data
}