import { useState } from 'react'
import {
  Box,
  Typography,
  Fab,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAdminStyles } from '../hooks/useStyles'
import { useAuth } from '../../../hooks/useAuth'
import StyleGrid from '../components/StyleGrid'
import AddStyleDialog from '../components/AddStyleDialog'

export default function AdminPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const { styles, isLoading, refetch, uploadStyle, isUploading, deleteStyle, isDeleting } =
    useAdminStyles()
  const { user, logout, isLoggingOut } = useAuth()

  const handleUpload = async (file: File, name?: string) => {
    await uploadStyle(file, name)
  }

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteStyle(deleteTarget)
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          설정
        </Typography>
        <IconButton onClick={() => refetch()}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* User Info */}
      {user && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            로그인 계정
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {user.email}
          </Typography>
          <Button
            startIcon={isLoggingOut ? <CircularProgress size={16} /> : <LogoutIcon />}
            onClick={() => logout()}
            disabled={isLoggingOut}
            size="small"
            sx={{ mt: 1 }}
          >
            로그아웃
          </Button>
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Style Management */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        헤어스타일 관리
      </Typography>

      <StyleGrid styles={styles} onDelete={(id) => setDeleteTarget(id)} />

      <Fab
        color="secondary"
        aria-label="add style"
        onClick={() => setAddDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          maxWidth: 480,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Style Dialog */}
      <AddStyleDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>스타일 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 스타일을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
