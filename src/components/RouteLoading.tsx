import { CircularProgress, Container, Stack, Typography } from '@mui/material'

export function RouteLoading() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 9 } }}>
      <Stack spacing={2} role="status" aria-live="polite" sx={{ alignItems: 'flex-start' }}>
        <CircularProgress size={28} />
        <Typography variant="overline" color="text.secondary">
          Загрузка
        </Typography>
        <Typography variant="h3">Открываем раздел</Typography>
        <Typography variant="body1" color="text.secondary">
          Подготавливаем интерфейс и данные.
        </Typography>
      </Stack>
    </Container>
  )
}
