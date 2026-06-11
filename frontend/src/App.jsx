import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
      </Routes>

      <ToastContainer position="top-right" />
    </BrowserRouter>
  )
}

export default App