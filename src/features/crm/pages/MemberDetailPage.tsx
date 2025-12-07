import { useState, useEffect, useCallback } from 'react'
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
import MemberForm from '../components/MemberForm'
import { useMembers, useMember } from '../hooks/useMembers'
import { CreateMemberRequest } from '../../../types'

export default function MemberDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: member, isLoading } = useMember(id!)
  const { updateMember, deleteMember, isUpdating, isDeleting } = useMembers()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleSubmit = async (data: CreateMemberRequest) => {
    if (id) {
      await updateMember(id, data)
      setIsEditing(false)
      navigate('/')
    }
  }

  const handleDelete = async () => {
    if (id) {
      try {
        await deleteMember(id)
        navigate('/')
      } catch (error) {
        console.error('Failed to delete member:', error)
      }
    }
  }

  const toggleEdit = useCallback(() => {
    setIsEditing((prev) => !prev)
  }, [])

  // Expose edit toggle function globally for Layout to access
  useEffect(() => {
    (window as unknown as { toggleMemberEdit?: () => void }).toggleMemberEdit = toggleEdit
    return () => {
      (window as unknown as { toggleMemberEdit?: () => void }).toggleMemberEdit = undefined
    }
  }, [toggleEdit])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!member) {
    return (
      <Box sx={{ textAlign: 'center', pt: 4 }}>
        <Typography>Member not found</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <MemberForm
        initialData={member}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
        readOnly={!isEditing}
      />

      <Box sx={{ mt: 4, px: 2, pb: 4 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
        >
          멤버 삭제
        </Button>
      </Box>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>멤버 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 이 멤버를 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </Typography>
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
