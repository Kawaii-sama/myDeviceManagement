import axios from "axios"

const API_URL = "http://localhost:5000/api/devices"




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


// GET devices
export const getDevices = async () => {
  const response = await axios.get(
  API_URL,
  getConfig()
)

  return response.data
}

// CHECKOUT device
export const checkoutDevice = async (id, formData) => {
  const response = await axios.put(
    `${API_URL}/checkout/${id}`,
    formData,
    getConfig()
  )

  return response.data
}

// CHECKIN device
export const checkinDevice = async (id) => {
  const response = await axios.put(
    `${API_URL}/checkin/${id}`,
    {},
    getConfig()
  )

  return response.data
}

// ADD device
export const addDevice = async (deviceData) => {
  const response = await axios.post(
  API_URL,
  deviceData,
  getConfig()
)

  return response.data
}


// DELETE device
export const deleteDevice = async (id) => {
  const response = await axios.delete(
  `${API_URL}/${id}`,
  getConfig()
)

  return response.data
}