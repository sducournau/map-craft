import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Grid,
  Button,
  IconButton,
  TextField,
  Alert,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import LanguageIcon from '@mui/icons-material/Language';
import PaletteIcon from '@mui/icons-material/Palette';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import { useThemeStore } from '../../hooks/useThemeState';

// Styled components
const SettingSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const SettingsPanel = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [language, setLanguage] = useState('fr');
  const [cacheSetting, setCacheSetting] = useState(50);
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(5);
  const [performanceMode, setPerformanceMode] = useState('balanced');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [projectName, setProjectName] = useState('Mon projet MapCraft');
  const [saveStatus, setSaveStatus] = useState(null);
  
  // Simulated saved projects
  const [savedProjects] = useState([
    { id: 'project1', name: 'Projet exemple 1', date: '2023-05-15', size: '1.2 MB' },
    { id: 'project2', name: 'Analyse démographique', date: '2023-06-20', size: '3.5 MB' },
    { id: 'project3', name: 'Zones urbaines', date: '2023-07-10', size: '2.8 MB' }
  ]);
  
  // Handle saving project
  const handleSaveProject = () => {
    setSaveStatus({ type: 'info', message: 'Sauvegarde en cours...' });
    
    // Simulate saving process
    setTimeout(() => {
      setSaveStatus({ type: 'success', message: 'Projet sauvegardé avec succès' });
      
      // Clear status after a delay
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }, 1500);
  };
  
  // Handle clearing cache
  const handleClearCache = () => {
    setSaveStatus({ type: 'info', message: 'Nettoyage du cache en cours...' });
    
    // Simulate clearing cache
    setTimeout(() => {
      setSaveStatus({ type: 'success', message: 'Cache nettoyé avec succès' });
      setCacheSetting(0);
      
      // Clear status after a delay
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }, 1500);
  };
  
  // Handle deleting a project
  const handleDeleteProject = (projectId) => {
    // In a real app, this would delete the project
    console.log(`Deleting project: ${projectId}`);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 3
      }}>
        <SettingsIcon sx={{ mr: 1 }} />
        Paramètres
      </Typography>
      
      {/* Project Settings */}
      <SettingSection>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Projet actuel
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Nom du projet"
            variant="outlined"
            size="small"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </Box>
        
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveProject}
        >
          Sauvegarder le projet
        </Button>
      </SettingSection>
      
      {/* Interface Settings */}
      <SettingSection>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Interface
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2">Thème sombre</Typography>
              <PaletteIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
            </Box>
          }
        />
        
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="language-select-label">Langue</InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label="Langue"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </SettingSection>
      
      {/* Performance Settings */}
      <SettingSection>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Performance
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Mode de performance
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={performanceMode}
              onChange={(e) => setPerformanceMode(e.target.value)}
            >
              <MenuItem value="quality">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">Qualité élevée</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="balanced">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2">Équilibré</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="performance">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="body2">Performance maximale</Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
            {performanceMode === 'quality' && 'Privilégie la qualité visuelle au détriment des performances.'}
            {performanceMode === 'balanced' && 'Équilibre entre qualité visuelle et performances.'}
            {performanceMode === 'performance' && 'Privilégie les performances au détriment de la qualité visuelle.'}
          </Typography>
        </Box>
        
        <FormControlLabel
          control={
            <Switch
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
          }
          label="Sauvegarde automatique"
        />
        
        {autoSave && (
          <Box sx={{ mt: 2, ml: 4 }}>
            <Typography variant="body2" gutterBottom>
              Intervalle: {autoSaveInterval} minutes
            </Typography>
            <Slider
              value={autoSaveInterval}
              onChange={(e, value) => setAutoSaveInterval(value)}
              step={1}
              marks
              min={1}
              max={30}
              valueLabelDisplay="auto"
              sx={{ width: '90%' }}
            />
          </Box>
        )}
      </SettingSection>
      
      {/* Storage Settings */}
      <SettingSection>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Stockage et données
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Utilisation du cache: {cacheSetting}%
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              value={cacheSetting}
              aria-label="Cache utilization"
              sx={{ flexGrow: 1, mr: 2 }}
              disabled
            />
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleClearCache}
            >
              Vider
            </Button>
          </Box>
          <Typography variant="caption" color="textSecondary">
            Vider le cache libère de l'espace mais peut ralentir l'application
          </Typography>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Projets sauvegardés
          </Typography>
          
          {savedProjects.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Aucun projet sauvegardé
            </Typography>
          ) : (
            <List dense>
              {savedProjects.map(project => (
                <ListItem key={project.id}>
                  <ListItemIcon>
                    <StorageIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.name}
                    secondary={`Modifié le ${project.date} • ${project.size}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Supprimer">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </SettingSection>
      
      {/* Advanced Settings */}
      <Button 
        variant="text"
        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
        sx={{ mb: 2 }}
      >
        {showAdvancedSettings ? 'Masquer les paramètres avancés' : 'Afficher les paramètres avancés'}
      </Button>
      
      {showAdvancedSettings && (
        <SettingSection>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
            Paramètres avancés
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Ces paramètres peuvent affecter les performances et la stabilité de l'application.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch />}
                label="Activation du WebGL 2.0"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Utiliser l'accélération matérielle"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch />}
                label="Mode développeur"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch />}
                label="Journalisation détaillée"
              />
            </Grid>
          </Grid>
        </SettingSection>
      )}
      
      {/* Status Messages */}
      {saveStatus && (
        <Alert 
          severity={saveStatus.type} 
          icon={saveStatus.type === 'success' ? <DownloadDoneIcon /> : undefined}
          sx={{ mt: 2 }}
        >
          {saveStatus.message}
        </Alert>
      )}
    </Box>
  );
};

export default SettingsPanel;