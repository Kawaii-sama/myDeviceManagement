import axios from "axios"

const API_URL = "http://localhost:5000/api/requests"

const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  return {
    headers: { Authorization: `Bearer ${userInfo.token}` },
  }
}

// Employee: request a device (available → admin, assigned → owner)
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

// Employee: get their own outgoing requests
export const getMyRequests = async () => {
  const response = await axios.get(`${API_URL}/my`, getConfig())
  return response.data
}

// Employee: get requests from others for devices I own
export const getIncomingRequests = async () => {
  const response = await axios.get(`${API_URL}/incoming-requests`, getConfig())
  return response.data
}

// Employee: get incoming transfer requests (someone wants to give me their device)
export const getIncomingTransfers = async () => {
  const response = await axios.get(`${API_URL}/incoming-transfers`, getConfig())
  return response.data
}

// Device owner: approve someone's request for their device
export const approvePeerRequest = async (requestId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/approve-peer`,
    {},
    getConfig()
  )
  return response.data
}

// Device owner: decline someone's request for their device
export const declinePeerRequest = async (requestId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/decline-peer`,
    {},
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