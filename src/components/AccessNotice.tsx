import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import LockRounded from '@mui/icons-material/LockRounded'
import { Button, Container, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

interface AccessNoticeProps {
  title: string
  description: string
  actionLabel: string
  to: string
}

export function AccessNotice({
  title,
  description,
  actionLabel,
  to,
}: AccessNoticeProps) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Paper sx={{ p: { xs: 2.25, md: 2.75 } }}>
        <Stack spacing={1.6}>
          <LockRounded color="primary" />
          <Typography variant="overline" color="text.secondary">
            Нужен доступ
          </Typography>
          <Typography variant="h2">{title}</Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button component={Link} to={to} variant="contained">
              {actionLabel}
            </Button>
            <Button component={Link} to="/news" variant="text" color="secondary" startIcon={<ArrowBackRounded />}>
              Вернуться к новостям
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
