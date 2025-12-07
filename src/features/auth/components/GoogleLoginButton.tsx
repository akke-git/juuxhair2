import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { Box, Alert } from '@mui/material'
import { useAuth } from '../../../hooks/useAuth'

export default function GoogleLoginButton() {
  const { googleLogin, googleLoginError, isGoogleLoggingIn } = useAuth()

  const handleSuccess = (response: CredentialResponse) => {
    if (response.credential) {
      googleLogin(response.credential)
    }
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {googleLoginError && (
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          Google 로그인에 실패했습니다
        </Alert>
      )}

      <Box sx={{ opacity: isGoogleLoggingIn ? 0.5 : 1 }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.error('Google login failed')}
          useOneTap
          theme="outline"
          size="large"
          width="100%"
          text="signin_with"
          locale="ko"
        />
      </Box>
    </Box>
  )
}
