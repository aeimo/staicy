import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User, AuthState } from '../types'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'LOGOUT' }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, isLoading: false }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: {
    id: 'demo-user',
    email: 'demo@staicy.com',
    name: 'Demo User',
    role: 'ADMIN',
    teams: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  token: 'demo-token',
  isAuthenticated: true,
  isLoading: false
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const user = await authService.getCurrentUser()
          dispatch({ type: 'SET_USER', payload: user })
          dispatch({ type: 'SET_TOKEN', payload: token })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({ type: 'LOGOUT' })
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await authService.login(email, password)
      
      localStorage.setItem('token', response.token)
      dispatch({ type: 'SET_USER', payload: response.user })
      dispatch({ type: 'SET_TOKEN', payload: response.token })
      
      toast.success('Login successful!')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await authService.register(name, email, password)
      
      localStorage.setItem('token', response.token)
      dispatch({ type: 'SET_USER', payload: response.user })
      dispatch({ type: 'SET_TOKEN', payload: response.token })
      
      toast.success('Registration successful!')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data)
      dispatch({ type: 'SET_USER', payload: updatedUser })
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
      throw error
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
