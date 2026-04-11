import DarkModeRounded from '@mui/icons-material/DarkModeRounded'
import LightModeRounded from '@mui/icons-material/LightModeRounded'
import { Switch } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { useAppState } from '../state/AppState'

const themeIconSx = {
  fontSize: 15,
  color: 'common.white',
} as const

const ThemeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 36,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'center',
  verticalAlign: 'middle',
  overflow: 'visible',
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 0,
    top: '50%',
    left: 10,
    transform: 'translateY(-50%)',
    transitionDuration: '220ms',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
    '&.Mui-checked': {
      transform: 'translate(26px, -50%)',
      color: theme.palette.common.white,
      '& + .MuiSwitch-track': {
        backgroundColor:
          theme.palette.mode === 'light'
            ? alpha(theme.palette.primary.main, 0.24)
            : alpha(theme.palette.primary.main, 0.38),
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  '& .MuiSwitch-track': {
    borderRadius: 18,
    height: 36,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === 'light'
        ? alpha(theme.palette.text.primary, 0.12)
        : alpha(theme.palette.common.white, 0.12),
  },
}))

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppState()
  const isDark = theme === 'dark'
  const nextThemeLabel = isDark ? 'светлую тему' : 'тёмную тему'

  return (
    <ThemeSwitch
      checked={isDark}
      onChange={toggleTheme}
      slotProps={{
        input: {
          'aria-label': `Включить ${nextThemeLabel}`,
        },
      }}
      icon={<DarkModeRounded sx={themeIconSx} />}
      checkedIcon={<LightModeRounded sx={themeIconSx} />}
    />
  )
}
