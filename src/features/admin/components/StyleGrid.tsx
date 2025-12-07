import { Box, Grid, IconButton, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import StyleIcon from '@mui/icons-material/Style'
import { Style } from '../../../types'

interface StyleGridProps {
  styles: Style[]
  onDelete: (id: string) => void
}

export default function StyleGrid({ styles, onDelete }: StyleGridProps) {
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${imageUrl}`
  }

  if (!styles || !Array.isArray(styles) || styles.length === 0) {
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
        <StyleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
        <Typography>등록된 스타일이 없습니다</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          + 버튼을 눌러 스타일을 추가하세요
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={1.5}>
      {styles.map((style) => (
        <Grid item xs={4} key={style.id}>
          <Box
            sx={{
              position: 'relative',
              aspectRatio: '3/4',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'grey.100',
            }}
          >
            <img
              src={getImageUrl(style.image_url)}
              alt={style.name || style.id}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <IconButton
              size="small"
              onClick={() => onDelete(style.id)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              }}
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
            {style.name && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                }}
              >
                <Typography variant="caption" noWrap>
                  {style.name}
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}
