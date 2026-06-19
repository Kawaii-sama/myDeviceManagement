import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"

import { getDevices, addDevice, deleteDevice, returnDevice } from "../services/deviceService"
import {
  createRequest,
  createTransferRequest,
  getMyRequests,
  getIncomingRequests,
  getIncomingTransfers,
  approvePeerRequest,
  declinePeerRequest,
  acceptTransfer,
  declineTransfer,
  getRequests,
  approveRequest,
  rejectRequest,
} from "../services/requestService"
import { getNotifications } from "../services/notificationService"

const BASE = "http://localhost:5000"

function Dashboard() {
  const [devices, setDevices] = useState([])
  const [requests, setRequests] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [incomingTransfers, setIncomingTransfers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [allEmployees, setAllEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const [model, setModel] = useState("")
  const [deviceInputId, setDeviceInputId] = useState("")
  const [transferDevice, setTransferDevice] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("devices")

  const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  const isAdmin = userInfo?.role === "admin"
  const userId = userInfo?._id

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${userInfo.token}` },
  })

  // ─── Fetch all data ───────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      const d = await getDevices()
      setDevices(d)
    } catch (e) { console.log("Devices:", e) }

    try {
      const n = await getNotifications()
      setNotifications(n)
    } catch (e) { console.log("Notifications:", e) }

    try {
      const res = await axios.get(`${BASE}/api/auth/employees`, getConfig())
      setAllEmployees(res.data)
    } catch (e) { console.log("Employees:", e) }

    if (isAdmin) {
      try {
        const r = await getRequests()
        setRequests(r)
      } catch (e) { console.log("Requests:", e) }

      try {
        const res = await axios.get(`${BASE}/api/auth/users`, getConfig())
        setAllUsers(res.data)
      } catch (e) { console.log("Users:", e) }
    } else {
      try {
        const r = await getMyRequests()
        setMyRequests(r)
      } catch (e) { console.log("My requests:", e) }

      try {
        const r = await getIncomingRequests()
        setIncomingRequests(r)
      } catch (e) { console.log("Incoming requests:", e) }

      try {
        const r = await getIncomingTransfers()
        setIncomingTransfers(r)
      } catch (e) { console.log("Incoming transfers:", e) }
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 4000)
    return () => clearInterval(interval)
  }, [])

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleRequestDevice = async (deviceId) => {
    try {
      await createRequest(deviceId)
      toast.success("Request sent")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed")
    }
  }

  const handleReturnDevice = async (deviceId) => {
    if (!window.confirm("Return this device?")) return
    try {
      await returnDevice(deviceId)
      toast.success("Device returned")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Return failed")
    }
  }

  const handleTransferSubmit = async () => {
    if (!selectedEmployee) { toast.error("Select an employee"); return }
    try {
      await createTransferRequest(transferDevice._id, selectedEmployee)
      toast.success("Transfer request sent")
      setTransferDevice(null)
      setSelectedEmployee("")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Transfer failed")
    }
  }

  const handleApprovePeer = async (requestId) => {
    try {
      await approvePeerRequest(requestId)
      toast.success("Request approved — device transferred")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed")
    }
  }

  const handleDeclinePeer = async (requestId) => {
    try {
      await declinePeerRequest(requestId)
      toast.success("Request declined")
      fetchAll()
    } catch (error) {
      toast.error("Decline failed")
    }
  }

  const handleAcceptTransfer = async (requestId) => {
    try {
      await acceptTransfer(requestId)
      toast.success("Transfer accepted — device is now yours")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Accept failed")
    }
  }

  const handleDeclineTransfer = async (requestId) => {
    try {
      await declineTransfer(requestId)
      toast.success("Transfer declined")
      fetchAll()
    } catch (error) {
      toast.error("Decline failed")
    }
  }

  const handleAddDevice = async (e) => {
    e.preventDefault()
    try {
      await addDevice({ model, deviceId: deviceInputId })
      toast.success("Device added")
      setModel("")
      setDeviceInputId("")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add device")
    }
  }

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

  const handleApprove = async (requestId) => {
    try {
      await approveRequest(requestId)
      toast.success("Approved — device assigned")
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed")
    }
  }

  const handleReject = async (requestId) => {
    try {
      await rejectRequest(requestId)
      toast.success("Request rejected")
      fetchAll()
    } catch (error) {
      toast.error("Rejection failed")
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────
  const hasMyPendingRequest = (deviceId) =>
    myRequests.some(
      (r) => r.deviceId === deviceId && r.status === "pending" && r.type === "assignment"
    )

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.model.toLowerCase().includes(search.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" ? true : device.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // ─── Badges ───────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const styles = {
      available: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      assigned: "bg-blue-100 text-blue-700",
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    )
  }

  const ReqBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    )
  }

  // ─── Tab definitions ──────────────────────────────────────────────
  const pendingAdminCount = requests.filter((r) => r.status === "pending").length
  const myPendingCount = myRequests.filter((r) => r.status === "pending").length
  const incomingReqCount = incomingRequests.length
  const incomingTransCount = incomingTransfers.length
  const totalIncoming = incomingReqCount + incomingTransCount

  const employeeTabs = [
    { key: "devices", label: "Devices" },
    { key: "myrequests", label: `My Requests${myPendingCount > 0 ? ` (${myPendingCount})` : ""}` },
    { key: "incoming", label: `Incoming${totalIncoming > 0 ? ` (${totalIncoming})` : ""}` },
    { key: "notifications", label: `Notifications${notifications.length > 0 ? ` (${notifications.length})` : ""}` },
  ]

  const adminTabs = [
    { key: "devices", label: "Devices" },
    { key: "requests", label: `Requests${pendingAdminCount > 0 ? ` (${pendingAdminCount})` : ""}` },
    { key: "users", label: `Users (${allUsers.length})` },
    { key: "notifications", label: `Notifications${notifications.length > 0 ? ` (${notifications.length})` : ""}` },
  ]

  const tabs = isAdmin ? adminTabs : employeeTabs

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
          onClick={() => { localStorage.removeItem("userInfo"); window.location.href = "/" }}
          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

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
        <div className="flex gap-1 mb-6 border-b border-gray-200 flex-wrap">
          {tabs.map((tab) => (
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
            {isAdmin && (
              <form onSubmit={handleAddDevice} className="bg-white p-4 rounded-2xl shadow-sm mb-4 flex flex-col md:flex-row gap-3">
                <input type="text" placeholder="Device Model" value={model} onChange={(e) => setModel(e.target.value)} className="border border-gray-300 p-3 rounded-xl flex-1 text-sm" required />
                <input type="text" placeholder="Device ID" value={deviceInputId} onChange={(e) => setDeviceInputId(e.target.value)} className="border border-gray-300 p-3 rounded-xl flex-1 text-sm" required />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition">Add Device</button>
              </form>
            )}

            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <input type="text" placeholder="Search by model or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white border border-gray-300 p-3 rounded-xl flex-1 text-sm" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-gray-300 p-3 rounded-xl text-sm">
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
              </select>
            </div>

            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : filteredDevices.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm"><p className="text-gray-400">No devices found</p></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <div className="col-span-3">Model</div>
                  <div className="col-span-2">Device ID</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3">Assigned To</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {filteredDevices.map((device, idx) => (
                  <div key={device._id} className={`grid grid-cols-12 gap-2 px-5 py-4 items-center text-sm ${idx !== filteredDevices.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className="col-span-3 font-medium text-gray-800">{device.model}</div>
                    <div className="col-span-2 text-gray-400 text-xs">{device.deviceId}</div>
                    <div className="col-span-2"><StatusBadge status={device.status} /></div>
                    <div className="col-span-3 text-gray-500 text-xs">{device.assignedToName || "—"}</div>
                    <div className="col-span-2 flex gap-2 justify-end flex-wrap">
                      {!isAdmin && (
                        <>
                          {/* Assigned to ME → Return + Transfer */}
                          {device.status === "assigned" && device.assignedTo === userId && (
                            <>
                              <button onClick={() => handleReturnDevice(device._id)} className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Return</button>
                              <button onClick={() => setTransferDevice(device)} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Transfer</button>
                            </>
                          )}
                          {/* Available → Request (goes to admin) */}
                          {device.status === "available" && (
                            <button onClick={() => handleRequestDevice(device._id)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Request</button>
                          )}
                          {/* Pending or assigned to someone else → waitlist */}
                          {(device.status === "pending" || (device.status === "assigned" && device.assignedTo !== userId)) && (
                            hasMyPendingRequest(device._id) ? (
                              <span className="text-yellow-600 text-xs font-medium">⏳ In queue</span>
                            ) : (
                              <button onClick={() => handleRequestDevice(device._id)} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Join Waitlist</button>
                            )
                          )}
                        </>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDeleteDevice(device._id)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════
            TAB: ADMIN REQUESTS
        ══════════════════════════════════════════════ */}
        {activeTab === "requests" && isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {requests.length === 0 ? (
              <div className="p-12 text-center"><p className="text-gray-400">No requests yet</p></div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <div className="col-span-3">Device</div>
                  <div className="col-span-3">Requested By</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {requests.map((req, idx) => (
                  <div key={req._id} className={`grid grid-cols-12 gap-2 px-5 py-4 items-center text-sm ${idx !== requests.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className="col-span-3 font-medium text-gray-800">{req.deviceModel}</div>
                    <div className="col-span-3 text-gray-600">{req.employeeName}</div>
                    <div className="col-span-2 text-gray-400 text-xs">{new Date(req.createdAt).toLocaleDateString()}</div>
                    <div className="col-span-2"><ReqBadge status={req.status} /></div>
                    <div className="col-span-2 flex gap-2 justify-end">
                      {req.status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(req._id)} className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Approve</button>
                          <button onClick={() => handleReject(req._id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: ADMIN USERS
        ══════════════════════════════════════════════ */}
        {activeTab === "users" && isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {allUsers.length === 0 ? (
              <div className="p-12 text-center"><p className="text-gray-400">No users found</p></div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-4">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-3">Device Assigned</div>
                </div>
                {allUsers.map((user, idx) => {
                  const assignedDevice = devices.find((d) => d.assignedTo === user._id)
                  return (
                    <div key={user._id} className={`grid grid-cols-12 gap-2 px-5 py-4 items-center text-sm ${idx !== allUsers.length - 1 ? "border-b border-gray-100" : ""}`}>
                      <div className="col-span-3 font-medium text-gray-800">{user.name}</div>
                      <div className="col-span-4 text-gray-500 text-xs">{user.email}</div>
                      <div className="col-span-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{user.role}</span>
                      </div>
                      <div className="col-span-3 text-gray-500 text-xs">{assignedDevice ? assignedDevice.model : "—"}</div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: EMPLOYEE MY REQUESTS
        ══════════════════════════════════════════════ */}
        {activeTab === "myrequests" && !isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {myRequests.length === 0 ? (
              <div className="p-12 text-center"><p className="text-gray-400">No requests yet</p></div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <div className="col-span-4">Device</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-3">Date</div>
                  <div className="col-span-2">Status</div>
                </div>
                {myRequests.map((req, idx) => (
                  <div key={req._id} className={`grid grid-cols-12 gap-2 px-5 py-4 items-center text-sm ${idx !== myRequests.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className="col-span-4 font-medium text-gray-800">{req.deviceModel}</div>
                    <div className="col-span-3 text-gray-500 text-xs capitalize">{req.type}</div>
                    <div className="col-span-3 text-gray-400 text-xs">{new Date(req.createdAt).toLocaleDateString()}</div>
                    <div className="col-span-2"><ReqBadge status={req.status} /></div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: EMPLOYEE INCOMING (requests + transfers)
        ══════════════════════════════════════════════ */}
        {activeTab === "incoming" && !isAdmin && (
          <div className="space-y-6">

            {/* Incoming Requests — someone wants MY device */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Requests for Your Device {incomingReqCount > 0 && <span className="text-yellow-600">({incomingReqCount})</span>}
              </h3>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {incomingRequests.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-gray-400 text-sm">No one has requested your device</p></div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      <div className="col-span-4">Device</div>
                      <div className="col-span-4">Requested By</div>
                      <div className="col-span-4 text-right">Actions</div>
                    </div>
                    {incomingRequests.map((req, idx) => (
                      <div key={req._id} className={`grid grid-cols-12 gap-2 px-5 py-4 items-center text-sm ${idx !== incomingRequests.length - 1 ? "border-b border-gray-100" : ""}`}>
                        <div className="col-span-4 font-medium text-gray-800">{req.deviceModel}</div>
                        <div className="col-span-4 text-gray-600">{req.employeeName}</div>
                        <div className="col-span-4 flex gap-2 justify-end">
                          <button onClick={() => handleApprovePeer(req._id)} className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Approve</button>
                          <button onClick={() => handleDeclinePeer(req._id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Decline</button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Incoming Transfers — someone wants to give ME their device */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Transfers Offered to You {incomingTransCount > 0 && <span className="text-purple-600">({incomingTransCount})</span>}
              </h3>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {incomingTransfers.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-gray-400 text-sm">No pending transfers for you</p></div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      <div className="col-span-4">Device</div>
                      <div className="col-span-4">From</div>
                      <div className="col-span-4 text-right">Actions</div>
                    </div>
                    {incomingTransfers.map((req, idx) => (
                      <div key={req._id} className={`grid grid-cols-12 gap-2 px-5 py-4 items-center text-sm ${idx !== incomingTransfers.length - 1 ? "border-b border-gray-100" : ""}`}>
                        <div className="col-span-4 font-medium text-gray-800">{req.deviceModel}</div>
                        <div className="col-span-4 text-gray-600">{req.employeeName}</div>
                        <div className="col-span-4 flex gap-2 justify-end">
                          <button onClick={() => handleAcceptTransfer(req._id)} className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Accept</button>
                          <button onClick={() => handleDeclineTransfer(req._id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">Decline</button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: NOTIFICATIONS
        ══════════════════════════════════════════════ */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-12 text-center"><p className="text-gray-400">No notifications yet</p></div>
            ) : (
              notifications.map((n, idx) => (
                <div key={n._id} className={`px-5 py-4 flex justify-between items-center text-sm ${idx !== notifications.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <p className="text-gray-700">🔔 {n.message}</p>
                  <p className="text-xs text-gray-400 ml-4 shrink-0">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Transfer Modal ── */}
      {transferDevice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Transfer Device</h2>
            <p className="text-sm text-gray-400 mb-6">Transferring: <span className="font-medium text-gray-600">{transferDevice.model}</span></p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full border border-gray-300 p-3 rounded-xl text-sm mb-6">
              <option value="">— Choose an employee —</option>
              {allEmployees.filter((u) => u._id !== userId).map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={handleTransferSubmit} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl flex-1 text-sm font-medium transition">Send Transfer Request</button>
              <button onClick={() => { setTransferDevice(null); setSelectedEmployee("") }} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-3 rounded-xl text-sm transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
