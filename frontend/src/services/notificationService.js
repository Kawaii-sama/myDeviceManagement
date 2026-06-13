import axios from "axios"

const API_URL =
  "https://mydevicemanagement.onrender.com/api/notifications"

export const getNotifications = async () => {
  const user = JSON.parse(
    localStorage.getItem("user")
  )

  const response = await axios.get(
    API_URL,
    {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    }
  )

  return response.data
}