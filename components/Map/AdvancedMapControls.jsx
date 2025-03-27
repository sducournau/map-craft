import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  IconButton, 
  Tooltip, 
  Divider,
  Fade,
  Zoom,
  Collapse,
  Typography,
  Slider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CompassIcon from '@mui/icons-material/Explore';
import HomeIcon from '@mui/icons-material/Home';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TimelineIcon from '@mui/icons-material/Timeline';
import TuneIcon from '@mui/icons-material/Tune';
import MapIcon from '@mui/icons-material/Map';
import TerrainIcon from '@mui/icons-material/Terrain';
import GridOnIcon from '@mui/icons-material/GridOn';
import useMapStore from '../../hooks/useMapState.js';

// Styled components
const ControlPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[4],
}));

const ControlButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 0,
  padding: theme.spacing(1.5),
  color: theme.palette.text.primary,
}));

const InfoBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  fontSize: '0.75rem',
  fontFamily: 'monospace',
}));

const AdvancedMapControls = () => {
  const theme = useTheme();
  const { 
    viewState, 
    setViewState, 
    resetView,
    measureMode,
    setMeasureMode,
    toggleFullscreen,
    isFullscreen,
  } = useMapStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showControls, setShowControls] = useState({
    rotation: false,
    perspective: false,
    measure: false,
  });
  
  // Zoom in/out
  const zoomIn = () => {
    setViewState({
      ...viewState,
      zoom: Math.min(viewState.zoom + 1, 20),
      transitionDuration: 300
    });
  };
  
  const zoomOut = () => {
    setViewState({
      ...viewState,
      zoom: Math.max(viewState.zoom - 1, 1),
      transitionDuration: 300
    });
  };
  
  // Reset orientation
  const resetNorth = () => {
    setViewState({
      ...viewState,
      bearing: 0,
      pitch: 0,
      transitionDuration: 500
    });
  };
  
  // Rotate the map
  const rotateMap = (degrees) => {
    setViewState({
      ...viewState,
      bearing: (viewState.bearing + degrees) % 360,
      transitionDuration: 300
    });
  };
  
  // Control the pitch
  const adjustPitch = (newPitch) => {
    setViewState({
      ...viewState,
      pitch: newPitch,
      transitionDuration: 300
    });
  };
  
  // Goto initial position
  const goToInitialView = () => {
    resetView();
  };
  
  // Toggle specific control panels
  const toggleControlPanel = (panel) => {
    setShowControls(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
    
    // Auto expand when showing a panel
    if (!showControls[panel] && !isExpanded) {
      setIsExpanded(true);
    }
  };

  // Toggle expanded controls
  const handleExpandControls = () => {
    setIsExpanded(!isExpanded);
    
    // Reset panels when collapsing
    if (isExpanded) {
      setShowControls({
        rotation: false,
        perspective: false,
        measure: false,
      });
    }
  };
  
  return (
    <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
        {/* Information panel */}
        <Fade in={isExpanded}>
          <InfoBox sx={{ display: isExpanded ? 'block' : 'none', mb: 1 }}>
            <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>Zoom:</Typography>
              <Typography variant="caption">{viewState.zoom.toFixed(1)}</Typography>
            </Box>
            <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>Lat:</Typography>
              <Typography variant="caption">{viewState.latitude.toFixed(4)}</Typography>
            </Box>
            <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>Lon:</Typography>
              <Typography variant="caption">{viewState.longitude.toFixed(4)}</Typography>
            </Box>
            {viewState.bearing !== 0 && (
              <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>Rot:</Typography>
                <Typography variant="caption">{viewState.bearing.toFixed(1)}°</Typography>
              </Box>
            )}
            {viewState.pitch !== 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>Inc:</Typography>
                <Typography variant="caption">{viewState.pitch.toFixed(1)}°</Typography>
              </Box>
            )}
          </InfoBox>
        </Fade>
        
        {/* Rotation controls */}
        <Collapse in={showControls.rotation} sx={{ width: 'auto', alignSelf: 'flex-end' }}>
          <ControlPaper elevation={4}>
            <Box sx={{ p: 2, width: 200 }}>
              <Typography variant="subtitle2" gutterBottom>
                Rotation de la carte
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value="rotate"
                >
                  <ToggleButton value="rotate">
                    <RotateLeftIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="reset" onClick={resetNorth}>
                    <CompassIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="rotateRight">
                    <RotateRightIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Typography variant="caption" gutterBottom>
                Angle: {viewState.bearing.toFixed(1)}°
              </Typography>
              
              <Slider
                size="small"
                value={viewState.bearing}
                min={0}
                max={360}
                step={15}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => {
                  setViewState({
                    ...viewState,
                    bearing: value,
                    transitionDuration: 300
                  });
                }}
              />
            </Box>
          </ControlPaper>
        </Collapse>
        
        {/* Perspective controls */}
        <Collapse in={showControls.perspective} sx={{ width: 'auto', alignSelf: 'flex-end' }}>
          <ControlPaper elevation={4}>
            <Box sx={{ p: 2, width: 200 }}>
              <Typography variant="subtitle2" gutterBottom>
                Inclinaison 3D
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ToggleButtonGroup
                  size="small"
                  value={viewState.pitch > 0 ? 'perspective' : 'flat'}
                  exclusive
                  onChange={(_, value) => {
                    if (value === 'flat') {
                      adjustPitch(0);
                    } else if (value === 'perspective') {
                      adjustPitch(45);
                    }
                  }}
                >
                  <ToggleButton value="flat">
                    <MapIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="perspective">
                    <TerrainIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Typography variant="caption" gutterBottom>
                Inclinaison: {viewState.pitch.toFixed(1)}°
              </Typography>
              
              <Slider
                size="small"
                value={viewState.pitch}
                min={0}
                max={60}
                step={5}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => adjustPitch(value)}
              />
            </Box>
          </ControlPaper>
        </Collapse>
        
        {/* Measurement tools */}
        <Collapse in={showControls.measure} sx={{ width: 'auto', alignSelf: 'flex-end' }}>
          <ControlPaper elevation={4}>
            <Box sx={{ p: 2, width: 200 }}>
              <Typography variant="subtitle2" gutterBottom>
                Outils de mesure
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <ToggleButtonGroup
                  size="small"
                  value={measureMode}
                  exclusive
                  onChange={(_, value) => {
                    if (value !== null) {
                      setMeasureMode(value);
                    }
                  }}
                >
                  <ToggleButton value="distance">
                    <TimelineIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="area">
                    <GridOnIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="position">
                    <MapIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Typography variant="caption">
                {measureMode === 'distance' && 'Cliquez sur la carte pour mesurer une distance'}
                {measureMode === 'area' && 'Cliquez sur la carte pour mesurer une surface'}
                {measureMode === 'position' && 'Cliquez sur la carte pour obtenir des coordonnées'}
                {!measureMode && 'Sélectionnez un outil de mesure'}
              </Typography>
            </Box>
          </ControlPaper>
        </Collapse>
        
        {/* Main controls button */}
        <ControlPaper>
          <Tooltip title="Afficher plus de contrôles" placement="left">
            <ControlButton onClick={handleExpandControls}>
              {isExpanded ? <MoreVertIcon /> : <TuneIcon />}
            </ControlButton>
          </Tooltip>
        </ControlPaper>
        
        {/* Main controls panel */}
        <ControlPaper>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Tooltip title="Zoom avant" placement="left">
              <ControlButton onClick={zoomIn}>
                <ZoomInIcon />
              </ControlButton>
            </Tooltip>
            
            <Divider />
            
            <Tooltip title="Zoom arrière" placement="left">
              <ControlButton onClick={zoomOut}>
                <ZoomOutIcon />
              </ControlButton>
            </Tooltip>
            
            <Divider />
            
            <Tooltip title="Réinitialiser le nord" placement="left">
              <ControlButton onClick={resetNorth}>
                <CompassIcon />
              </ControlButton>
            </Tooltip>
            
            {isExpanded && (
              <>
                <Divider />
                
                <Tooltip title="Rotation" placement="left">
                  <ControlButton 
                    onClick={() => toggleControlPanel('rotation')}
                    color={showControls.rotation ? 'primary' : 'default'}
                  >
                    <RotateRightIcon />
                  </ControlButton>
                </Tooltip>
                
                <Divider />
                
                <Tooltip title="Vue 3D" placement="left">
                  <ControlButton 
                    onClick={() => toggleControlPanel('perspective')}
                    color={showControls.perspective ? 'primary' : 'default'}
                  >
                    <ViewInArIcon />
                  </ControlButton>
                </Tooltip>
                
                <Divider />
                
                <Tooltip title="Outils de mesure" placement="left">
                  <ControlButton 
                    onClick={() => toggleControlPanel('measure')}
                    color={showControls.measure ? 'primary' : 'default'}
                  >
                    <TimelineIcon />
                  </ControlButton>
                </Tooltip>
                
                <Divider />
                
                <Tooltip title="Plein écran" placement="left">
                  <ControlButton onClick={toggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </ControlButton>
                </Tooltip>
                
                <Divider />
              </>
            )}
            
            <Tooltip title="Vue initiale" placement="left">
              <ControlButton onClick={goToInitialView}>
                <HomeIcon />
              </ControlButton>
            </Tooltip>
          </Box>
        </ControlPaper>
      </Box>
    </Box>
  );
};

export default AdvancedMapControls;