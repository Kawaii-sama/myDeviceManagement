import axios from "axios"

const API_URL =
  "http://localhost:5000/api/notifications"

export const getNotifications = async () => {
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  )

  const response = await axios.get(
    API_URL,
    {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }
  )

  return response.data
}