import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const email = localStorage.getItem('email')
    return token ? { token, role, email } : null
  })

  async function login(email, password) {
    const form = new FormData()
    form.append('username', email)
    form.append('password', password)
    const res = await api.post('/auth/login', form)
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('role', res.data.role)
    localStorage.setItem('email', email)
    setUser({ token: res.data.access_token, role: res.data.role, email })
    return res.data.role
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('email')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
