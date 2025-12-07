import { useForm } from 'react-hook-form'
import {
  Box,
  TextField,
  Fab,
  CircularProgress,
  Typography,
} from '@mui/material'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import SaveIcon from '@mui/icons-material/Save'
import { useRef, useState } from 'react'
import { Member, CreateMemberRequest } from '../../../types'

interface MemberFormProps {
  initialData?: Member
  onSubmit: (data: CreateMemberRequest) => Promise<void>
  isLoading: boolean
  readOnly?: boolean
}

export default function MemberForm({
  initialData,
  onSubmit,
  isLoading,
  readOnly = false,
}: MemberFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    initialData?.photo_path
  )
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMemberRequest>({
    defaultValues: {
      name: initialData?.name ?? '',
      phone: initialData?.phone ?? '',
      memo: initialData?.memo ?? '',
    },
  })

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = async (data: CreateMemberRequest) => {
    await onSubmit({
      ...data,
      photo_path: photoFile ? photoPreview : initialData?.photo_path,
    })
  }

  const getPhotoUrl = (photoPath?: string) => {
    if (!photoPath) return undefined
    if (photoPath.startsWith('http') || photoPath.startsWith('data:')) return photoPath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${photoPath}`
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Large Profile Photo */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 4,
          mt: 2,
        }}
      >
        <Box
          onClick={!readOnly ? handlePhotoClick : undefined}
          sx={{
            position: 'relative',
            cursor: readOnly ? 'default' : 'pointer',
          }}
        >
          <Box
            sx={{
              width: 300,
              height: 300,
              bgcolor: 'grey.200',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {photoPreview ? (
              <img
                src={getPhotoUrl(photoPreview)}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <AddAPhotoIcon sx={{ fontSize: 48, color: 'grey.400' }} />
            )}
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoChange}
          />
        </Box>
      </Box>

      {/* Form Fields - Filled Style */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: 1, mb: 0.5, display: 'block' }}
          >
            Name
          </Typography>
          <TextField
            fullWidth
            variant="filled"
            placeholder="Enter name"
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
            InputProps={{
              disableUnderline: true,
              readOnly: readOnly,
            }}
            sx={{
              '& .MuiFilledInput-root': {
                borderRadius: 2,
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' },
                '&.Mui-focused': { bgcolor: 'grey.100' },
                '&::before, &::after': { display: 'none' },
              },
              '& .MuiFilledInput-input': {
                pt: 1,
                pb: 1,
              },
            }}
          />
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: 1, mb: 0.5, display: 'block' }}
          >
            Phone
          </Typography>
          <TextField
            fullWidth
            variant="filled"
            placeholder="Enter phone number"
            {...register('phone', { required: 'Phone is required' })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            InputProps={{
              disableUnderline: true,
              readOnly: readOnly,
            }}
            sx={{
              '& .MuiFilledInput-root': {
                borderRadius: 2,
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' },
                '&.Mui-focused': { bgcolor: 'grey.100' },
                '&::before, &::after': { display: 'none' },
              },
              '& .MuiFilledInput-input': {
                pt: 1,
                pb: 1,
              },
            }}
          />
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: 1, mb: 0.5, display: 'block' }}
          >
            Memo
          </Typography>
          <TextField
            fullWidth
            variant="filled"
            placeholder="Enter memo"
            multiline
            rows={2}
            {...register('memo')}
            InputProps={{
              disableUnderline: true,
              readOnly: readOnly,
            }}
            sx={{
              '& .MuiFilledInput-root': {
                borderRadius: 2,
                bgcolor: 'grey.100',
                py: 0,
                '&:hover': { bgcolor: 'grey.200' },
                '&.Mui-focused': { bgcolor: 'grey.100' },
                '&::before, &::after': { display: 'none' },
              },
              '& .MuiInputBase-inputMultiline': {
                pt: 1,
                pb: 1,
              },
            }}
          />
        </Box>
      </Box>

      {/* Save Fab Button - only shown when not readOnly */}
      {!readOnly && (
        <Fab
          color="primary"
          aria-label="save"
          type="submit"
          disabled={isLoading}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: 'secondary.main',
            '&:hover': { bgcolor: 'secondary.dark' },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
        </Fab>
      )}
    </Box>
  )
}
