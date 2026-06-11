import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { loginUser } from "../services/authService"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate()


  const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    const user = await loginUser({
      email,
      password,
    })

    localStorage.setItem(
      "userInfo",
      JSON.stringify(user)
    )

    toast.success("Login successful")

    navigate("/dashboard")
  } catch (error) {
    toast.error("Invalid credentials")
  }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-xl"
        >
          Login
        </button>
      </form>
    </div>
  )
}

export default Login
