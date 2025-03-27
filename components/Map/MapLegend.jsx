import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fade,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LayersIcon from '@mui/icons-material/Layers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import useLayerManager from '../../hooks/useLayerManager.js';

// Styled components
const LegendContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: 16,
  left: 16,
  maxWidth: 300,
  maxHeight: 'calc(100vh - 200px)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 10,
  transition: theme.transitions.create(['width', 'height'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter,
  }),
}));

const LegendHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  cursor: 'pointer',
}));

const LegendContent = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  padding: theme.spacing(0, 2, 2, 2),
  flexGrow: 1,
}));

const ColorScale = styled(Box)(({ gradient, theme }) => ({
  height: 12,
  width: '100%',
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  borderRadius: 3,
  background: gradient,
}));

const ColorDot = styled(Box)(({ color, theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: color,
  display: 'inline-block',
  marginRight: theme.spacing(1.5),
}));

const ColorBar = styled(Box)(({ color, theme }) => ({
  width: 12,
  height: 6,
  backgroundColor: color,
  display: 'inline-block',
  marginRight: theme.spacing(1.5),
}));

const MapLegend = () => {
  const theme = useTheme();
  const { layers, visibleLayers, toggleLayerVisibility } = useLayerManager();
  const [collapsed, setCollapsed] = useState(false);
  const [legendItems, setLegendItems] = useState([]);

  // Update legend items when visible layers change
  useEffect(() => {
    // Filter visible layers that have style information
    const visibleLayerObjects = layers
      .filter(layer => visibleLayers.includes(layer.id))
      .filter(layer => layer.style); // Only include layers with style information
    
    setLegendItems(visibleLayerObjects);
  }, [layers, visibleLayers]);

  // Toggle legend collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // If no visible layers with style, don't show the legend
  if (legendItems.length === 0) {
    return null;
  }

  // Render color scale
  const renderColorScale = (style) => {
    if (!style) return null;

    // For fixed color
    if (!style.colorField && style.color) {
      const color = Array.isArray(style.color)
        ? `rgba(${style.color[0]}, ${style.color[1]}, ${style.color[2]}, ${style.opacity || 1})`
        : style.color;
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
          <ColorDot color={color} />
          <Typography variant="caption">Couleur unique</Typography>
        </Box>
      );
    }

    // For color ranges
    if (style.colorField && style.colorRange) {
      const gradient = `linear-gradient(to right, ${style.colorRange.map(color => 
        `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${style.opacity || 1})`
      ).join(', ')})`;

      return (
        <Box sx={{ my: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {style.colorField}
            </Typography>
            {style.classificationMethod && (
              <Tooltip title={`Classification: ${getClassificationMethodName(style.classificationMethod)}`}>
                <InfoOutlinedIcon fontSize="inherit" sx={{ ml: 1, color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            )}
          </Box>
          <ColorScale gradient={gradient} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption">Min</Typography>
            <Typography variant="caption">Max</Typography>
          </Box>
        </Box>
      );
    }

    return null;
  };

  // Get classification method display name
  const getClassificationMethodName = (method) => {
    switch (method) {
      case 'quantile':
        return 'Quantiles';
      case 'equal':
        return 'Intervalles égaux';
      case 'jenks':
        return 'Natural Breaks (Jenks)';
      default:
        return method;
    }
  };

  // Render size scale
  const renderSizeScale = (style) => {
    if (!style || !style.sizeField) return null;
    
    return (
      <Box sx={{ my: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
          Taille: {style.sizeField}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'text.secondary',
            }}
          />
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: 'text.secondary',
            }}
          />
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              bgcolor: 'text.secondary',
            }}
          />
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', ml: 1 }}>
            <Typography variant="caption">Min</Typography>
            <Typography variant="caption">Max</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render 3D scale
  const render3DScale = (style) => {
    if (!style || !style.extruded || !style.heightField) return null;
    
    return (
      <Box sx={{ my: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
          Hauteur 3D: {style.heightField}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
          <Box
            sx={{
              width: 8,
              height: 4,
              bgcolor: 'text.secondary',
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              bgcolor: 'text.secondary',
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 12,
              bgcolor: 'text.secondary',
            }}
          />
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', ml: 1 }}>
            <Typography variant="caption">Min</Typography>
            <Typography variant="caption">Max</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render type icon
  const renderTypeIcon = (type, style) => {
    switch (type) {
      case 'point':
        return <ColorDot color={rgbToColor(style?.color, style?.opacity)} />;
      case 'choropleth':
        return <Box 
                sx={{ 
                  width: 14, 
                  height: 14, 
                  backgroundColor: rgbToColor(style?.color, style?.opacity),
                  border: style?.stroked ? `1px solid ${rgbToColor(style?.lineColor || [0, 0, 0])}` : 'none',
                  borderRadius: '2px',
                  mr: 1.5
                }} 
              />;
      case 'heatmap':
        return <Box 
                sx={{ 
                  width: 14, 
                  height: 6, 
                  background: style?.colorRange ? 
                    `linear-gradient(to right, ${style.colorRange.map(color => 
                      rgbToColor(color, style.opacity)
                    ).join(', ')})` : 
                    rgbToColor([255, 0, 0], style?.opacity),
                  borderRadius: '2px',
                  mr: 1.5
                }} 
              />;
      case 'line':
        return <ColorBar color={rgbToColor(style?.color, style?.opacity)} />;
      case '3d':
        return <Box sx={{ position: 'relative', mr: 1.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: rgbToColor(style?.color, (style?.opacity || 0.8) * 0.7),
                    position: 'absolute',
                    top: 2,
                    left: 2,
                  }}
                />
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: rgbToColor(style?.color, style?.opacity),
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    border: style?.wireframe ? `1px solid ${theme.palette.common.white}` : 'none',
                  }}
                />
              </Box>;
      default:
        return <LayersIcon fontSize="small" sx={{ mr: 1 }} />;
    }
  };

  // Helper to convert RGB array to color string
  const rgbToColor = (rgb, opacity = 1) => {
    if (!rgb || !Array.isArray(rgb)) return 'rgba(100, 100, 100, 1)';
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity || 1})`;
  };

  return (
    <Fade in={true}>
      <LegendContainer elevation={3}>
        <LegendHeader onClick={toggleCollapse}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ListAltIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> {/* Changed from LegendIcon */}
            <Typography variant="subtitle2">Légende</Typography>
          </Box>
          <IconButton
            size="small"
            aria-label={collapsed ? "Expand" : "Collapse"}
            sx={{ p: 0.5 }}
          >
            {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </LegendHeader>
        
        <Divider />
        
        <Collapse in={!collapsed} timeout="auto">
          <LegendContent>
            <List dense disablePadding>
              {legendItems.map((layer) => (
                <React.Fragment key={layer.id}>
                  <ListItem 
                    sx={{ 
                      px: 0, 
                      py: 0.75,
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                    }}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.id);
                        }}
                      >
                        {visibleLayers.includes(layer.id) ? 
                          <VisibilityIcon fontSize="small" /> : 
                          <VisibilityOffIcon fontSize="small" />
                        }
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      {renderTypeIcon(layer.type, layer.style)}
                    </ListItemIcon>
                    <ListItemText
                      primary={layer.title || layer.id}
                      primaryTypographyProps={{ 
                        variant: 'body2', 
                        fontWeight: 500,
                        noWrap: true 
                      }}
                    />
                  </ListItem>
                  
                  <Box sx={{ pl: 3.5, pb: 1, pt: 0.5 }}>
                    {/* Color scale */}
                    {renderColorScale(layer.style)}
                    
                    {/* Size scale */}
                    {renderSizeScale(layer.style)}
                    
                    {/* 3D scale */}
                    {render3DScale(layer.style)}
                  </Box>
                </React.Fragment>
              ))}
            </List>
          </LegendContent>
        </Collapse>
      </LegendContainer>
    </Fade>
  );
};

export default MapLegend;