import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  Typography,
  Link,
} from '@mui/material'
import { LoginRequest } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'
import GoogleLoginButton from './GoogleLoginButton'

export default function LoginForm() {
  const { login, loginError, isLoggingIn } = useAuth()
  const [showError, setShowError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      {showError && loginError && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
          {(loginError as Error).message || '로그인에 실패했습니다'}
        </Alert>
      )}

      <TextField
        fullWidth
        placeholder="Phone number, username, or email"
        type="email"
        size="small"
        sx={{
          mb: 1,
          '& .MuiOutlinedInput-root': {
            bgcolor: '#FAFAFA',
            '& fieldset': { borderColor: '#dbdbdb' },
            '&:hover fieldset': { borderColor: '#dbdbdb' },
            '&.Mui-focused fieldset': { borderColor: '#a8a8a8' },
            fontSize: '12px',
          },
          '& input': { p: 1.5 },
        }}
        {...register('email', {
          required: '이메일을 입력해주세요',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '유효한 이메일을 입력해주세요',
          },
        })}
        error={!!errors.email}
      />

      <TextField
        fullWidth
        placeholder="Password"
        type={showPassword ? 'text' : 'password'}
        size="small"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: '#FAFAFA',
            '& fieldset': { borderColor: '#dbdbdb' },
            '&:hover fieldset': { borderColor: '#dbdbdb' },
            '&.Mui-focused fieldset': { borderColor: '#a8a8a8' },
            fontSize: '12px',
          },
          '& input': { p: 1.5 },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button
                onClick={() => setShowPassword(!showPassword)}
                sx={{
                  minWidth: 0,
                  p: 0,
                  fontWeight: 'bold',
                  color: '#262626',
                  textTransform: 'none',
                  fontSize: '12px',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </InputAdornment>
          ),
        }}
        {...register('password', {
          required: '비밀번호를 입력해주세요',
        })}
        error={!!errors.password}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoggingIn}
        sx={{
          mt: 1,
          mb: 2,
          bgcolor: '#0095F6',
          fontWeight: 'bold',
          textTransform: 'none',
          boxShadow: 'none',
          fontSize: '14px',
          '&:hover': { bgcolor: '#1877F2', boxShadow: 'none' },
        }}
      >
        {isLoggingIn ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Divider sx={{ flex: 1, borderColor: '#dbdbdb' }} />
        <Typography
          variant="caption"
          sx={{ mx: 2, fontWeight: 'bold', color: '#8e8e8e', fontSize: '13px' }}
        >
          OR
        </Typography>
        <Divider sx={{ flex: 1, borderColor: '#dbdbdb' }} />
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <GoogleLoginButton />
      </Box>

      <Link href="#" underline="none" sx={{ color: '#00376B', fontSize: '12px' }}>
        Forgot password?
      </Link>
    </Box>
  )
}
