import axios from "axios"

const API_URL =
  "https://mydevicemanagement.onrender.com/notifications"

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