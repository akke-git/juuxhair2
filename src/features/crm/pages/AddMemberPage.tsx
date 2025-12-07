import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import MemberForm from '../components/MemberForm'
import { useMembers } from '../hooks/useMembers'
import { CreateMemberRequest } from '../../../types'

export default function AddMemberPage() {
  const navigate = useNavigate()
  const { createMember, isCreating } = useMembers()

  const handleSubmit = async (data: CreateMemberRequest) => {
    await createMember(data)
    navigate('/')
  }

  return (
    <Box>
      <MemberForm
        onSubmit={handleSubmit}
        isLoading={isCreating}
      />
    </Box>
  )
}
