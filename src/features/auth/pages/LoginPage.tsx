import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Divider,
  Paper,
} from '@mui/material'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
import GoogleLoginButton from '../components/GoogleLoginButton'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export default function LoginPage() {
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={0} sx={{ width: '100%', p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            JuuxHair
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            AI 헤어스타일링 서비스
          </Typography>
        </Box>

        <GoogleLoginButton />

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            또는
          </Typography>
        </Divider>

        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          variant="fullWidth"
          sx={{ mb: 1 }}
        >
          <Tab label="로그인" />
          <Tab label="회원가입" />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          <LoginForm />
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <RegisterForm />
        </TabPanel>
      </Paper>
    </Container>
  )
}
