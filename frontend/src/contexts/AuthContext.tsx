import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'USER' | 'ADMIN' | 'DELIVERY'
  referralCode: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  referralCode: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Fetch user profile
  const { isLoading } = useQuery(
    ['user', token],
    async () => {
      if (!token) return null
      const response = await axios.get('/api/auth/profile')
      return response.data.user
    },
    {
      enabled: !!token,
      onSuccess: (data) => {
        setUser(data)
      },
      onError: () => {
        logout()
      }
    }
  )

  // Login mutation
  const loginMutation = useMutation(
    async ({ email, password }: { email: string; password: string }) => {
      const response = await axios.post('/api/auth/login', { email, password })
      return response.data
    },
    {
      onSuccess: (data) => {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        toast.success('Login successful!')
        if (data.user.role === 'DELIVERY') {
          navigate('/delivery', { replace: true })
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Login failed')
      }
    }
  )

  // Register mutation
  const registerMutation = useMutation(
    async (userData: RegisterData) => {
      const response = await axios.post('/api/auth/register', userData)
      return response.data
    },
    {
      onSuccess: (data) => {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        toast.success('Registration successful!')
        if (data.user.role === 'DELIVERY') {
          navigate('/delivery', { replace: true })
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Registration failed')
      }
    }
  )

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }

  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    queryClient.clear()
    toast.success('Logged out successfully')
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    isLoading: isLoading || loginMutation.isLoading || registerMutation.isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 