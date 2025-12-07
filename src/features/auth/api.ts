import api from '../../services/api'
import {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  User,
} from '../../types'
import { storage } from '../../utils/storage'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/login', data)
    storage.setTokens(response.data.access_token, response.data.refresh_token)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/register', data)
    storage.setTokens(response.data.access_token, response.data.refresh_token)
    return response.data
  },

  loginWithGoogle: async (credential: string): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/login/google', { credential })
    storage.setTokens(response.data.access_token, response.data.refresh_token)
    return response.data
  },

  logout: async (): Promise<void> => {
    const refreshToken = storage.getRefreshToken()
    if (refreshToken) {
      try {
        await api.post('/logout', { refresh_token: refreshToken })
      } catch {
        // Ignore errors on logout
      }
    }
    storage.clearTokens()
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me')
    return response.data
  },

  refreshToken: async (): Promise<AuthTokens> => {
    const refreshToken = storage.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token')
    }
    const response = await api.post<AuthTokens>('/refresh', {
      refresh_token: refreshToken,
    })
    storage.setTokens(response.data.access_token, response.data.refresh_token)
    return response.data
  },
}
