import { Box, InputBase, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import SendIcon from '@mui/icons-material/Send'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'grey.100',
          borderRadius: 3,
          px: 2,
          py: 1,
        }}
      >
        <SearchIcon sx={{ color: 'grey.500', mr: 1 }} />
        <InputBase
          fullWidth
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ fontSize: '0.95rem' }}
        />
        {value && (
          <IconButton size="small" onClick={() => onChange('')}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <IconButton
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          '&:hover': { bgcolor: 'secondary.dark' },
          width: 44,
          height: 44,
        }}
      >
        <SendIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  )
}
