import axios from "axios"

const API_URL = "http://localhost:5000/api/requests"

const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  return {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  }
}

// Employee: request an available device (assignment)
export const createRequest = async (deviceId) => {
  const response = await axios.post(API_URL, { deviceId }, getConfig())
  return response.data
}

// Employee: initiate a transfer to another employee
export const createTransferRequest = async (deviceId, toEmployeeId) => {
  const response = await axios.post(
    `${API_URL}/transfer`,
    { deviceId, toEmployeeId },
    getConfig()
  )
  return response.data
}

// Employee: accept an incoming transfer
export const acceptTransfer = async (requestId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/accept-transfer`,
    {},
    getConfig()
  )
  return response.data
}

// Employee: decline an incoming transfer
export const declineTransfer = async (requestId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/decline-transfer`,
    {},
    getConfig()
  )
  return response.data
}

// Employee: get their own requests
export const getMyRequests = async () => {
  const response = await axios.get(`${API_URL}/my`, getConfig())
  return response.data
}

// Employee: get incoming transfer requests directed at them
export const getIncomingTransfers = async () => {
  const response = await axios.get(`${API_URL}/incoming-transfers`, getConfig())
  return response.data
}

// Admin: get all assignment requests
export const getRequests = async () => {
  const response = await axios.get(API_URL, getConfig())
  return response.data
}

// Admin: approve an assignment request
export const approveRequest = async (requestId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/approve`,
    {},
    getConfig()
  )
  return response.data
}

// Admin: reject an assignment request
export const rejectRequest = async (requestId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/reject`,
    {},
    getConfig()
  )
  return response.data
}