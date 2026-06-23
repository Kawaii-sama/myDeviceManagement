import axios from "axios"

const API_URL = "http://localhost:5000/api/entries"

const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  return {
    headers: { Authorization: `Bearer ${userInfo.token}` },
  }
}

export const getEntries = async () => {
  const response = await axios.get(API_URL, getConfig())
  return response.data
}

export const addEntry = async (entryData) => {
  const response = await axios.post(API_URL, entryData, getConfig())
  return response.data
}

export const editEntry = async (id, entryData) => {
  const response = await axios.put(`${API_URL}/${id}`, entryData, getConfig())
  return response.data
}

export const deleteEntry = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getConfig())
  return response.data
}