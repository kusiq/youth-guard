import DarkModeRounded from '@mui/icons-material/DarkModeRounded'
import LightModeRounded from '@mui/icons-material/LightModeRounded'
import { Box, ButtonBase } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useAppState } from '../state/AppState'

const themeIconSx = {
  fontSize: 15,
  color: 'common.white',
} as const

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppState()
  const isDark = theme === 'dark'
  const nextThemeLabel = isDark ? 'светлую тему' : 'тёмную тему'

  return (
    <ButtonBase
      type="button"
      onClick={toggleTheme}
      aria-label={`Включить ${nextThemeLabel}`}
      aria-checked={isDark}
      role="switch"
      sx={(muiTheme) => ({
        width: 62,
        height: 36,
        px: 0.5,
        borderRadius: 999,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isDark ? 'flex-end' : 'flex-start',
        backgroundColor: isDark
          ? muiTheme.palette.mode === 'light'
            ? alpha(muiTheme.palette.primary.main, 0.24)
            : alpha(muiTheme.palette.primary.main, 0.38)
          : muiTheme.palette.mode === 'light'
            ? alpha(muiTheme.palette.text.primary, 0.12)
            : alpha(muiTheme.palette.common.white, 0.12),
        transition: 'background-color 220ms ease, justify-content 220ms ease',
      })}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'none',
        }}
      >
        {isDark ? <LightModeRounded sx={themeIconSx} /> : <DarkModeRounded sx={themeIconSx} />}
      </Box>
    </ButtonBase>
  )
}
