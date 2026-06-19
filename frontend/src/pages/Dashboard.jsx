import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"

import { getDevices, addDevice, deleteDevice, returnDevice } from "../services/deviceService"
import {
  createRequest, createTransferRequest,
  getMyRequests, getIncomingRequests, getIncomingTransfers,
  approvePeerRequest, declinePeerRequest,
  acceptTransfer, declineTransfer,
  getRequests, approveRequest, rejectRequest,
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
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark")

  const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  const isAdmin = userInfo?.role === "admin"
  const userId = userInfo?._id

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${userInfo.token}` },
  })

  // ─── Dark mode ────────────────────────────────────────────────────
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [dark])

  // ─── Fetch all data ───────────────────────────────────────────────
  const fetchAll = async () => {
    try { setDevices(await getDevices()) } catch (e) { console.log(e) }
    try { setNotifications(await getNotifications()) } catch (e) { console.log(e) }
    try {
      const res = await axios.get(`${BASE}/api/auth/employees`, getConfig())
      setAllEmployees(res.data)
    } catch (e) { console.log(e) }

    if (isAdmin) {
      try { setRequests(await getRequests()) } catch (e) { console.log(e) }
      try {
        const res = await axios.get(`${BASE}/api/auth/users`, getConfig())
        setAllUsers(res.data)
      } catch (e) { console.log(e) }
    } else {
      try { setMyRequests(await getMyRequests()) } catch (e) { console.log(e) }
      try { setIncomingRequests(await getIncomingRequests()) } catch (e) { console.log(e) }
      try { setIncomingTransfers(await getIncomingTransfers()) } catch (e) { console.log(e) }
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
    try { await createRequest(deviceId); toast.success("Request sent"); fetchAll() }
    catch (e) { toast.error(e.response?.data?.message || "Request failed") }
  }
  const handleReturnDevice = async (deviceId) => {
    if (!window.confirm("Return this device?")) return
    try { await returnDevice(deviceId); toast.success("Device returned"); fetchAll() }
    catch (e) { toast.error(e.response?.data?.message || "Return failed") }
  }
  const handleTransferSubmit = async () => {
    if (!selectedEmployee) { toast.error("Select an employee"); return }
    try {
      await createTransferRequest(transferDevice._id, selectedEmployee)
      toast.success("Transfer request sent")
      setTransferDevice(null); setSelectedEmployee(""); fetchAll()
    } catch (e) { toast.error(e.response?.data?.message || "Transfer failed") }
  }
  const handleApprovePeer = async (id) => {
    try { await approvePeerRequest(id); toast.success("Approved — device transferred"); fetchAll() }
    catch (e) { toast.error(e.response?.data?.message || "Failed") }
  }
  const handleDeclinePeer = async (id) => {
    try { await declinePeerRequest(id); toast.success("Declined"); fetchAll() }
    catch (e) { toast.error("Failed") }
  }
  const handleAcceptTransfer = async (id) => {
    try { await acceptTransfer(id); toast.success("Transfer accepted"); fetchAll() }
    catch (e) { toast.error(e.response?.data?.message || "Failed") }
  }
  const handleDeclineTransfer = async (id) => {
    try { await declineTransfer(id); toast.success("Transfer declined"); fetchAll() }
    catch (e) { toast.error("Failed") }
  }
  const handleAddDevice = async (e) => {
    e.preventDefault()
    try { await addDevice({ model, deviceId: deviceInputId }); toast.success("Device added"); setModel(""); setDeviceInputId(""); fetchAll() }
    catch (e) { toast.error(e.response?.data?.message || "Failed") }
  }
  const handleDeleteDevice = async (id) => {
    if (!window.confirm("Delete this device?")) return
    try { await deleteDevice(id); toast.success("Deleted"); fetchAll() }
    catch (e) { toast.error("Failed") }
  }
  const handleApprove = async (id) => {
    try { await approveRequest(id); toast.success("Approved"); fetchAll() }
    catch (e) { toast.error(e.response?.data?.message || "Failed") }
  }
  const handleReject = async (id) => {
    try { await rejectRequest(id); toast.success("Rejected"); fetchAll() }
    catch (e) { toast.error("Failed") }
  }

  // ─── Helpers ──────────────────────────────────────────────────────
  const hasMyPendingRequest = (deviceId) =>
    myRequests.some((r) => r.deviceId === deviceId && r.status === "pending" && r.type === "assignment")

  const filteredDevices = devices.filter((d) => {
    const s = search.toLowerCase()
    const matchSearch = d.model.toLowerCase().includes(s) || d.deviceId.toLowerCase().includes(s)
    const matchStatus = statusFilter === "all" || d.status === statusFilter
    return matchSearch && matchStatus
  })

  // ─── Reusable classes ─────────────────────────────────────────────
  const card = "bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
  const headerRow = "grid gap-2 px-5 py-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-100 dark:border-slate-600 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wide"
  const bodyRow = "grid gap-2 px-5 py-4 items-center text-sm border-b border-gray-100 dark:border-slate-700 last:border-0"
  const inputClass = "border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 p-3 rounded-xl text-sm w-full"

  const StatusBadge = ({ status }) => {
    const s = { available: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", assigned: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>
  }

  const ReqBadge = ({ status }) => {
    const s = { pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>
  }

  // ─── Tab config ───────────────────────────────────────────────────
  const pendingAdminCount = requests.filter((r) => r.status === "pending").length
  const myPendingCount = myRequests.filter((r) => r.status === "pending").length
  const totalIncoming = incomingRequests.length + incomingTransfers.length

  const tabs = isAdmin
    ? [
        { key: "devices", label: "Devices" },
        { key: "requests", label: `Requests${pendingAdminCount > 0 ? ` (${pendingAdminCount})` : ""}` },
        { key: "users", label: `Users (${allUsers.length})` },
        { key: "notifications", label: `Notifications${notifications.length > 0 ? ` (${notifications.length})` : ""}` },
      ]
    : [
        { key: "devices", label: "Devices" },
        { key: "myrequests", label: `My Requests${myPendingCount > 0 ? ` (${myPendingCount})` : ""}` },
        { key: "incoming", label: `Incoming${totalIncoming > 0 ? ` (${totalIncoming})` : ""}` },
        { key: "notifications", label: `Notifications${notifications.length > 0 ? ` (${notifications.length})` : ""}` },
      ]

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">

      {/* ── Nav ── */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Device Manager</h1>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
            Logged in as <span className="font-semibold text-gray-600 dark:text-slate-300">{userInfo?.name}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${isAdmin ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}`}>
              {isAdmin ? "Admin" : "Employee"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-xl text-sm font-medium transition"
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={() => { localStorage.removeItem("userInfo"); window.location.href = "/" }}
            className="bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Available", count: devices.filter((d) => d.status === "available").length, color: "text-green-600 dark:text-green-400" },
            { label: "Pending", count: devices.filter((d) => d.status === "pending").length, color: "text-yellow-500 dark:text-yellow-400" },
            { label: "Assigned", count: devices.filter((d) => d.status === "assigned").length, color: "text-blue-600 dark:text-blue-400" },
            { label: "Total", count: devices.length, color: "text-gray-700 dark:text-slate-300" },
          ].map((stat) => (
            <div key={stat.label} className={`${card} p-5`}>
              <p className="text-xs text-gray-400 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-slate-700 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === tab.key
                  ? "bg-white dark:bg-slate-800 border border-b-white dark:border-b-slate-800 border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 -mb-px"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
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
              <form onSubmit={handleAddDevice} className={`${card} p-4 mb-4 flex flex-col md:flex-row gap-3`}>
                <input type="text" placeholder="Device Model" value={model} onChange={(e) => setModel(e.target.value)} className={inputClass} required />
                <input type="text" placeholder="Device ID" value={deviceInputId} onChange={(e) => setDeviceInputId(e.target.value)} className={inputClass} required />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition whitespace-nowrap">Add Device</button>
              </form>
            )}

            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <input type="text" placeholder="Search by model or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className={inputClass} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} w-auto`}>
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
              </select>
            </div>

            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : filteredDevices.length === 0 ? (
              <div className={`${card} p-12 text-center`}><p className="text-gray-400">No devices found</p></div>
            ) : (
              <div className={`${card} overflow-hidden`}>
                <div className={`${headerRow} grid-cols-12`}>
                  <div className="col-span-3">Model</div>
                  <div className="col-span-2">Device ID</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3">Assigned To</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {filteredDevices.map((device) => (
                  <div key={device._id} className={`${bodyRow} grid-cols-12`}>
                    <div className="col-span-3 font-medium text-gray-800 dark:text-white">{device.model}</div>
                    <div className="col-span-2 text-gray-400 dark:text-slate-400 text-xs">{device.deviceId}</div>
                    <div className="col-span-2"><StatusBadge status={device.status} /></div>
                    <div className="col-span-3 text-gray-500 dark:text-slate-400 text-xs">{device.assignedToName || "—"}</div>
                    <div className="col-span-2 flex gap-2 justify-end flex-wrap">
                      {!isAdmin && (
                        <>
                          {device.status === "assigned" && device.assignedTo === userId && (
                            <>
                              <button onClick={() => handleReturnDevice(device._id)} className="bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/40 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Return</button>
                              <button onClick={() => setTransferDevice(device)} className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Transfer</button>
                            </>
                          )}
                          {device.status === "available" && (
                            <button onClick={() => handleRequestDevice(device._id)} className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Request</button>
                          )}
                          {(device.status === "pending" || (device.status === "assigned" && device.assignedTo !== userId)) && (
                            hasMyPendingRequest(device._id)
                              ? <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">⏳ In queue</span>
                              : <button onClick={() => handleRequestDevice(device._id)} className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Join Waitlist</button>
                          )}
                        </>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDeleteDevice(device._id)} className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition">Delete</button>
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
          <div className={`${card} overflow-hidden`}>
            {requests.length === 0
              ? <div className="p-12 text-center"><p className="text-gray-400">No requests yet</p></div>
              : <>
                  <div className={`${headerRow} grid-cols-12`}>
                    <div className="col-span-3">Device</div><div className="col-span-3">Requested By</div>
                    <div className="col-span-2">Date</div><div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  {requests.map((req) => (
                    <div key={req._id} className={`${bodyRow} grid-cols-12`}>
                      <div className="col-span-3 font-medium text-gray-800 dark:text-white">{req.deviceModel}</div>
                      <div className="col-span-3 text-gray-600 dark:text-slate-300">{req.employeeName}</div>
                      <div className="col-span-2 text-gray-400 text-xs">{new Date(req.createdAt).toLocaleDateString()}</div>
                      <div className="col-span-2"><ReqBadge status={req.status} /></div>
                      <div className="col-span-2 flex gap-2 justify-end">
                        {req.status === "pending" && (
                          <>
                            <button onClick={() => handleApprove(req._id)} className="bg-green-100 hover:bg-green-200 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Approve</button>
                            <button onClick={() => handleReject(req._id)} className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </>
            }
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: ADMIN USERS
        ══════════════════════════════════════════════ */}
        {activeTab === "users" && isAdmin && (
          <div className={`${card} overflow-hidden`}>
            {allUsers.length === 0
              ? <div className="p-12 text-center"><p className="text-gray-400">No users</p></div>
              : <>
                  <div className={`${headerRow} grid-cols-12`}>
                    <div className="col-span-3">Name</div><div className="col-span-4">Email</div>
                    <div className="col-span-2">Role</div><div className="col-span-3">Device</div>
                  </div>
                  {allUsers.map((user) => {
                    const assignedDevice = devices.find((d) => d.assignedTo === user._id)
                    return (
                      <div key={user._id} className={`${bodyRow} grid-cols-12`}>
                        <div className="col-span-3 font-medium text-gray-800 dark:text-white">{user.name}</div>
                        <div className="col-span-4 text-gray-500 dark:text-slate-400 text-xs">{user.email}</div>
                        <div className="col-span-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}`}>{user.role}</span>
                        </div>
                        <div className="col-span-3 text-gray-500 dark:text-slate-400 text-xs">{assignedDevice ? assignedDevice.model : "—"}</div>
                      </div>
                    )
                  })}
                </>
            }
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: MY REQUESTS
        ══════════════════════════════════════════════ */}
        {activeTab === "myrequests" && !isAdmin && (
          <div className={`${card} overflow-hidden`}>
            {myRequests.length === 0
              ? <div className="p-12 text-center"><p className="text-gray-400">No requests yet — go to Devices tab to request one</p></div>
              : <>
                  <div className={`${headerRow} grid-cols-12`}>
                    <div className="col-span-4">Device</div><div className="col-span-3">Type</div>
                    <div className="col-span-3">Date</div><div className="col-span-2">Status</div>
                  </div>
                  {myRequests.map((req) => (
                    <div key={req._id} className={`${bodyRow} grid-cols-12`}>
                      <div className="col-span-4 font-medium text-gray-800 dark:text-white">{req.deviceModel}</div>
                      <div className="col-span-3 text-gray-500 dark:text-slate-400 text-xs capitalize">{req.type}</div>
                      <div className="col-span-3 text-gray-400 text-xs">{new Date(req.createdAt).toLocaleDateString()}</div>
                      <div className="col-span-2"><ReqBadge status={req.status} /></div>
                    </div>
                  ))}
                </>
            }
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: INCOMING (requests for my device + transfers to me)
        ══════════════════════════════════════════════ */}
        {activeTab === "incoming" && !isAdmin && (
          <div className="space-y-6">
            {/* Requests for my device */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Requests for Your Device {incomingRequests.length > 0 && <span className="text-yellow-600">({incomingRequests.length})</span>}
              </h3>
              <div className={`${card} overflow-hidden`}>
                {incomingRequests.length === 0
                  ? <div className="p-8 text-center"><p className="text-gray-400 text-sm">No one has requested your device</p></div>
                  : <>
                      <div className={`${headerRow} grid-cols-12`}>
                        <div className="col-span-4">Device</div><div className="col-span-4">Requested By</div>
                        <div className="col-span-4 text-right">Actions</div>
                      </div>
                      {incomingRequests.map((req) => (
                        <div key={req._id} className={`${bodyRow} grid-cols-12`}>
                          <div className="col-span-4 font-medium text-gray-800 dark:text-white">{req.deviceModel}</div>
                          <div className="col-span-4 text-gray-600 dark:text-slate-300">{req.employeeName}</div>
                          <div className="col-span-4 flex gap-2 justify-end">
                            <button onClick={() => handleApprovePeer(req._id)} className="bg-green-100 hover:bg-green-200 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Approve</button>
                            <button onClick={() => handleDeclinePeer(req._id)} className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Decline</button>
                          </div>
                        </div>
                      ))}
                    </>
                }
              </div>
            </div>

            {/* Transfers offered to me */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Transfers Offered to You {incomingTransfers.length > 0 && <span className="text-purple-600">({incomingTransfers.length})</span>}
              </h3>
              <div className={`${card} overflow-hidden`}>
                {incomingTransfers.length === 0
                  ? <div className="p-8 text-center"><p className="text-gray-400 text-sm">No pending transfers for you</p></div>
                  : <>
                      <div className={`${headerRow} grid-cols-12`}>
                        <div className="col-span-4">Device</div><div className="col-span-4">From</div>
                        <div className="col-span-4 text-right">Actions</div>
                      </div>
                      {incomingTransfers.map((req) => (
                        <div key={req._id} className={`${bodyRow} grid-cols-12`}>
                          <div className="col-span-4 font-medium text-gray-800 dark:text-white">{req.deviceModel}</div>
                          <div className="col-span-4 text-gray-600 dark:text-slate-300">{req.employeeName}</div>
                          <div className="col-span-4 flex gap-2 justify-end">
                            <button onClick={() => handleAcceptTransfer(req._id)} className="bg-green-100 hover:bg-green-200 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Accept</button>
                            <button onClick={() => handleDeclineTransfer(req._id)} className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium transition">Decline</button>
                          </div>
                        </div>
                      ))}
                    </>
                }
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: NOTIFICATIONS
        ══════════════════════════════════════════════ */}
        {activeTab === "notifications" && (
          <div className={`${card} overflow-hidden`}>
            {notifications.length === 0
              ? <div className="p-12 text-center"><p className="text-gray-400">No notifications today</p></div>
              : notifications.map((n, idx) => (
                  <div key={n._id} className={`px-5 py-4 flex justify-between items-center text-sm ${idx !== notifications.length - 1 ? "border-b border-gray-100 dark:border-slate-700" : ""}`}>
                    <p className="text-gray-700 dark:text-slate-300">🔔 {n.message}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 ml-4 shrink-0">{new Date(n.createdAt).toLocaleTimeString()}</p>
                  </div>
                ))
            }
          </div>
        )}
      </div>

      {/* ── Transfer Modal ── */}
      {transferDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Transfer Device</h2>
            <p className="text-sm text-gray-400 dark:text-slate-400 mb-6">Transferring: <span className="font-medium text-gray-600 dark:text-slate-300">{transferDevice.model}</span></p>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Select Employee</label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className={`${inputClass} mb-6`}>
              <option value="">— Choose an employee —</option>
              {allEmployees.filter((u) => u._id !== userId).map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={handleTransferSubmit} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl flex-1 text-sm font-medium transition">Send Transfer Request</button>
              <button onClick={() => { setTransferDevice(null); setSelectedEmployee("") }} className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 px-5 py-3 rounded-xl text-sm transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard