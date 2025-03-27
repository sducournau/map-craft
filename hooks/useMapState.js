import { create } from 'zustand';

const useMapState = create((set, get) => ({
  // Map view state
  viewState: {
    longitude: 2.3522,  // Paris (center of France)
    latitude: 46.2276,
    zoom: 5,
    pitch: 0,
    bearing: 0,
    transitionDuration: 0
  },
  
  // Measurement mode
  measureMode: null,
  isFullscreen: false,
  
  // Set view state
  setViewState: (newViewState) => set({ viewState: newViewState }),
  
  // Fly to location
  flyTo: (longitude, latitude, zoom = 10) => set(state => ({
    viewState: {
      ...state.viewState,
      longitude,
      latitude,
      zoom,
      transitionDuration: 1000
    }
  })),
  
  // Toggle 3D mode
  toggle3D: (enabled) => set(state => ({
    viewState: {
      ...state.viewState,
      pitch: enabled ? 45 : 0,
      transitionDuration: 500
    }
  })),
  
  // Reset view
  resetView: () => set({
    viewState: {
      longitude: 2.3522,
      latitude: 46.2276,
      zoom: 5,
      pitch: 0,
      bearing: 0,
      transitionDuration: 1000
    }
  }),
  
  // Set measurement mode
  setMeasureMode: (mode) => set({ measureMode: mode }),
  
  // Toggle fullscreen
  toggleFullscreen: () => set(state => ({ isFullscreen: !state.isFullscreen }))
}));

export default useMapState;