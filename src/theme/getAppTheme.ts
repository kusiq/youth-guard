import { alpha, createTheme } from '@mui/material/styles'
import type { ThemeMode } from '../types'

export function getAppTheme(mode: ThemeMode) {
  const isLight = mode === 'light'
  const primary = isLight ? '#cf4a4a' : '#ff7a72'
  const primaryDark = isLight ? '#a93535' : '#ff948d'
  const backgroundDefault = isLight ? '#f6f2ec' : '#120f0f'
  const backgroundPaper = isLight ? '#fffdfa' : '#1d1716'
  const textPrimary = isLight ? '#231817' : '#f7efeb'
  const textSecondary = isLight ? '#6f5b54' : '#bca9a2'
  const divider = alpha(isLight ? '#241614' : '#fff5ef', isLight ? 0.1 : 0.08)

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primary,
        dark: primaryDark,
        light: isLight ? '#f6b8b3' : '#ffc2bd',
        contrastText: '#fffaf8',
      },
      secondary: {
        main: isLight ? '#2f2522' : '#f0e1db',
      },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      divider,
    },
    shape: {
      borderRadius: 6,
    },
    typography: {
      fontFamily: '"Manrope", "Segoe UI", sans-serif',
      h1: {
        fontSize: 'clamp(2.35rem, 4vw, 3.8rem)',
        lineHeight: 0.98,
        letterSpacing: '-0.05em',
        fontWeight: 800,
      },
      h2: {
        fontSize: 'clamp(1.85rem, 3vw, 2.8rem)',
        lineHeight: 1.02,
        letterSpacing: '-0.04em',
        fontWeight: 800,
      },
      h3: {
        fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
        lineHeight: 1.08,
        letterSpacing: '-0.03em',
        fontWeight: 800,
      },
      h4: {
        fontSize: '1.12rem',
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        fontWeight: 800,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.72,
      },
      body2: {
        fontSize: '0.95rem',
        lineHeight: 1.6,
      },
      overline: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '0.76rem',
        letterSpacing: '0.12em',
        fontWeight: 600,
        textTransform: 'uppercase',
      },
      caption: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '0.78rem',
        letterSpacing: '0.06em',
      },
      button: {
        fontSize: '0.96rem',
        fontWeight: 700,
        textTransform: 'none',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
          },
          '*': {
            boxSizing: 'border-box',
          },
          'html, body, #root': {
            minHeight: '100%',
          },
          body: {
            margin: 0,
            backgroundColor: backgroundDefault,
          },
          a: {
            color: 'inherit',
            textDecoration: 'none',
          },
          img: {
            display: 'block',
            maxWidth: '100%',
          },
          '::selection': {
            backgroundColor: alpha(primary, 0.22),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(18px)',
            backgroundColor: alpha(backgroundPaper, isLight ? 0.9 : 0.86),
            borderBottom: `1px solid ${divider}`,
            boxShadow: 'none',
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${divider}`,
            boxShadow: isLight
              ? '0 18px 48px rgba(53, 28, 21, 0.06)'
              : '0 18px 52px rgba(0, 0, 0, 0.28)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${divider}`,
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
            paddingInline: 16,
            minHeight: 44,
            '&.MuiButton-containedPrimary': {
              boxShadow: isLight
                ? '0 16px 32px rgba(207, 74, 74, 0.18)'
                : '0 16px 36px rgba(255, 122, 114, 0.18)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
          label: {
            fontWeight: 700,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: alpha(backgroundPaper, isLight ? 0.82 : 0.7),
          },
          notchedOutline: {
            borderColor: divider,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: divider,
          },
        },
      },
    },
  })
}
