import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../features/auth/api'
import { useAuthStore } from '../store/authStore'
import { LoginRequest, RegisterRequest } from '../types'

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setUser, setAuthenticated, logout: storeLogout } = useAuthStore()

  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: useAuthStore.getState().isAuthenticated,
    retry: false,
    staleTime: Infinity,
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async () => {
      setAuthenticated(true)
      const user = await authApi.getCurrentUser()
      setUser(user)
      queryClient.setQueryData(['currentUser'], user)
      navigate('/')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: async () => {
      setAuthenticated(true)
      const user = await authApi.getCurrentUser()
      setUser(user)
      queryClient.setQueryData(['currentUser'], user)
      navigate('/')
    },
  })

  const googleLoginMutation = useMutation({
    mutationFn: (credential: string) => authApi.loginWithGoogle(credential),
    onSuccess: async () => {
      setAuthenticated(true)
      const user = await authApi.getCurrentUser()
      setUser(user)
      queryClient.setQueryData(['currentUser'], user)
      navigate('/')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      storeLogout()
      queryClient.clear()
      navigate('/login')
    },
  })

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    googleLogin: googleLoginMutation.mutate,
    googleLoginError: googleLoginMutation.error,
    isGoogleLoggingIn: googleLoginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}
