import axios from "axios"

const API_URL = "http://localhost:5000/api/devices"

// GET devices
export const getDevices = async () => {
  const response = await axios.get(API_URL)

  return response.data
}

// CHECKOUT device
export const checkoutDevice = async (id, formData) => {
  const response = await axios.put(
    `${API_URL}/checkout/${id}`,
    formData
  )

  return response.data
}

// CHECKIN device
export const checkinDevice = async (id) => {
  const response = await axios.put(
    `${API_URL}/checkin/${id}`
  )

  return response.data
}