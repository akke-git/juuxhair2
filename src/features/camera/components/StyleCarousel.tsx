import { useEffect, useState, useMemo } from 'react'
import { Box, Typography, IconButton, CircularProgress, Chip, Tabs, Tab } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Style } from '../../../types'
import { useCameraStore } from '../store/cameraStore'
import { useStyles } from '../hooks/useSynthesis'

export default function StyleCarousel() {
  const { data: styles, isLoading, error } = useStyles()
  const { selectedStyle, setSelectedStyle } = useCameraStore()
  const [selectedGender, setSelectedGender] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const getStyleImageUrl = (style: Style) => {
    if (!style.image_url) return ''
    if (style.image_url.startsWith('http')) return style.image_url
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${style.image_url}`
  }

  // Extract unique tags from styles
  const allTags = useMemo(() => {
    if (!styles) return []
    const tags = new Set<string>()
    styles.forEach(style => {
      style.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [styles])

  // Filter styles
  const filteredStyles = useMemo(() => {
    if (!styles) return []
    return styles.filter(style => {
      // Gender filter
      if (selectedGender !== 'all') {
        // If gender is neutral, show in both? Or specific logic. 
        // Let's say neutral shows in all, but if specific gender selected, show specific + neutral
        if (style.gender !== 'neutral' && style.gender !== selectedGender) return false
      }
      
      // Tag filter
      if (selectedTag) {
        if (!style.tags?.includes(selectedTag)) return false
      }
      
      return true
    })
  }, [styles, selectedGender, selectedTag])

  // Auto-select first style when list changes or initial load
  useEffect(() => {
    if (filteredStyles.length > 0 && (!selectedStyle || !filteredStyles.find(s => s.id === selectedStyle.id))) {
      setSelectedStyle(filteredStyles[0])
    } else if (filteredStyles.length === 0) {
      setSelectedStyle(null) // Clear selection if no matches
    }
  }, [filteredStyles, selectedStyle, setSelectedStyle])

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
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        스타일 선택
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={selectedGender}
          onChange={(_, val) => setSelectedGender(val)}
          variant="fullWidth"
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ minHeight: 36, mb: 1, '& .MuiTab-root': { py: 0.5, minHeight: 36, fontSize: '0.85rem' } }}
        >
          <Tab value="all" label="전체" />
          <Tab value="female" label="여성" />
          <Tab value="male" label="남성" />
        </Tabs>

        {allTags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, px: 0.5, 
            scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } 
          }}>
            <Chip 
              label="전체 태그" 
              size="small" 
              onClick={() => setSelectedTag(null)}
              color={selectedTag === null ? "secondary" : "default"}
              variant={selectedTag === null ? "filled" : "outlined"}
            />
            {allTags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                color={tag === selectedTag ? "secondary" : "default"}
                variant={tag === selectedTag ? "filled" : "outlined"}
              />
            ))}
          </Box>
        )}
      </Box>

      {filteredStyles.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            조건에 맞는 스타일이 없습니다
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {filteredStyles.length > 3 && (
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
            {filteredStyles.map((style) => (
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
                  position: 'relative'
                }}
              >
                <img
                  src={getStyleImageUrl(style)}
                  alt={style.name || style.id}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Optional: Show badges/tags on thumbnail */}
              </Box>
            ))}
          </Box>

          {filteredStyles.length > 3 && (
            <IconButton size="small" onClick={() => handleScroll('right')}>
              <ChevronRightIcon />
            </IconButton>
          )}
        </Box>
      )}

      {selectedStyle && (
        <Typography variant="body2" color="secondary" sx={{ mt: 1 }}>
          선택된 스타일: {selectedStyle.name || selectedStyle.id} 
          {selectedStyle.tags && selectedStyle.tags.length > 0 && ` (${selectedStyle.tags.join(', ')})`}
        </Typography>
      )}
    </Box>
  )
}
