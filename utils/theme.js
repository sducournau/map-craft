import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Configuration des palettes de couleurs par mode
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Palette pour le mode clair
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
            contrastText: '#ffffff',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
            lighter: '#fafafa',
            darker: '#e0e0e0',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
          },
          action: {
            active: 'rgba(0, 0, 0, 0.54)',
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(0, 0, 0, 0.08)',
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // Palette pour le mode sombre
          primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          secondary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
            lighter: '#2c2c2c',
            darker: '#0a0a0a',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
          },
          action: {
            active: '#ffffff',
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(255, 255, 255, 0.16)',
            disabled: 'rgba(255, 255, 255, 0.3)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        }),
    // Couleurs communes
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
  },
});

// Fonction pour créer le thème de l'application
export const createAppTheme = (mode = 'dark') => {
  let theme = createTheme({
    // Tokens de design pour le mode actuel
    ...getDesignTokens(mode),
    
    // Typographie
    typography: {
      fontFamily: [
        'Rubik',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 500,
        fontSize: '2rem',
      },
      h2: {
        fontWeight: 500,
        fontSize: '1.75rem',
      },
      h3: {
        fontWeight: 500,
        fontSize: '1.5rem',
      },
      h4: {
        fontWeight: 500,
        fontSize: '1.25rem',
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.1rem',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1rem',
      },
      subtitle1: {
        fontWeight: 400,
        fontSize: '0.95rem',
      },
      subtitle2: {
        fontWeight: 400,
        fontSize: '0.875rem',
      },
      body1: {
        fontWeight: 400,
        fontSize: '1rem',
      },
      body2: {
        fontWeight: 400,
        fontSize: '0.875rem',
      },
      button: {
        fontWeight: 500,
        fontSize: '0.875rem',
        textTransform: 'none',
      },
      caption: {
        fontWeight: 400,
        fontSize: '0.75rem',
      },
    },
    
    // Arrondi des composants
    shape: {
      borderRadius: 8,
    },
    
    // Espacement
    spacing: 8,
    
    // Surcharges des composants
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: mode === 'dark' ? '#6b6b6b #1e1e1e' : '#9e9e9e #ffffff',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'dark' ? '#6b6b6b' : '#9e9e9e',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#8b8b8b' : '#757575',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
          },
          containedPrimary: {
            boxShadow: mode === 'dark' ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.2)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          rounded: {
            borderRadius: 8,
          },
          elevation1: {
            boxShadow: mode === 'dark' 
              ? '0px 2px 6px -1px rgba(0,0,0,0.4), 0px 1px 4px -1px rgba(0,0,0,0.3)'
              : '0px 2px 6px -1px rgba(0,0,0,0.2), 0px 1px 4px -1px rgba(0,0,0,0.15)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
          },
          head: {
            fontWeight: 500,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(33,33,33,0.9)',
            color: mode === 'dark' ? 'rgba(0,0,0,0.87)' : '#fff',
            fontSize: '0.75rem',
            borderRadius: 4,
          },
        },
      },
    },
  });
  
  // Rendre les tailles de police adaptatives
  theme = responsiveFontSizes(theme);
  
  return theme;
};

// Exporter le thème par défaut (mode sombre)
export default createAppTheme('dark');