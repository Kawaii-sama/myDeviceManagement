import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import {
  getDevices,
  checkoutDevice,
  checkinDevice,
  addDevice,
  deleteDevice,
} from "../services/deviceService"

function Dashboard() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [model, setModel] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [engineerName, setEngineerName] = useState("")
  const [pcNumber, setPcNumber] = useState("")
  const [floorNumber, setFloorNumber] = useState("")
  const [expectedReturnTime, setExpectedReturnTime] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchDevices()

    const interval = setInterval(() => {
        fetchDevices()
    }, 3000)

    return () => clearInterval(interval)
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

  const openCheckoutModal = (id) => {
  setSelectedDeviceId(id)
    }


    const handleCheckout = async (e) => {
    e.preventDefault()

    try {
        await checkoutDevice(selectedDeviceId, {
        engineerName,
        pcNumber,
        floorNumber,
        expectedReturnTime,
        })

        toast.success("Device checked out successfully")

        setSelectedDeviceId(null)

    setEngineerName("")
    setPcNumber("")
    setFloorNumber("")
    setExpectedReturnTime("")

    fetchDevices()
  } catch (error) {
    console.log(error)
  }
    }



  

  // CHECKIN
  const handleCheckin = async (id) => {
    try {
      await checkinDevice(id)
      toast.success("Device checked in")

      fetchDevices()
    } catch (error) {
      console.log(error)
    }
  }



  const handleDeleteDevice = async (id) => {
  const confirmDelete = window.confirm(
    "Delete this device?"
  )

  if (!confirmDelete) {
    return
  }

  try {
    await deleteDevice(id)

    toast.success("Device deleted")

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
    toast.success("Device added successfully")

    setModel("")
    setDeviceId("")

    fetchDevices()
  } catch (error) {
    console.log(error)
  }
}




const filteredDevices = devices.filter((device) => {
  const matchesSearch =
    device.model
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    device.deviceId
      .toLowerCase()
      .includes(search.toLowerCase())

  const matchesStatus =
    statusFilter === "all"
      ? true
      : device.status === statusFilter

  return matchesSearch && matchesStatus
})


  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Device Dashboard
      </h1>


      <p className="text-gray-500 mb-6">
        Live device tracking system
      </p>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500">Available Devices</p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
           {
            devices.filter(
              (device) => device.status === "available"
            ).length
           } 
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
         <p className="text-gray-500">Devices In Use</p>

           <h2 className="text-3xl font-bold text-red-600 mt-2">
            {
              devices.filter(
               (device) => device.status === "in-use"
              ).length
          }
           </h2>
        </div>
      </div>


    <div className="flex flex-col md:flex-row gap-4 mb-6">
  <input
    type="text"
    placeholder="Search devices..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="bg-white border border-gray-300 p-3 rounded-xl flex-1"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="bg-white border border-gray-300 p-3 rounded-xl"
  >
    <option value="all">All Devices</option>
    <option value="available">Available</option>
    <option value="in-use">In Use</option>
  </select>
</div>
    


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
    {filteredDevices.map((device) => (
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
              onClick={() => openCheckoutModal(device._id)}
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

        <button
          onClick={() => handleDeleteDevice(device._id)}
          className="mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl w-full"
        >
          Delete
          </button>

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
    
    {selectedDeviceId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
    <form
      onSubmit={handleCheckout}
      className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Checkout Device
      </h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Engineer Name"
          value={engineerName}
          onChange={(e) => setEngineerName(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-xl"
          required
        />

        <input
          type="text"
          placeholder="PC Number"
          value={pcNumber}
          onChange={(e) => setPcNumber(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-xl"
          required
        />

        <input
          type="text"
          placeholder="Floor Number"
          value={floorNumber}
          onChange={(e) => setFloorNumber(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-xl"
          required
        />

        <input
          type="text"
          placeholder="Expected Return Time"
          value={expectedReturnTime}
          onChange={(e) =>
            setExpectedReturnTime(e.target.value)
          }
          className="w-full border border-gray-300 p-3 rounded-xl"
          required
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex-1"
        >
          Confirm Checkout
        </button>

        <button
          type="button"
          onClick={() => setSelectedDeviceId(null)}
          className="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
  )}

    
    </div>
  )
}

export default Dashboard