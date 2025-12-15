import { useRef, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'

interface AddStyleDialogProps {
  open: boolean
  onClose: () => void
  onUpload: (
    file: File, 
    name?: string, 
    tags?: string[], 
    gender?: string, 
    category?: string
  ) => Promise<void>
  isUploading: boolean
}

export default function AddStyleDialog({
  open,
  onClose,
  onUpload,
  isUploading,
}: AddStyleDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [tags, setTags] = useState('')
  const [gender, setGender] = useState('neutral')
  const [category, setCategory] = useState('unknown')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    const tagsList = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    await onUpload(file, name || undefined, tagsList, gender, category)
    handleClose()
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setName('')
    setTags('')
    setGender('neutral')
    setCategory('unknown')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>스타일 추가</DialogTitle>
      <DialogContent>
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            width: '100%',
            aspectRatio: '3/4',
            bgcolor: 'grey.100',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            mb: 2,
            border: '2px dashed',
            borderColor: 'grey.300',
            '&:hover': { borderColor: 'secondary.main' },
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'grey.400' }} />
          )}
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileSelect}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="스타일 이름 (선택)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
          />
          <TextField
            fullWidth
            label="태그 (쉼표로 구분, 예: 숏컷, 펌)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>성별</InputLabel>
            <Select
              value={gender}
              label="성별"
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value="neutral">무관</MenuItem>
              <MenuItem value="male">남성</MenuItem>
              <MenuItem value="female">여성</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>카테고리</InputLabel>
            <Select
              value={category}
              label="카테고리"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="unknown">미지정</MenuItem>
              <MenuItem value="cut">커트</MenuItem>
              <MenuItem value="perm">펌</MenuItem>
              <MenuItem value="color">염색</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          color="secondary"
          disabled={!file || isUploading}
        >
          {isUploading ? <CircularProgress size={20} /> : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
