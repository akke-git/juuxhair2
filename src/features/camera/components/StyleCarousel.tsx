import { useEffect } from 'react'
import { Box, Typography, IconButton, CircularProgress } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Style } from '../../../types'
import { useCameraStore } from '../store/cameraStore'
import { useStyles } from '../hooks/useSynthesis'

export default function StyleCarousel() {
  const { data: styles, isLoading, error } = useStyles()
  const { selectedStyle, setSelectedStyle } = useCameraStore()

  const getStyleImageUrl = (style: Style) => {
    if (style.image_url.startsWith('http')) return style.image_url
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${style.image_url}`
  }

  // Auto-select first style
  useEffect(() => {
    if (styles && Array.isArray(styles) && styles.length > 0 && !selectedStyle) {
      setSelectedStyle(styles[0])
    }
  }, [styles, selectedStyle, setSelectedStyle])

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('style-carousel')
    if (container) {
      const scrollAmount = direction === 'left' ? -120 : 120
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          스타일을 불러올 수 없습니다
        </Typography>
      </Box>
    )
  }

  if (!styles || !Array.isArray(styles) || styles.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          등록된 스타일이 없습니다
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        스타일 선택
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {styles.length > 3 && (
          <IconButton size="small" onClick={() => handleScroll('left')}>
            <ChevronLeftIcon />
          </IconButton>
        )}

        <Box
          id="style-carousel"
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            flex: 1,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            py: 1,
          }}
        >
          {styles.map((style) => (
            <Box
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              sx={{
                flexShrink: 0,
                width: 100,
                height: 140,
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                border: 3,
                borderColor:
                  selectedStyle?.id === style.id ? 'secondary.main' : 'transparent',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor:
                    selectedStyle?.id === style.id ? 'secondary.main' : 'grey.300',
                },
              }}
            >
              <img
                src={getStyleImageUrl(style)}
                alt={style.name || style.id}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Box>

        {styles.length > 3 && (
          <IconButton size="small" onClick={() => handleScroll('right')}>
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>

      {selectedStyle && (
        <Typography variant="body2" color="secondary" sx={{ mt: 1 }}>
          선택된 스타일: {selectedStyle.name || selectedStyle.id}
        </Typography>
      )}
    </Box>
  )
}
