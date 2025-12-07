import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Container,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import SettingsIcon from '@mui/icons-material/Settings'
import { useAuthStore } from '../../store/authStore'

const DRAWER_WIDTH = 280

const navItems = [
  { label: 'Members', icon: <PeopleIcon />, path: '/' },
  { label: 'Style Gen', icon: <CameraAltIcon />, path: '/camera' },
  { label: 'Gallery', icon: <PhotoLibraryIcon />, path: '/gallery' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/admin' },
]

const getPageTitle = (pathname: string) => {
  if (pathname === '/') return 'Members'
  if (pathname === '/members/add') return 'New Member'
  if (pathname.startsWith('/members/')) return 'Member Detail'
  if (pathname.startsWith('/camera')) return 'Style Gen'
  if (pathname.startsWith('/gallery/')) return 'Gallery Detail'
  if (pathname.startsWith('/gallery')) return 'Gallery'
  if (pathname.startsWith('/admin')) return 'Settings'
  return 'JuuxHair'
}

const isSubPage = (pathname: string) => {
  return pathname === '/members/add' ||
    (pathname.startsWith('/members/') && pathname !== '/members') ||
    (pathname.startsWith('/gallery/') && pathname !== '/gallery') ||
    pathname === '/camera/result'
}

const isMemberDetailPage = (pathname: string) => {
  return pathname.startsWith('/members/') && pathname !== '/members' && pathname !== '/members/add'
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  const handleNavigation = (path: string) => {
    navigate(path)
    setDrawerOpen(false)
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/members')
    }
    return location.pathname.startsWith(path)
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Profile Header */}
      <Box
        sx={{
          bgcolor: '#000',
          color: '#fff',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: '#fff',
            color: '#000',
          }}
        >
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
          {user?.username || 'User'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {user?.email || 'user@example.com'}
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                py: 1.5,
                px: 2.5,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '1rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: 480,
        mx: 'auto',
        bgcolor: 'background.default',
      }}
    >
      {/* AppBar with Hamburger Menu or Back Button */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Toolbar>
          {isSubPage(location.pathname) ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={() => navigate(-1)}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" fontWeight={600} sx={{ flexGrow: 1 }}>
            {getPageTitle(location.pathname)}
          </Typography>
          {isMemberDetailPage(location.pathname) && (
            <IconButton
              color="inherit"
              aria-label="edit"
              onClick={() => {
                const toggleEdit = (window as unknown as { toggleMemberEdit?: () => void }).toggleMemberEdit
                if (toggleEdit) toggleEdit()
              }}
            >
              <EditIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            maxWidth: '80%',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Container
        component="main"
        sx={{
          flex: 1,
          py: 2,
          px: 2,
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Container>
    </Box>
  )
}
