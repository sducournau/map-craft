import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LayersIcon from '@mui/icons-material/Layers';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LanguageIcon from '@mui/icons-material/Language';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import HomeIcon from '@mui/icons-material/Home';
import PaletteIcon from '@mui/icons-material/Palette';

// Styled components
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const ShortcutKey = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  marginLeft: theme.spacing(1),
}));

const HelpImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  height: 'auto',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ContextHelp = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const sections = [
    { id: 'overview', name: 'Aperçu', icon: <InfoIcon /> },
    { id: 'data', name: 'Données', icon: <MenuBookIcon /> },
    { id: 'layers', name: 'Couches', icon: <LayersIcon /> },
    { id: 'analysis', name: 'Analyse', icon: <AnalyticsIcon /> },
    { id: 'shortcuts', name: 'Raccourcis', icon: <KeyboardIcon /> }
  ];

  // Render help content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 0: // Overview
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Bienvenue dans MapCraft</Typography>
            <Typography paragraph>
              MapCraft est un éditeur cartographique Web qui vous permet de créer, visualiser et 
              analyser des données géospatiales directement dans votre navigateur.
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Principales fonctionnalités
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FileUploadIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Importation de données</Typography>
                  </Box>
                  <Typography variant="body2">
                    Importez des données GeoJSON, CSV avec coordonnées, GeoPackage et Shapefile
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LayersIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Gestion des couches</Typography>
                  </Box>
                  <Typography variant="body2">
                    Organisez et stylisez vos couches avec des options de visualisation avancées
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AnalyticsIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Analyse spatiale</Typography>
                  </Box>
                  <Typography variant="body2">
                    Réalisez des analyses comme des zones tampons, intersections et unions
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FileDownloadIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Exportation</Typography>
                  </Box>
                  <Typography variant="body2">
                    Exportez vos projets et analyses au format GeoJSON et CSV
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Pour commencer
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Importez des données"
                  secondary="Utilisez le bouton d'importation ou sélectionnez des données d'exemple"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LayersIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Gérez vos couches"
                  secondary="Personnalisez l'apparence et organisez vos données dans le panneau des couches"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Analysez vos données"
                  secondary="Utilisez les outils d'analyse spatiale pour transformer vos données"
                />
              </ListItem>
            </List>
          </Box>
        );

      case 1: // Data
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Gestion des données</Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Formats supportés
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="GeoJSON"
                  secondary="Format standard pour les données géospatiales sur le Web"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="CSV avec coordonnées"
                  secondary="Fichiers avec colonnes pour latitude/longitude, lat/lng ou x/y"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="GeoPackage (.gpkg)"
                  secondary="Format OGC pour stocker des données géospatiales"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Shapefile (ZIP)"
                  secondary="Format Esri inclus dans une archive ZIP"
                />
              </ListItem>
            </List>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Importation de données
            </Typography>
            <Typography paragraph>
              Pour importer des données dans MapCraft, cliquez sur le bouton <strong>Importer</strong> dans
              la barre d'outils ou dans le panneau latéral.
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Format CSV</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Pour les fichiers CSV, assurez-vous d'avoir au moins deux colonnes pour les coordonnées :
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Latitude et Longitude"
                      secondary="latitude/longitude, lat/lng, lat/lon, y/x"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Noms de champs sensibles à la casse"
                      secondary="Vérifiez que les noms de colonnes correspondent exactement"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Format Shapefile</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Pour importer un Shapefile :
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Compressez tous les fichiers en un ZIP"
                      secondary="Incluez les fichiers .shp, .dbf, .prj et autres associés"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Encodage des caractères"
                      secondary="Les caractères spéciaux peuvent nécessiter un encodage UTF-8"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Exportation
            </Typography>
            <Typography paragraph>
              Pour exporter vos données, cliquez sur le bouton <strong>Exporter</strong> dans
              la barre d'outils ou dans le panneau des données.
            </Typography>
            <Typography paragraph>
              Vous pouvez choisir d'exporter toutes les couches ou seulement une sélection,
              et choisir parmi plusieurs formats.
            </Typography>
          </Box>
        );

      case 2: // Layers
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Gestion des couches</Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Interface de couches
            </Typography>
            <Typography paragraph>
              Le panneau <strong>Couches</strong> dans la barre latérale vous permet de gérer vos données :
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LayersIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Affichage des couches"
                  secondary="Activez ou désactivez la visibilité des couches en cliquant sur l'icône d'œil"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TuneIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Édition de style"
                  secondary="Personnalisez l'apparence de chaque couche avec l'éditeur de style"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PaletteIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Ordre d'affichage"
                  secondary="Réorganisez les couches par glisser-déposer pour contrôler leur superposition"
                />
              </ListItem>
            </List>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Types de visualisation
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>Points</Typography>
                  <List dense disablePadding>
                    <ListItem disableGutters>
                      <ListItemText primary="Points simples" />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Cartes de chaleur" />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Clusters" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>Polygones</Typography>
                  <List dense disablePadding>
                    <ListItem disableGutters>
                      <ListItemText primary="Choroplèthes (coloration)" />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Extrusions 3D" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>Lignes</Typography>
                  <List dense disablePadding>
                    <ListItem disableGutters>
                      <ListItemText primary="Lignes simples" />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Trajectoires" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>Agrégation</Typography>
                  <List dense disablePadding>
                    <ListItem disableGutters>
                      <ListItemText primary="Grilles" />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText primary="Hexagones" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Style des couches
            </Typography>
            <Typography paragraph>
              Pour modifier le style d'une couche, cliquez sur son nom dans le panneau des couches,
              puis utilisez les options de l'éditeur de style.
            </Typography>
            <Typography paragraph>
              Vous pouvez personnaliser :
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Couleurs"
                  secondary="Couleur unique ou échelle basée sur les valeurs des données"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Taille et opacité"
                  secondary="Taille fixe ou variable selon les attributs"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Contours et remplissage"
                  secondary="Styles des bordures et surfaces"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Étiquettes"
                  secondary="Texte basé sur les attributs des entités"
                />
              </ListItem>
            </List>
          </Box>
        );

      case 3: // Analysis
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Analyse spatiale</Typography>
            
            <Typography paragraph>
              MapCraft propose plusieurs outils d'analyse spatiale pour transformer et interroger
              vos données géographiques.
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Analyses disponibles
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Zone tampon (Buffer)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Crée des zones tampons autour des entités géographiques.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Utilisation"
                      secondary="Déterminer des zones d'influence ou de service"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Paramètres"
                      secondary="Distance et unité (mètres, kilomètres, miles)"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Centroïde</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Calcule le centre géométrique des entités.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Utilisation"
                      secondary="Simplifier des polygones complexes en points"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Résultat"
                      secondary="Couche de points avec les attributs des entités d'origine"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Intersection</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Trouve les zones communes entre deux couches.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Utilisation"
                      secondary="Identifier les zones urbaines dans une zone à risque"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Paramètres"
                      secondary="Deux couches : source et cible"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Union</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Combine plusieurs entités en une seule.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Utilisation"
                      secondary="Fusionner des zones administratives ou des parcelles"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Paramètres"
                      secondary="Deux couches à combiner"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Différence</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Soustrait une couche d'une autre.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Utilisation"
                      secondary="Calculer la surface forestière hors des zones protégées"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Paramètres"
                      secondary="Couche source moins couche cible"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Diagramme de Voronoï</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Crée un pavage de l'espace basé sur la proximité.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Utilisation"
                      secondary="Déterminer des zones d'influence ou de service"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Paramètres"
                      secondary="Couche de points comme entrée"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
              Utiliser l'analyse spatiale
            </Typography>
            <Typography paragraph>
              Accédez aux outils d'analyse via le bouton <strong>Analyse spatiale</strong> dans
              le panneau des couches ou en bas de la liste des couches.
            </Typography>
            <Typography paragraph>
              Pour effectuer une analyse :
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="1. Sélectionnez le type d'analyse"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2. Choisissez la couche source"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3. Configurez les paramètres spécifiques"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4. Nommez la couche résultante"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5. Exécutez l'analyse"
                />
              </ListItem>
            </List>
          </Box>
        );

      case 4: // Shortcuts
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Raccourcis clavier</Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Navigation dans la carte
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Zoom avant</Typography>
                    <ShortcutKey>+</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Zoom arrière</Typography>
                    <ShortcutKey>-</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Réinitialiser la vue</Typography>
                    <ShortcutKey>0</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Déplacer la carte</Typography>
                    <ShortcutKey>glisser</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Rotation de la carte</Typography>
                    <ShortcutKey>Maj + glisser</ShortcutKey>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Gestion du projet
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Annuler</Typography>
                    <ShortcutKey>Ctrl + Z</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Rétablir</Typography>
                    <ShortcutKey>Ctrl + Y</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Sauvegarder</Typography>
                    <ShortcutKey>Ctrl + S</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Importer</Typography>
                    <ShortcutKey>Ctrl + O</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Exporter</Typography>
                    <ShortcutKey>Ctrl + E</ShortcutKey>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Interface
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Basculer la barre latérale</Typography>
                    <ShortcutKey>Ctrl + B</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Aide</Typography>
                    <ShortcutKey>F1</ShortcutKey>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2">Plein écran</Typography>
                    <ShortcutKey>F11</ShortcutKey>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Astuces
            </Typography>
            <Typography paragraph>
              Maintenez la touche <ShortcutKey>Alt</ShortcutKey> en survolant un élément pour afficher plus d'informations.
            </Typography>
            <Typography paragraph>
              Utilisez la molette de la souris pour zoomer et dézoomer sur la carte.
            </Typography>
          </Box>
        );

      default:
        return <Typography>Section non trouvée</Typography>;
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Aide et documentation</Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {sections.map((section, index) => (
          <Tab
            key={section.id}
            icon={section.icon}
            label={section.name}
            id={`help-tab-${index}`}
            aria-controls={`help-tabpanel-${index}`}
          />
        ))}
      </Tabs>
      
      <DialogContent sx={{ display: 'flex', padding: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 3, overflow: 'auto', width: '100%' }}>
          {renderContent()}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="textSecondary" sx={{ flex: 1 }}>
          MapCraft version 1.0.0
        </Typography>
        <Button 
          onClick={onClose} 
          variant="outlined"
        >
          Fermer
        </Button>
        <Button 
          variant="contained"
          component={Link}
          href="https://github.com/yourusername/mapcraft"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation complète
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContextHelp;