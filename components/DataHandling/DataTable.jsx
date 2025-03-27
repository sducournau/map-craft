import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Typography,
  TextField,
  IconButton,
  Toolbar,
  Button,
  Divider,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import MapIcon from '@mui/icons-material/Map';
import SortIcon from '@mui/icons-material/Sort';
import TuneIcon from '@mui/icons-material/Tune';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import * as Papa from 'papaparse';

const DataTable = ({ data, onCreateLayer, onFilterChange }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);

  // Initialiser les données
  useEffect(() => {
    if (!data) return;
    
    let tableData = [];
    let columnList = [];
    
    // Traiter les données GeoJSON
    if (data.type === 'FeatureCollection' && data.features) {
      columnList = ['id', 'type', 'coordinates'];
      
      // Déterminer les propriétés disponibles à partir du premier élément
      if (data.features.length > 0 && data.features[0].properties) {
        Object.keys(data.features[0].properties).forEach(key => {
          if (!columnList.includes(key)) {
            columnList.push(key);
          }
        });
      }
      
      // Convertir les features en lignes de tableau
      tableData = data.features.map((feature, index) => {
        const { geometry, properties } = feature;
        
        // Créer une ligne de base
        const row = {
          id: feature.id || index,
          type: geometry?.type || 'Unknown',
          coordinates: formatCoordinates(geometry?.coordinates)
        };
        
        // Ajouter les propriétés
        if (properties) {
          Object.entries(properties).forEach(([key, value]) => {
            row[key] = value;
          });
        }
        
        return row;
      });
    } else if (Array.isArray(data)) {
      // Tableau d'objets simple
      if (data.length > 0) {
        columnList = Object.keys(data[0]);
        tableData = data.map((item, index) => ({ ...item, id: item.id || index }));
      }
    }
    
    setColumns(columnList);
    setVisibleColumns(columnList);
    setRows(tableData);
    setFilteredRows(tableData);
  }, [data]);

  // Formatage des coordonnées pour l'affichage
  const formatCoordinates = (coords) => {
    if (!coords) return 'N/A';
    
    // Point
    if (!Array.isArray(coords[0])) {
      return `[${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`;
    }
    
    // Multi-géométries: juste montrer le nombre de points
    return `${Array.isArray(coords[0][0]) ? coords.length : coords.length} points`;
  };

  // Filtrer les données selon le terme de recherche
  useEffect(() => {
    if (!rows.length) return;
    
    const filtered = rows.filter(row => {
      return Object.entries(row).some(([key, value]) => {
        if (!visibleColumns.includes(key)) return false;
        
        const stringValue = String(value).toLowerCase();
        return stringValue.includes(searchTerm.toLowerCase());
      });
    });
    
    setFilteredRows(filtered);
    setPage(0);
    
    if (onFilterChange) {
      onFilterChange(filtered);
    }
  }, [searchTerm, rows, visibleColumns, onFilterChange]);

  // Gérer le tri des colonnes
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    
    // Trier les données
    const sortedData = [...filteredRows].sort((a, b) => {
      const aValue = a[property];
      const bValue = b[property];
      
      // Gérer les valeurs null/undefined
      if (aValue === undefined || aValue === null) return isAsc ? -1 : 1;
      if (bValue === undefined || bValue === null) return isAsc ? 1 : -1;
      
      // Tri selon le type de données
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAsc ? aValue - bValue : bValue - aValue;
      }
      
      // Tri de texte par défaut
      return isAsc
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    
    setFilteredRows(sortedData);
  };

  // Gérer le changement de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gérer le changement du nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Télécharger les données au format CSV
  const handleDownloadCSV = () => {
    if (!filteredRows.length) return;
    
    const csvData = Papa.unparse(filteredRows.map(row => {
      const csvRow = {};
      visibleColumns.forEach(col => {
        csvRow[col] = row[col];
      });
      return csvRow;
    }));
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Créer une couche à partir des données
  const handleCreateLayer = () => {
    if (onCreateLayer) {
      onCreateLayer(filteredRows);
    }
  };

  // Gérer le menu de colonnes
  const handleColumnMenuOpen = (event) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => {
      if (prev.includes(column)) {
        return prev.filter(col => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  // Gérer les colonnes visibles
  const isColumnVisible = (column) => {
    return visibleColumns.includes(column);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <TextField
            placeholder="Rechercher..."
            size="small"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300, mr: 2 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Gérer les colonnes">
              <IconButton onClick={handleColumnMenuOpen}>
                <TuneIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={columnMenuAnchor}
              open={Boolean(columnMenuAnchor)}
              onClose={handleColumnMenuClose}
              PaperProps={{
                sx: { maxHeight: 300 }
              }}
            >
              {columns.map(column => (
                <MenuItem key={column} onClick={() => toggleColumnVisibility(column)}>
                  <ListItemIcon></ListItemIcon>
                  {isColumnVisible(column) ? (
                      <VisibilityIcon fontSize="small" />
                    ) : (
                      <VisibilityOffIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={column} />
                </MenuItem>
              ))}
            </Menu>
            
            <Tooltip title="Trier">
              <IconButton>
                <SortIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Filtrer">
              <IconButton>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<MapIcon />}
              onClick={handleCreateLayer}
              disabled={!filteredRows.length}
            >
              Créer une couche
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadCSV}
              disabled={!filteredRows.length}
            >
              Exporter CSV
            </Button>
          </Box>
        </Toolbar>
        
        <Divider />
        
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.filter(column => isColumnVisible(column)).map(column => (
                  <TableCell
                    key={column}
                    sortDirection={orderBy === column ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column}
                      direction={orderBy === column ? order : 'asc'}
                      onClick={() => handleSort(column)}
                    >
                      {column}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover key={row.id || index}>
                    {columns.filter(column => isColumnVisible(column)).map(column => (
                      <TableCell key={column}>
                        {formatCellValue(row[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} align="center">
                    Aucune donnée correspondante
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
      
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredRows.length} résultats sur {rows.length} entrées
        </Typography>
        {searchTerm && (
          <Chip
            label={`Recherche: "${searchTerm}"`}
            onDelete={() => setSearchTerm('')}
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </Box>
    </Box>
  );
};

// Fonction utilitaire pour formater les valeurs des cellules
const formatCellValue = (value) => {
  if (value === null || value === undefined) {
    return '-';
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value).substring(0, 50);
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non';
  }
  
  return String(value);
};

export default DataTable;