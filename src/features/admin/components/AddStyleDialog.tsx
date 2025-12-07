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
} from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'

interface AddStyleDialogProps {
  open: boolean
  onClose: () => void
  onUpload: (file: File, name?: string) => Promise<void>
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
    await onUpload(file, name || undefined)
    handleClose()
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setName('')
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

        <TextField
          fullWidth
          label="스타일 이름 (선택)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
        />
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
