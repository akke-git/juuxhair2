import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Link,
  Stack,
} from '@mui/material'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
      {/* Main Login Card */}
      <Paper variant="outlined" sx={{ p: 4, mb: 1.5, textAlign: 'center', bgcolor: '#fff', borderRadius: 1, borderColor: '#dbdbdb' }}>
        <Typography variant="h3" component="h1" sx={{ fontFamily: 'cursive', mb: 4, letterSpacing: -1 }}>
          juux
        </Typography>

        {isLogin ? <LoginForm /> : <RegisterForm />}
      </Paper>

      {/* Switch Card */}
      <Paper variant="outlined" sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fff', borderRadius: 1, borderColor: '#dbdbdb' }}>
        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            {isLogin ? "Don't have an account?" : "Have an account?"}
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={() => setIsLogin(!isLogin)}
            sx={{ fontWeight: 'bold', color: '#0095F6', textDecoration: 'none', fontSize: '14px' }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </Link>
        </Stack>
      </Paper>
    </Container>
  )
}
