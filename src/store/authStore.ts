import { create } from 'zustand'
import { User } from '../types'
import { storage } from '../utils/storage'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setAuthenticated: (value: boolean) => void
  setLoading: (value: boolean) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: storage.hasTokens(),
  isLoading: false,

  setUser: (user) => set({ user }),

  setAuthenticated: (value) => set({ isAuthenticated: value }),

  setLoading: (value) => set({ isLoading: value }),

  logout: () => {
    storage.clearTokens()
    set({ user: null, isAuthenticated: false })
  },

  initialize: () => {
    const hasTokens = storage.hasTokens()
    set({ isAuthenticated: hasTokens })
  },
}))
