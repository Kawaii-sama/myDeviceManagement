import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { getDevices, addDevice, deleteDevice, returnDevice } from "../services/deviceService"
import { createRequest, getRequests, approveRequest, rejectRequest } from "../services/requestService"
import { getNotifications } from "../services/notificationService"

function Dashboard() {
  const [devices, setDevices] = useState([])
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [model, setModel] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("devices") // "devices" | "requests" | "notifications"

  const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  const isAdmin = userInfo?.role === "admin"
  const userId = userInfo?._id

  // ─── Data fetching ───────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      const deviceData = await getDevices()
      setDevices(deviceData)

      const notifData = await getNotifications()
      setNotifications(notifData)

      if (isAdmin) {
        const requestData = await getRequests()
        setRequests(requestData)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 4000)
    return () => clearInterval(interval)
  }, [])

  // ─── Employee: Request a device ──────────────────────────────────
  const handleRequestDevice = async (deviceId) => {
    try {
      await createRequest(deviceId)
      toast.success("Request sent — waiting for admin approval")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed")
    }
  }

  // ─── Employee: Return assigned device ────────────────────────────
  const handleReturnDevice = async (deviceId) => {
    const confirm = window.confirm("Return this device?")
    if (!confirm) return

    try {
      await returnDevice(deviceId)
      toast.success("Device returned successfully")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Return failed")
    }
  }

  // ─── Admin: Add device ───────────────────────────────────────────
  const handleAddDevice = async (e) => {
    e.preventDefault()
    if (!model || !deviceId) return

    try {
      await addDevice({ model, deviceId })
      toast.success("Device added")
      setModel("")
      setDeviceId("")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add device")
    }
  }

  // ─── Admin: Delete device ────────────────────────────────────────
  const handleDeleteDevice = async (id) => {
    if (!window.confirm("Delete this device?")) return

    try {
      await deleteDevice(id)
      toast.success("Device deleted")
      fetchAll()
    } catch (error) {
      toast.error("Failed to delete device")
    }
  }

  // ─── Admin: Approve request ──────────────────────────────────────
  const handleApprove = async (requestId) => {
    try {
      await approveRequest(requestId)
      toast.success("Request approved — device assigned")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed")
    }
  }

  // ─── Admin: Reject request ───────────────────────────────────────
  const handleReject = async (requestId) => {
    try {
      await rejectRequest(requestId)
      toast.success("Request rejected")
      fetchAll()
    } catch (error) {
      toast.error("Rejection failed")
    }
  }

  // ─── Filtering ───────────────────────────────────────────────────
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.model.toLowerCase().includes(search.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ? true : device.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // ─── Status badge ─────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const styles = {
      available: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      assigned: "bg-blue-100 text-blue-700",
      "in-use": "bg-red-100 text-red-700",
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    )
  }

  // ─── Device action button logic ──────────────────────────────────
  const DeviceAction = ({ device }) => {
    // Admin: no request buttons, only delete
    if (isAdmin) return null

    // This device is assigned to ME → show Return
    if (device.status === "assigned" && device.assignedTo === userId) {
      return (
        <button
          onClick={() => handleReturnDevice(device._id)}
          className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl text-sm font-medium transition"
        >
          Return Device
        </button>
      )
    }

    // Available → employee can request
    if (device.status === "available") {
      return (
        <button
          onClick={() => handleRequestDevice(device._id)}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium transition"
        >
          Request Device
        </button>
      )
    }

    // Pending / assigned to someone else → greyed out
    return (
      <button
        disabled
        className="mt-4 w-full bg-gray-100 text-gray-400 py-2 rounded-xl text-sm font-medium cursor-not-allowed"
      >
        {device.status === "pending" ? "Awaiting Approval" : "Assigned to " + (device.assignedToName || "someone")}
      </button>
    )
  }

  // ─── Pending requests count badge ────────────────────────────────
  const pendingCount = requests.filter((r) => r.status === "pending").length

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ── Top nav ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Device Manager</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Logged in as <span className="font-semibold text-gray-600">{userInfo?.name}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
              {isAdmin ? "Admin" : "Employee"}
            </span>
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("userInfo")
            window.location.href = "/"
          }}
          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Available", count: devices.filter((d) => d.status === "available").length, color: "text-green-600" },
            { label: "Pending", count: devices.filter((d) => d.status === "pending").length, color: "text-yellow-500" },
            { label: "Assigned", count: devices.filter((d) => d.status === "assigned").length, color: "text-blue-600" },
            { label: "Total", count: devices.length, color: "text-gray-700" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: "devices", label: "Devices" },
            ...(isAdmin ? [{ key: "requests", label: `Requests${pendingCount > 0 ? ` (${pendingCount})` : ""}` }] : []),
            { key: "notifications", label: `Notifications${notifications.length > 0 ? ` (${notifications.length})` : ""}` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === tab.key
                  ? "bg-white border border-b-white border-gray-200 text-blue-600 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            TAB: DEVICES
        ══════════════════════════════════════════════ */}
        {activeTab === "devices" && (
          <>
            {/* Admin: Add Device form */}
            {isAdmin && (
              <form
                onSubmit={handleAddDevice}
                className="bg-white p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-3"
              >
                <input
                  type="text"
                  placeholder="Device Model (e.g. MacBook Pro)"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="border border-gray-300 p-3 rounded-xl flex-1 text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Device ID (e.g. MBP-001)"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="border border-gray-300 p-3 rounded-xl flex-1 text-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition"
                >
                  Add Device
                </button>
              </form>
            )}

            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <input
                type="text"
                placeholder="Search by model or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-gray-300 p-3 rounded-xl flex-1 text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 p-3 rounded-xl text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
              </select>
            </div>

            {/* Device Cards */}
            {loading ? (
              <p className="text-gray-400 text-sm">Loading devices...</p>
            ) : filteredDevices.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-gray-400">No devices found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredDevices.map((device) => (
                  <div
                    key={device._id}
                    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">{device.model}</h2>
                        <p className="text-xs text-gray-400 mt-1">ID: {device.deviceId}</p>
                      </div>
                      <StatusBadge status={device.status} />
                    </div>

                    {/* Show who has the device */}
                    {(device.status === "assigned" || device.status === "pending") && device.assignedToName && (
                      <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700">
                        👤 {device.status === "assigned" ? "Assigned to" : "Requested by"}: <span className="font-semibold">{device.assignedToName}</span>
                      </div>
                    )}

                    {/* Employee action buttons */}
                    <DeviceAction device={device} />

                    {/* Admin: delete button */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteDevice(device._id)}
                        className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl text-sm transition"
                      >
                        Delete Device
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════
            TAB: REQUESTS (Admin only)
        ══════════════════════════════════════════════ */}
        {activeTab === "requests" && isAdmin && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-gray-400">No requests yet</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{req.deviceModel}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Requested by <span className="font-medium text-gray-700">{req.employeeName}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === "pending" ? "bg-yellow-100 text-yellow-700"
                      : req.status === "approved" ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                      {req.status}
                    </span>

                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(req._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: NOTIFICATIONS
        ══════════════════════════════════════════════ */}
        {activeTab === "notifications" && (
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className="bg-white px-5 py-4 rounded-2xl shadow-sm flex justify-between items-center"
                >
                  <p className="text-sm text-gray-700">🔔 {n.message}</p>
                  <p className="text-xs text-gray-400 ml-4 shrink-0">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard
