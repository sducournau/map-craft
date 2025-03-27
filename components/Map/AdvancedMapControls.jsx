import React, { useState } from 'react';
import { 
  FiZoomIn, 
  FiZoomOut, 
  FiCompass, 
  FiHome, 
  FiList, 
  FiRotateCcw, 
  FiRotateCw,
  FiMaximize,
  FiChevronsUp,
  FiChevronsDown,
  FiLayers,
  FiMapPin,
  FiPlus,
  FiMinus,
  FiMove,
  FiSliders
} from 'react-icons/fi';
import { useMapStore } from '@/hooks/useMapState';

const AdvancedMapControls = () => {
  const { 
    viewState, 
    setViewState, 
    resetView,
    measureMode,
    setMeasureMode,
    toggleFullscreen
  } = useMapStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState('');
  
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
  const adjustPitch = (delta) => {
    setViewState({
      ...viewState,
      pitch: Math.max(0, Math.min(60, viewState.pitch + delta)),
      transitionDuration: 300
    });
  };
  
  // Goto initial position
  const goToInitialView = () => {
    resetView();
  };
  
  // Toggle measurement tools
  const toggleMeasurement = (mode) => {
    setMeasureMode(measureMode === mode ? null : mode);
  };
  
  // Helper for showing tooltips
  const handleShowTooltip = (id) => {
    setShowTooltip(id);
  };
  
  const handleHideTooltip = () => {
    setShowTooltip('');
  };
  
  // Render tooltip
  const renderTooltip = (id, text) => {
    if (showTooltip !== id) return null;
    
    return (
      <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 shadow-md rounded py-1 px-2 text-xs whitespace-nowrap">
        {text}
      </div>
    );
  };
  
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
      {/* Toggle controls expansion */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white dark:bg-slate-800 rounded-full h-10 w-10 flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors self-end"
        aria-label={isExpanded ? "Réduire les contrôles" : "Étendre les contrôles"}
      >
        <FiSliders className="w-5 h-5" />
      </button>
      
      {/* Main controls: always visible */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-2">
        <button 
          onClick={zoomIn}
          className="block w-8 h-8 my-1 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors relative"
          aria-label="Zoom avant"
          onMouseEnter={() => handleShowTooltip('zoomIn')}
          onMouseLeave={handleHideTooltip}
        >
          <FiZoomIn className="w-5 h-5" />
          {renderTooltip('zoomIn', 'Zoom avant')}
        </button>
        
        <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
        
        <button 
          onClick={zoomOut}
          className="block w-8 h-8 my-1 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors relative"
          aria-label="Zoom arrière"
          onMouseEnter={() => handleShowTooltip('zoomOut')}
          onMouseLeave={handleHideTooltip}
        >
          <FiZoomOut className="w-5 h-5" />
          {renderTooltip('zoomOut', 'Zoom arrière')}
        </button>
        
        <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
        
        <button 
          onClick={resetNorth}
          className="block w-8 h-8 my-1 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors relative"
          aria-label="Réinitialiser l'orientation"
          onMouseEnter={() => handleShowTooltip('resetNorth')}
          onMouseLeave={handleHideTooltip}
        >
          <FiCompass className="w-5 h-5" />
          {renderTooltip('resetNorth', 'Réinitialiser la rotation')}
        </button>
        
        {isExpanded && (
          <>
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
            
            <button 
              onClick={() => rotateMap(-45)}
              className="block w-8 h-8 my-1 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors relative"
              aria-label="Rotation anti-horaire"
              onMouseEnter={() => handleShowTooltip('rotateLeft')}
              onMouseLeave={handleHideTooltip}
            >
              <FiRotateCcw className="w-5 h-5" />
              {renderTooltip('rotateLeft', 'Rotation anti-horaire')}
            </button>
            
            <button 
              onClick={() => rotateMap(45)}
              className="block w-8 h-8 my-1 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors relative"
              aria-label="Rotation horaire"
              onMouseEnter={() => handleShowTooltip('rotateRight')}
              onMouseLeave={handleHideTooltip}
            >
              <FiRotateCw className="w-5 h-5" />
              {renderTooltip('rotateRight', 'Rotation horaire')}
            </button>
            
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
            
            <button 
              onClick={() => adjustPitch(15)}
              className="block w-8 h-8 my-1 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors relative"
              aria-label="Augmenter l'inclinaison"
              onMouseEnter={() => handleShowTooltip('pitchUp')}
              onMouseLeave={handleHideTooltip}
            >
              <FiChevronsUp className="w-5 h-5" />
              {renderTooltip('pitchUp', 'Augmenter l\'inclinaison')}
            </button>
            
            <button 
              onClick={() => adjustPitch(-15)}
              className="block w-8 h-8 my-1 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors relative"
              aria-label="Diminuer l'inclinaison"
              onMouseEnter={() => handleShowTooltip('pitchDown')}
              onMouseLeave={handleHideTooltip}
            >
              <FiChevronsDown className="w-5 h-5" />
              {renderTooltip('pitchDown', 'Diminuer l\'inclinaison')}
            </button>
            
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
          </>
        )}
        
        <button 
          onClick={goToInitialView}
          className="block w-8 h-8 my-1 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors relative"
          aria-label="Vue initiale"
          onMouseEnter={() => handleShowTooltip('initialView')}
          onMouseLeave={handleHideTooltip}
        >
          <FiHome className="w-5 h-5" />
          {renderTooltip('initialView', 'Revenir à la vue initiale')}
        </button>
        
        {isExpanded && (
          <>
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
            
            <button 
              onClick={toggleFullscreen}
              className="block w-8 h-8 my-1 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors relative"
              aria-label="Plein écran"
              onMouseEnter={() => handleShowTooltip('fullscreen')}
              onMouseLeave={handleHideTooltip}
            >
              <FiMaximize className="w-5 h-5" />
              {renderTooltip('fullscreen', 'Plein écran')}
            </button>
          </>
        )}
      </div>
      
      {/* Measurement tools */}
      {isExpanded && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-2">
          <button 
            onClick={() => toggleMeasurement('distance')}
            className={`block w-8 h-8 my-1 flex items-center justify-center rounded transition-colors relative ${
              measureMode === 'distance' 
                ? 'bg-slate-200 dark:bg-slate-600' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            aria-label="Mesurer une distance"
            onMouseEnter={() => handleShowTooltip('distance')}
            onMouseLeave={handleHideTooltip}
          >
            <FiMove className="w-5 h-5" />
            {renderTooltip('distance', 'Mesurer une distance')}
          </button>
          
          <button 
            onClick={() => toggleMeasurement('area')}
            className={`block w-8 h-8 my-1 flex items-center justify-center rounded transition-colors relative ${
              measureMode === 'area' 
                ? 'bg-slate-200 dark:bg-slate-600' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            aria-label="Mesurer une superficie"
            onMouseEnter={() => handleShowTooltip('area')}
            onMouseLeave={handleHideTooltip}
          >
            <FiLayers className="w-5 h-5" />
            {renderTooltip('area', 'Mesurer une superficie')}
          </button>
          
          <button 
            onClick={() => toggleMeasurement('position')}
            className={`block w-8 h-8 my-1 flex items-center justify-center rounded transition-colors relative ${
              measureMode === 'position' 
                ? 'bg-slate-200 dark:bg-slate-600' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            aria-label="Obtenir des coordonnées"
            onMouseEnter={() => handleShowTooltip('position')}
            onMouseLeave={handleHideTooltip}
          >
            <FiMapPin className="w-5 h-5" />
            {renderTooltip('position', 'Obtenir des coordonnées')}
          </button>
        </div>
      )}
      
      {/* Map information */}
      {isExpanded && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-2 text-xs font-mono">
          <div className="px-1 py-0.5">
            Zoom: {viewState.zoom.toFixed(1)}
          </div>
          <div className="px-1 py-0.5">
            Lat: {viewState.latitude.toFixed(4)}
          </div>
          <div className="px-1 py-0.5">
            Lon: {viewState.longitude.toFixed(4)}
          </div>
          {viewState.bearing !== 0 && (
            <div className="px-1 py-0.5">
              Rot: {viewState.bearing.toFixed(1)}°
            </div>
          )}
          {viewState.pitch !== 0 && (
            <div className="px-1 py-0.5">
              Inc: {viewState.pitch.toFixed(1)}°
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedMapControls;