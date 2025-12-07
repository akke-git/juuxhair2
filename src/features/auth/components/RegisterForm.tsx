import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { RegisterRequest } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'

export default function RegisterForm() {
  const { register: registerUser, registerError, isRegistering } = useAuth()
  const [showError, setShowError] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest & { confirmPassword: string }>()

  const password = watch('password')

  const onSubmit = (data: RegisterRequest) => {
    setShowError(true)
    registerUser(data)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      {showError && registerError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(registerError as Error).message || '회원가입에 실패했습니다'}
        </Alert>
      )}

      <TextField
        fullWidth
        label="이름"
        margin="normal"
        {...register('username', {
          required: '이름을 입력해주세요',
          minLength: {
            value: 2,
            message: '이름은 2자 이상이어야 합니다',
          },
        })}
        error={!!errors.username}
        helperText={errors.username?.message}
      />

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

      <TextField
        fullWidth
        label="비밀번호 확인"
        type="password"
        margin="normal"
        {...register('confirmPassword', {
          required: '비밀번호를 다시 입력해주세요',
          validate: (value) =>
            value === password || '비밀번호가 일치하지 않습니다',
        })}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={isRegistering}
        sx={{ mt: 3, mb: 2 }}
      >
        {isRegistering ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          '회원가입'
        )}
      </Button>
    </Box>
  )
}
