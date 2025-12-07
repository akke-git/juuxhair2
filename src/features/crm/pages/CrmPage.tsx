import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Fab,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import { useMembers } from '../hooks/useMembers'
import MemberCard from '../components/MemberCard'
import SearchBar from '../components/SearchBar'

export default function CrmPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { members, isLoading } = useMembers(searchQuery)

  const handleMemberClick = (id: string) => {
    navigate(`/members/${id}`)
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
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name or phone"
      />

      {members.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 8,
            color: 'text.secondary',
          }}
        >
          <PeopleOutlineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography>
            {searchQuery ? 'No results found' : 'No members yet'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Tap + to add a new member
          </Typography>
        </Box>
      ) : (
        <Box>
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onClick={() => handleMemberClick(member.id)}
            />
          ))}
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add member"
        onClick={() => navigate('/members/add')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'secondary.main',
          '&:hover': { bgcolor: 'secondary.dark' },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
