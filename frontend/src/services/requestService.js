import axios from "axios"

const API_URL = "http://localhost:5000/api/requests"

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

// Employee: create a request for a device
export const createRequest = async (deviceId) => {
  const response = await axios.post(
    API_URL,
    { deviceId },
    getConfig()
  )
  return response.data
}

// Employee: get their own requests
export const getMyRequests = async () => {
  const response = await axios.get(
    `${API_URL}/my`,
    getConfig()
  )
  return response.data
}

// Admin: get all requests
export const getRequests = async () => {
  const response = await axios.get(
    API_URL,
    getConfig()
  )
  return response.data
}

// Admin: approve a request
export const approveRequest = async (requestId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/approve`,
    {},
    getConfig()
  )
  return response.data
}

// Admin: reject a request
export const rejectRequest = async (requestId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/reject`,
    {},
    getConfig()
  )
  return response.data
}
