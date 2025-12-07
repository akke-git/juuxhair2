import { useRef } from 'react'
import {
  Box,
  Button,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import { Member } from '../../../types'
import { useCameraStore } from '../store/cameraStore'

interface ImageSourceSelectorProps {
  members: Member[]
  memberSelectOpen: boolean
  onMemberSelectOpen: () => void
  onMemberSelectClose: () => void
}

export default function ImageSourceSelector({
  members,
  memberSelectOpen,
  onMemberSelectOpen,
  onMemberSelectClose,
}: ImageSourceSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    selectedMember,
    selectedImagePreview,
    setSelectedMember,
    setSelectedImage,
  } = useCameraStore()

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

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member)
    if (member.photo_path) {
      // Create a fake file from member photo
      fetch(getPhotoUrl(member.photo_path)!)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'member.jpg', { type: 'image/jpeg' })
          setSelectedImage(file, getPhotoUrl(member.photo_path)!)
        })
        .catch(() => {
          // If fetch fails, just set preview URL
          setSelectedImage(null, getPhotoUrl(member.photo_path)!)
        })
    }
    onMemberSelectClose()
  }

  const getPhotoUrl = (photoPath?: string) => {
    if (!photoPath) return undefined
    if (photoPath.startsWith('http') || photoPath.startsWith('data:')) return photoPath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${photoPath}`
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        사진 선택
      </Typography>

      {/* Preview Area */}
      <Box
        sx={{
          width: '100%',
          aspectRatio: '3/4',
          bgcolor: 'grey.100',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          mb: 2,
        }}
      >
        {selectedImagePreview ? (
          <img
            src={selectedImagePreview}
            alt="Selected"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography color="text.secondary">사진을 선택해주세요</Typography>
        )}
      </Box>

      {/* Source Buttons */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<PersonIcon />}
          onClick={onMemberSelectOpen}
          sx={{ flex: 1 }}
        >
          고객 선택
        </Button>
        <Button
          variant="outlined"
          startIcon={<PhotoLibraryIcon />}
          onClick={() => fileInputRef.current?.click()}
          sx={{ flex: 1 }}
        >
          갤러리
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileSelect}
        />
      </Box>

      {selectedMember && (
        <Typography variant="body2" color="secondary" sx={{ mt: 1 }}>
          선택된 고객: {selectedMember.name}
        </Typography>
      )}

      {/* Member Select Dialog */}
      <Dialog open={memberSelectOpen} onClose={onMemberSelectClose} fullWidth maxWidth="xs">
        <DialogTitle>고객 선택</DialogTitle>
        <DialogContent>
          {members.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              등록된 고객이 없습니다
            </Typography>
          ) : (
            <List>
              {members.map((member) => (
                <ListItemButton
                  key={member.id}
                  onClick={() => handleMemberSelect(member)}
                  disabled={!member.photo_path}
                >
                  <ListItemAvatar>
                    <Avatar src={getPhotoUrl(member.photo_path)}>
                      {member.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.photo_path ? member.phone : '사진 없음'}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
