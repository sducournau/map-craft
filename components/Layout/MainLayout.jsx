import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer, 
  Divider,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Hidden
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import HelpIcon from '@mui/icons-material/Help';
import BrightnessMediumIcon from '@mui/icons-material/BrightnessMedium';
import LanguageIcon from '@mui/icons-material/Language';
import { useThemeStore } from '../../hooks/useThemeState';

// Drawer width
const drawerWidth = 300;

// Styled components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const MainLayout = ({ children, sidebarContent, title = 'MapCraft' }) => {
  const theme = useTheme();
  const { theme: themeMode, toggleTheme } = useThemeStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  
  // Update drawer state when screen size changes
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };
  
  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };
  
  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: 3,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
            {title}
          </Typography>
          
          {/* Main Actions */}
          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Sauvegarder">
              <IconButton color="inherit">
                <SaveIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Exporter">
              <IconButton 
                color="inherit" 
                onClick={handleExportClick}
                aria-controls="export-menu"
                aria-haspopup="true"
              >
                <CloudDownloadIcon />
              </IconButton>
            </Tooltip>
            
            <Menu
              id="export-menu"
              anchorEl={exportAnchorEl}
              keepMounted
              open={Boolean(exportAnchorEl)}
              onClose={handleExportClose}
            >
              <MenuItem onClick={handleExportClose}>
                <ListItemIcon>
                  <img src="/icons/geojson-icon.svg" width="20" height="20" alt="GeoJSON" />
                </ListItemIcon>
                <ListItemText primary="GeoJSON" />
              </MenuItem>
              <MenuItem onClick={handleExportClose}>
                <ListItemIcon>
                  <img src="/icons/csv-icon.svg" width="20" height="20" alt="CSV" />
                </ListItemIcon>
                <ListItemText primary="CSV" />
              </MenuItem>
              <MenuItem onClick={handleExportClose}>
                <ListItemIcon>
                  <img src="/icons/image-icon.svg" width="20" height="20" alt="Image" />
                </ListItemIcon>
                <ListItemText primary="Image (PNG)" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleExportClose}>
                <ListItemIcon>
                  <img src="/icons/project-icon.svg" width="20" height="20" alt="Project" />
                </ListItemIcon>
                <ListItemText primary="Projet MapCraft" />
              </MenuItem>
            </Menu>
            
            <Tooltip title="Paramètres">
              <IconButton 
                color="inherit" 
                onClick={handleSettingsClick}
                aria-controls="settings-menu"
                aria-haspopup="true"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Menu
              id="settings-menu"
              anchorEl={settingsAnchorEl}
              keepMounted
              open={Boolean(settingsAnchorEl)}
              onClose={handleSettingsClose}
            >
              <MenuItem onClick={() => { toggleTheme(); handleSettingsClose(); }}>
                <ListItemIcon>
                  <BrightnessMediumIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={`Thème ${themeMode === 'dark' ? 'Clair' : 'Sombre'}`} />
              </MenuItem>
              <MenuItem onClick={handleSettingsClose}>
                <ListItemIcon>
                  <LanguageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Langue" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSettingsClose}>
                <ListItemIcon>
                  <HelpIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Aide" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ fontWeight: 500, ml: 1 }}>
            MapCraft
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        
        {/* Sidebar Content */}
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          {sidebarContent}
        </Box>
      </Drawer>
      
      <Main open={open}>
        <DrawerHeader /> {/* This creates space for the AppBar */}
        {children}
      </Main>
    </Box>
  );
};

export default MainLayout;