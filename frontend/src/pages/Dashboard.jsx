import { useEffect, useState } from "react"

import {
  getDevices,
  checkoutDevice,
  checkinDevice,
  addDevice,
} from "../services/deviceService"

function Dashboard() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [model, setModel] = useState("")
  const [deviceId, setDeviceId] = useState("")

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
        setLoading(true)

        const data = await getDevices()

        setDevices(data)
    } catch (error) {
      console.log(error)
    } finally {
        setLoading(false)
    }
  }

  // CHECKOUT
    const handleCheckout = async (id) => {
    const engineerName = prompt("Engineer Name")
    const pcNumber = prompt("PC Number")
    const floorNumber = prompt("Floor Number")
    const expectedReturnTime = prompt("Expected Return Time")

    if (
      !engineerName ||
      !pcNumber ||
      !floorNumber ||
      !expectedReturnTime
    ) {
      return
    }

    try {
      await checkoutDevice(id, {
        engineerName,
        pcNumber,
        floorNumber,
        expectedReturnTime,
      })

      fetchDevices()
    } catch (error) {
      console.log(error)
    }
  }

  // CHECKIN
  const handleCheckin = async (id) => {
    try {
      await checkinDevice(id)

      fetchDevices()
    } catch (error) {
      console.log(error)
    }
  }

  const handleAddDevice = async (e) => {
  e.preventDefault()

  if (!model || !deviceId) {
    return
  }

  try {
    await addDevice({
      model,
      deviceId,
    })

    setModel("")
    setDeviceId("")

    fetchDevices()
  } catch (error) {
    console.log(error)
  }
}


  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Device Dashboard
      </h1>


    <form
        onSubmit={handleAddDevice}
        className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4"
    >
        <input
        type="text"
        placeholder="Device Model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="border border-gray-300 p-3 rounded-xl flex-1"
    />

        <input
        type="text"
        placeholder="Device ID"
        value={deviceId}
        onChange={(e) => setDeviceId(e.target.value)}
        className="border border-gray-300 p-3 rounded-xl flex-1"
    />

        <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
    >
        Add Device
      </button>
    </form>

      {loading ? (
  <p className="text-gray-500">Loading devices...</p>
) : devices.length === 0 ? (
  <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
    <p className="text-gray-500 text-lg">
      No devices added yet
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {devices.map((device) => (
      <div
        key={device._id}
        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition"
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

        <div className="mt-4">
          {device.status === "available" ? (
            <button
              onClick={() => handleCheckout(device._id)}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl"
            >
              Checkout
            </button>
          ) : (
            <button
              onClick={() => handleCheckin(device._id)}
              className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-xl"
            >
              Checkin
            </button>
          )}
        </div>

        {device.status === "in-use" && (
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p>Engineer: {device.engineerName}</p>
            <p>PC: {device.pcNumber}</p>
            <p>Floor: {device.floorNumber}</p>
            <p>Return: {device.expectedReturnTime}</p>
          </div>
        )}
      </div>
    ))}
    </div>
    )}
    </div>
  )
}

export default Dashboard