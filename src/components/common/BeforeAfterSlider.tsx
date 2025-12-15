import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { Box, Typography } from '@mui/material'

interface BeforeAfterSliderProps {
  originalImage: string
  resultImage: string
  aspectRatio?: string
}

export default function BeforeAfterSlider({
  originalImage,
  resultImage,
  aspectRatio = '3/4',
}: BeforeAfterSliderProps) {
  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: aspectRatio,
        bgcolor: 'grey.100',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={originalImage}
            alt="Original"
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={resultImage}
            alt="Result"
          />
        }
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Labels */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          bgcolor: 'rgba(0,0,0,0.5)',
          color: 'white',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        Before
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          bgcolor: 'rgba(0,0,0,0.5)',
          color: 'white',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        After
      </Box>
    </Box>
  )
}
