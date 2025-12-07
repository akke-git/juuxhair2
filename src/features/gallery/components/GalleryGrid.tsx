import { Box, Typography, Grid } from '@mui/material'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import { SynthesisHistory, Member } from '../../../types'
import GalleryItem from './GalleryItem'

interface GalleryGridProps {
  items: SynthesisHistory[]
  members: Member[]
  onItemClick: (id: string) => void
}

export default function GalleryGrid({ items, members, onItemClick }: GalleryGridProps) {
  const getMemberName = (memberId?: string) => {
    if (!memberId) return undefined
    const member = members.find((m) => m.id === memberId)
    return member?.name
  }

  if (items.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 8,
          color: 'text.secondary',
        }}
      >
        <PhotoLibraryIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
        <Typography>합성 기록이 없습니다</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Style Gen 탭에서 스타일을 합성해보세요
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={1.5}>
      {items.map((item) => (
        <Grid item xs={6} key={item.id}>
          <GalleryItem
            item={item}
            memberName={getMemberName(item.member_id)}
            onClick={() => onItemClick(item.id)}
          />
        </Grid>
      ))}
    </Grid>
  )
}
