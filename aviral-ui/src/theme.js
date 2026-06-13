import { createTheme } from '@mui/material/styles';

// A modern, clean theme for the School ERP
const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2', // A professional, calming blue
    },
    secondary: {
      main: '#50E3C2', // A vibrant, modern accent for highlights
    },
    background: {
      default: '#F4F6F8', // A light, clean background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;