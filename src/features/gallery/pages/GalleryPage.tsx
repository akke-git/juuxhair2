import { useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress, IconButton } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useGallery } from '../hooks/useGallery'
import { useMembers } from '../../crm/hooks/useMembers'
import GalleryGrid from '../components/GalleryGrid'

export default function GalleryPage() {
  const navigate = useNavigate()
  const { history, isLoading, refetch } = useGallery()
  const { allMembers } = useMembers()

  const handleItemClick = (id: string) => {
    navigate(`/gallery/${id}`)
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
          갤러리
        </Typography>
        <IconButton onClick={() => refetch()}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <GalleryGrid
        items={history}
        members={allMembers}
        onItemClick={handleItemClick}
      />
    </Box>
  )
}
