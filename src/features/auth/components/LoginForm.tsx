import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { LoginRequest } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'

export default function LoginForm() {
  const { login, loginError, isLoggingIn } = useAuth()
  const [showError, setShowError] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>()

  const onSubmit = (data: LoginRequest) => {
    setShowError(true)
    login(data)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      {showError && loginError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(loginError as Error).message || '로그인에 실패했습니다'}
        </Alert>
      )}

      <TextField
        fullWidth
        label="이메일"
        type="email"
        margin="normal"
        {...register('email', {
          required: '이메일을 입력해주세요',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '유효한 이메일을 입력해주세요',
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        fullWidth
        label="비밀번호"
        type="password"
        margin="normal"
        {...register('password', {
          required: '비밀번호를 입력해주세요',
          minLength: {
            value: 6,
            message: '비밀번호는 6자 이상이어야 합니다',
          },
        })}
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={isLoggingIn}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoggingIn ? <CircularProgress size={24} color="inherit" /> : '로그인'}
      </Button>
    </Box>
  )
}
