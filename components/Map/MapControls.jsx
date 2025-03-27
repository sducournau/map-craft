import React, { useState, useEffect } from 'react';
import useMapState from '../../hooks/useMapState';

const MapControls = () => {
  const { viewState, setViewState } = useMapState();
  const [is3D, setIs3D] = useState(false);
  
  useEffect(() => {
    // Initialize tooltips
    if (typeof window !== 'undefined') {
      const M = require('materialize-css');
      M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
    }
  }, []);

  // Zoom in on the map
  const handleZoomIn = () => {
    setViewState({
      ...viewState,
      zoom: viewState.zoom + 1,
      transitionDuration: 300
    });
  };

  // Zoom out on the map
  const handleZoomOut = () => {
    setViewState({
      ...viewState,
      zoom: viewState.zoom - 1,
      transitionDuration: 300
    });
  };

  // Reset orientation to north
  const handleResetNorth = () => {
    setViewState({
      ...viewState,
      bearing: 0,
      transitionDuration: 500
    });
  };

  // Toggle 3D perspective
  const handle3DToggle = () => {
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    setViewState({
      ...viewState,
      pitch: newIs3D ? 45 : 0,
      transitionDuration: 500
    });
  };

  // Reset the view (return to initial view)
  const handleResetView = () => {
    setViewState({
      longitude: 2.3522,  // Paris (center of France)
      latitude: 46.2276,
      zoom: 5,
      pitch: 0,
      bearing: 0,
      transitionDuration: 1000
    });
    setIs3D(false);
  };

  return (
    <div className="map-control-panel">
      <div className="map-control-buttons">
        <button 
          className="btn-floating waves-effect waves-light tooltipped"
          data-position="left" 
          data-tooltip="Zoom in"
          onClick={handleZoomIn}
        >
          <i className="material-icons">add</i>
        </button>
        
        <button 
          className="btn-floating waves-effect waves-light tooltipped"
          data-position="left" 
          data-tooltip="Zoom out"
          onClick={handleZoomOut}
        >
          <i className="material-icons">remove</i>
        </button>
        
        <button 
          className="btn-floating waves-effect waves-light tooltipped"
          data-position="left" 
          data-tooltip="Reset north"
          onClick={handleResetNorth}
        >
          <i className="material-icons">navigation</i>
        </button>
        
        <button 
          className="btn-floating waves-effect waves-light tooltipped"
          data-position="left" 
          data-tooltip={is3D ? "2D view" : "3D view"}
          onClick={handle3DToggle}
        >
          <i className="material-icons">{is3D ? "map" : "view_in_ar"}</i>
        </button>
        
        <button 
          className="btn-floating waves-effect waves-light tooltipped"
          data-position="left" 
          data-tooltip="Reset view"
          onClick={handleResetView}
        >
          <i className="material-icons">home</i>
        </button>
      </div>
    </div>
  );
};

export default MapControls;