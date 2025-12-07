import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Card,
  CardActionArea,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import StyleCarousel from '../components/StyleCarousel'
import { useCameraStore } from '../store/cameraStore'
import { useSynthesis } from '../hooks/useSynthesis'
import { useMembers } from '../../crm/hooks/useMembers'
import { Member } from '../../../types'

type SourceTab = 'member' | 'photo' | 'camera'

export default function CameraPage() {
  const navigate = useNavigate()
  const [sourceTab, setSourceTab] = useState<SourceTab>('member')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { allMembers } = useMembers()
  const {
    selectedImage,
    selectedStyle,
    isProcessing,
    selectedMember,
    selectedImagePreview,
    setSelectedMember,
    setSelectedImage,
  } = useCameraStore()
  const synthesisMutation = useSynthesis()

  const canSynthesize = selectedImage && selectedStyle && !isProcessing

  const handleSynthesize = async () => {
    if (!selectedImage || !selectedStyle) return

    try {
      await synthesisMutation.mutateAsync({
        image: selectedImage,
        styleId: selectedStyle.id,
      })
      navigate('/camera/result')
    } catch (error) {
      console.error('Synthesis failed:', error)
    }
  }

  const getPhotoUrl = (photoPath?: string) => {
    if (!photoPath) return undefined
    if (photoPath.startsWith('http') || photoPath.startsWith('data:')) return photoPath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${photoPath}`
  }

  const handleMemberSelect = (member: Member) => {
    console.log('Member selected:', member)
    setSelectedMember(member)
    if (member.photo_path) {
      const photoUrl = getPhotoUrl(member.photo_path)!
      console.log('Photo URL:', photoUrl)
      // Set preview immediately
      setSelectedImage(null, photoUrl)
      console.log('Preview set')
      // Try to fetch the file for synthesis
      fetch(photoUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'member.jpg', { type: 'image/jpeg' })
          setSelectedImage(file, photoUrl)
          console.log('File fetched and set')
        })
        .catch((err) => {
          console.log('Failed to fetch member photo:', err)
        })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(file, reader.result as string)
        setSelectedMember(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTabChange = (_: React.MouseEvent<HTMLElement>, newValue: SourceTab | null) => {
    if (newValue) {
      setSourceTab(newValue)
      if (newValue === 'photo') {
        fileInputRef.current?.click()
      } else if (newValue === 'camera') {
        cameraInputRef.current?.click()
      }
    }
  }

  return (
    <Box>
      {synthesisMutation.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          합성에 실패했습니다. 다시 시도해주세요.
        </Alert>
      )}

      {/* Source Tab Selector */}
      <ToggleButtonGroup
        value={sourceTab}
        exclusive
        onChange={handleTabChange}
        fullWidth
        sx={{
          mb: 2,
          bgcolor: 'grey.100',
          borderRadius: 3,
          p: 0.5,
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            borderRadius: '20px !important',
            mx: 0.25,
            py: 1,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          },
        }}
      >
        <ToggleButton value="member">
          <PersonIcon sx={{ mr: 0.5, fontSize: 18 }} />
          member
        </ToggleButton>
        <ToggleButton value="photo">
          <PhotoLibraryIcon sx={{ mr: 0.5, fontSize: 18 }} />
          photo
        </ToggleButton>
        <ToggleButton value="camera">
          <CameraAltIcon sx={{ mr: 0.5, fontSize: 18 }} />
          camera
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFileSelect}
      />

      {/* Member List (shown when member tab is selected) */}
      {sourceTab === 'member' && (
        <Box sx={{ mb: 2 }}>
          {allMembers.filter((m) => m.photo_path).length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              등록된 고객이 없습니다
            </Typography>
          ) : (
            allMembers
              .filter((m) => m.photo_path)
              .map((member) => (
                <Card
                  key={member.id}
                  sx={{
                    mb: 1.5,
                    borderRadius: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    border: selectedMember?.id === member.id ? '2px solid' : '1px solid',
                    borderColor: selectedMember?.id === member.id ? 'primary.main' : 'grey.200',
                  }}
                >
                  <CardActionArea
                    onClick={() => handleMemberSelect(member)}
                    sx={{ p: 1.5 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={getPhotoUrl(member.photo_path)}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.phone}
                        </Typography>
                      </Box>
                      <ChevronRightIcon sx={{ color: 'grey.400' }} />
                    </Box>
                  </CardActionArea>
                </Card>
              ))
          )}
        </Box>
      )}

      {/* Photo/Camera Preview or Placeholder */}
      {(sourceTab === 'photo' || sourceTab === 'camera') && (
        <Box
          onClick={() => {
            if (sourceTab === 'photo') fileInputRef.current?.click()
            else cameraInputRef.current?.click()
          }}
          sx={{
            width: '100%',
            aspectRatio: '3/4',
            bgcolor: 'grey.100',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            mb: 2,
            cursor: 'pointer',
          }}
        >
          {selectedImagePreview ? (
            <img
              src={selectedImagePreview}
              alt="Selected"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              {sourceTab === 'photo' ? (
                <>
                  <PhotoLibraryIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography>탭하여 사진 선택</Typography>
                </>
              ) : (
                <>
                  <CameraAltIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography>탭하여 카메라 촬영</Typography>
                </>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Style Carousel */}
      {selectedImagePreview && <StyleCarousel />}

      {/* Synthesize Button */}
      {selectedImagePreview && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={
            isProcessing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <AutoFixHighIcon />
            )
          }
          disabled={!canSynthesize}
          onClick={handleSynthesize}
          sx={{
            mt: 3,
            py: 1.5,
            bgcolor: 'black',
            '&:hover': { bgcolor: 'grey.900' },
            borderRadius: 2,
          }}
        >
          {isProcessing ? 'AI 합성 중...' : 'AI 스타일 합성'}
        </Button>
      )}
    </Box>
  )
}
