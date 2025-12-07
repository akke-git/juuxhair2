import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import MemberForm from '../components/MemberForm'
import { useMembers, useMember } from '../hooks/useMembers'
import { CreateMemberRequest } from '../../../types'

export default function MemberDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: member, isLoading } = useMember(id!)
  const { updateMember, isUpdating } = useMembers()
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = async (data: CreateMemberRequest) => {
    if (id) {
      await updateMember(id, data)
      setIsEditing(false)
      navigate('/')
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
    </Box>
  )
}
