import { Typography, Card, CardContent, CardMedia } from '@mui/material'
import { SynthesisHistory } from '../../../types'

interface GalleryItemProps {
  item: SynthesisHistory
  memberName?: string
  onClick: () => void
}

export default function GalleryItem({ item, memberName, onClick }: GalleryItemProps) {
  const getImageUrl = (path?: string) => {
    if (!path) return undefined
    if (path.startsWith('http') || path.startsWith('data:')) return path
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${path}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': { boxShadow: 4 },
        transition: 'box-shadow 0.2s',
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        height="160"
        image={getImageUrl(item.result_photo_path)}
        alt="Synthesis result"
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        {memberName && (
          <Typography variant="body2" fontWeight={600} noWrap>
            {memberName}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {formatDate(item.created_at)}
        </Typography>
      </CardContent>
    </Card>
  )
}
