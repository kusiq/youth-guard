import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { useMemo, type PropsWithChildren } from 'react'
import { useAppState } from '../state/AppState'
import { getAppTheme } from '../theme/getAppTheme'

export function AppThemeProvider({ children }: PropsWithChildren) {
  const { theme } = useAppState()
  const muiTheme = useMemo(() => getAppTheme(theme), [theme])

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
