import Dashboard from "./pages/Dashboard"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Dashboard />
      <ToastContainer position="top-right" />
    </div>
  )
}

export default App