import {
  Card,
  CardActionArea,
  Avatar,
  Typography,
  Box,
} from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Member } from '../../../types'

interface MemberCardProps {
  member: Member
  onClick: () => void
  onDelete?: () => void
}

export default function MemberCard({ member, onClick }: MemberCardProps) {
  const getPhotoUrl = (photoPath?: string) => {
    if (!photoPath) return undefined
    if (photoPath.startsWith('http') || photoPath.startsWith('data:')) return photoPath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}${photoPath}`
  }

  return (
    <Card
      sx={{
        mb: 1.5,
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={getPhotoUrl(member.photo_path)}
            sx={{ width: 72, height: 72, mr: 2 }}
          >
            {member.name.charAt(0)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {member.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {member.phone}
            </Typography>
            {member.memo && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {member.memo}
              </Typography>
            )}
          </Box>

          <ChevronRightIcon sx={{ color: 'grey.400' }} />
        </Box>
      </CardActionArea>
    </Card>
  )
}
