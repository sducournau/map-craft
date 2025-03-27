// utils/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4299e1', // Blue color from original theme
    },
    secondary: {
      main: '#63b3ed', 
    },
    background: {
      default: '#121212',
      paper: '#1a202c',
    },
    text: {
      primary: '#f7fafc',
      secondary: '#a0aec0',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;