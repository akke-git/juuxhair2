import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useCameraStore } from '../store/cameraStore'
import { useSaveResult } from '../hooks/useSynthesis'
import BeforeAfterSlider from '../../../components/common/BeforeAfterSlider'

export default function ResultPage() {
  const navigate = useNavigate()
  const {
    selectedMember,
    selectedImagePreview,
    selectedStyle,
    resultImage,
    reset,
  } = useCameraStore()
  const saveResultMutation = useSaveResult()

  const handleSave = async () => {
    if (!resultImage || !selectedStyle || !selectedImagePreview) return

    try {
      await saveResultMutation.mutateAsync({
        memberId: selectedMember?.id,
        originalPath: selectedImagePreview,
        styleId: selectedStyle.id,
        resultImage: resultImage,
      })
      reset()
      navigate('/gallery')
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handleReset = () => {
    reset()
    navigate('/camera')
  }

  if (!resultImage) {
    return (
      <Box sx={{ textAlign: 'center', pt: 4 }}>
        <Typography>결과가 없습니다</Typography>
        <Button onClick={() => navigate('/camera')} sx={{ mt: 2 }}>
          돌아가기
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          합성 결과
        </Typography>
      </Box>

      {saveResultMutation.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          저장에 실패했습니다. 다시 시도해주세요.
        </Alert>
      )}

      {/* Before/After Slider */}
      <Box sx={{ mb: 3 }}>
        <BeforeAfterSlider
          originalImage={selectedImagePreview || ''}
          resultImage={`data:image/png;base64,${resultImage}`}
        />
        <Typography
          variant="caption"
          align="center"
          display="block"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          좌우로 드래그하여 비교해보세요
        </Typography>
      </Box>

      {selectedMember && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          고객: {selectedMember.name}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
        >
          다시하기
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={
            saveResultMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          onClick={handleSave}
          disabled={saveResultMutation.isPending}
        >
          저장
        </Button>
      </Box>
    </Box>
  )
}
