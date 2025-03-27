import { createTheme } from '@mui/material/styles';

// Function to create theme based on mode (dark/light)
export const createAppTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#3f51b5',
        light: '#7986cb',
        dark: '#303f9f',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
      },
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
        darker: isDark ? '#0a0a0a' : '#e0e0e0',
        lighter: isDark ? '#2d2d2d' : '#fafafa',
      },
      text: {
        primary: isDark ? '#ffffff' : '#212121',
        secondary: isDark ? '#b0b0b0' : '#757575',
        disabled: isDark ? '#6b6b6b' : '#9e9e9e',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
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
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#6b6b6b #1e1e1e' : '#9e9e9e #ffffff',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? '#1e1e1e' : '#ffffff',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? '#6b6b6b' : '#9e9e9e',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: isDark ? '#8b8b8b' : '#757575',
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
            boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.2)',
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
            boxShadow: isDark 
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
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDark 
              ? '0px 2px 4px -1px rgba(0,0,0,0.4), 0px 4px 5px 0px rgba(0,0,0,0.3), 0px 1px 10px 0px rgba(0,0,0,0.2)'
              : '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            minHeight: 42,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            paddingTop: 10,
            paddingBottom: 10,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            '&:before': {
              display: 'none',
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(33, 33, 33, 0.9)',
            color: isDark ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
            boxShadow: isDark 
              ? '0 2px 6px rgba(0,0,0,0.3)' 
              : '0 2px 6px rgba(0,0,0,0.2)',
            borderRadius: 4,
            padding: '6px 12px',
          },
        },
      },
    },
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  });
};

// Default theme (dark mode)
const theme = createAppTheme('dark');

export default theme;