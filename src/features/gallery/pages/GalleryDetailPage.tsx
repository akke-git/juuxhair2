import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from 'react'
import { useGalleryItem, useGallery } from '../hooks/useGallery'
import { useMembers } from '../../crm/hooks/useMembers'

export default function GalleryDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { data: item, isLoading } = useGalleryItem(id!)
  const { deleteItem, isDeleting } = useGallery()
  const { allMembers } = useMembers()

  const getMemberName = (memberId?: string) => {
    if (!memberId) return undefined
    const member = allMembers.find((m) => m.id === memberId)
    return member?.name
  }

  const getImageUrl = (path?: string) => {
    if (!path) return undefined
    if (path.startsWith('http') || path.startsWith('data:')) return path
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${path}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = async () => {
    if (id) {
      await deleteItem(id)
      navigate('/gallery')
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!item) {
    return (
      <Box sx={{ textAlign: 'center', pt: 4 }}>
        <Typography>기록을 찾을 수 없습니다</Typography>
        <Button onClick={() => navigate('/gallery')} sx={{ mt: 2 }}>
          돌아가기
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Result Image */}
      <Box
        sx={{
          width: '100%',
          aspectRatio: '3/4',
          bgcolor: 'grey.100',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <img
          src={getImageUrl(item.result_photo_path)}
          alt="Synthesis result"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      {/* Details */}
      <Box sx={{ px: 1 }}>
        {item.member_id && (
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>고객:</strong> {getMemberName(item.member_id) || '알 수 없음'}
          </Typography>
        )}
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>스타일:</strong> {item.reference_style_id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(item.created_at)}
        </Typography>
      </Box>

      <Box sx={{ mt: 3, px: 1 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
        >
          삭제하기
        </Button>
      </Box>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>기록 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 기록을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
