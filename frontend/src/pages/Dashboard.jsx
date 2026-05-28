import { useEffect, useState } from "react"
import { getDevices } from "../services/deviceService"

function Dashboard() {
  const [devices, setDevices] = useState([])

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const data = await getDevices()

      setDevices(data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Device Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div
            key={device._id}
            className="bg-white p-6 rounded-2xl shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {device.model}
            </h2>

            <p className="text-gray-500 mt-2">
              ID: {device.deviceId}
            </p>

            <div className="mt-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  device.status === "available"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {device.status}
              </span>
            </div>

            {device.status === "in-use" && (
              <div className="mt-4 text-sm text-gray-600">
                <p>Engineer: {device.engineerName}</p>
                <p>PC: {device.pcNumber}</p>
                <p>Floor: {device.floorNumber}</p>
                <p>Return: {device.expectedReturnTime}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard