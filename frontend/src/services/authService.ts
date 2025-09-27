import { apiClient } from './api'
import { User, APIResponse } from '../types'

interface LoginResponse {
  user: User
  token: string
  message: string
}

interface RegisterResponse {
  user: User
  token: string
  message: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      email,
      password
    })
    
    apiClient.setToken(response.token)
    return response
  },

  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', {
      name,
      email,
      password
    })
    
    apiClient.setToken(response.token)
    return response
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout')
    apiClient.setToken(null)
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/api/auth/me')
    return response.user
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<{ user: User }>('/api/auth/profile', data)
    return response.user
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    })
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/api/auth/refresh')
    apiClient.setToken(response.token)
    return response
  }
}
