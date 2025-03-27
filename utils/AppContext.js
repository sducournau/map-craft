import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { nanoid } from 'nanoid/non-secure';
import useLayerManager from '../hooks/useLayerManager';
import useMapState from '../hooks/useMapState';
import useDataState from '../hooks/useDataState';
import useHistoryStore from '../hooks/useHistoryStore';

// Création du contexte
const AppContext = createContext();

// Actions pour le reducer
const APP_ACTIONS = {
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  HIDE_NOTIFICATION: 'HIDE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SHOW_DIALOG: 'SHOW_DIALOG',
  HIDE_DIALOG: 'HIDE_DIALOG',
  SET_APP_STATE: 'SET_APP_STATE'
};

// État initial
const initialState = {
  loading: false,
  error: null,
  notification: null,
  dialog: {
    open: false,
    type: null,
    props: {}
  },
  isInitialized: false,
  lastSaved: null
};

// Reducer pour gérer les actions
function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.SHOW_NOTIFICATION:
      return {
        ...state,
        notification: {
          id: nanoid(),
          message: action.payload.message,
          type: action.payload.type || 'info',
          duration: action.payload.duration || 6000,
          action: action.payload.action
        }
      };
      
    case APP_ACTIONS.HIDE_NOTIFICATION:
      return {
        ...state,
        notification: null
      };
      
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
      
    case APP_ACTIONS.SHOW_DIALOG:
      return {
        ...state,
        dialog: {
          open: true,
          type: action.payload.type,
          props: action.payload.props || {}
        }
      };
      
    case APP_ACTIONS.HIDE_DIALOG:
      return {
        ...state,
        dialog: {
          ...state.dialog,
          open: false
        }
      };
      
    case APP_ACTIONS.SET_APP_STATE:
      return {
        ...state,
        ...action.payload
      };
      
    default:
      return state;
  }
}

// Provider du contexte
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const layerManager = useLayerManager();
  const mapState = useMapState();
  const dataState = useDataState();
  const historyStore = useHistoryStore();
  
  // Actions d'utilité
  const showNotification = (message, type = 'info', duration = 6000, action = null) => {
    dispatch({ 
      type: APP_ACTIONS.SHOW_NOTIFICATION, 
      payload: { message, type, duration, action } 
    });
  };
  
  const hideNotification = () => {
    dispatch({ type: APP_ACTIONS.HIDE_NOTIFICATION });
  };
  
  const setLoading = (isLoading) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: isLoading });
  };
  
  const setError = (error) => {
    dispatch({ type: APP_ACTIONS.SET_ERROR, payload: error });
    if (error) {
      showNotification(
        typeof error === 'string' ? error : error.message,
        'error'
      );
    }
  };
  
  const showDialog = (dialogType, props = {}) => {
    dispatch({ 
      type: APP_ACTIONS.SHOW_DIALOG, 
      payload: { type: dialogType, props } 
    });
  };
  
  const hideDialog = () => {
    dispatch({ type: APP_ACTIONS.HIDE_DIALOG });
  };
  
  // Fonction pour sauvegarder l'état complet de l'application
  const saveAppState = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'état des différents magasins
      const layerState = layerManager.layers;
      const mapStateData = mapState.viewState;
      
      // Créer un objet d'état complet
      const appState = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        layers: layerState,
        mapView: mapStateData,
        // Autres états au besoin
      };
      
      // Enregistrer dans localStorage pour l'instant (à adapter pour IndexedDB)
      if (typeof window !== 'undefined') {
        localStorage.setItem('mapcraft_app_state', JSON.stringify(appState));
      }
      
      // Mettre à jour l'état
      dispatch({
        type: APP_ACTIONS.SET_APP_STATE,
        payload: { lastSaved: new Date().toISOString() }
      });
      
      showNotification('Application sauvegardée avec succès', 'success');
    } catch (error) {
      setError('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour restaurer l'état sauvegardé
  const restoreAppState = async () => {
    try {
      setLoading(true);
      
      // Charger depuis localStorage (à adapter pour IndexedDB)
      if (typeof window !== 'undefined') {
        const savedState = localStorage.getItem('mapcraft_app_state');
        
        if (savedState) {
          const appState = JSON.parse(savedState);
          
          // Restaurer les différents états
          if (appState.layers) {
            layerManager.setLayers(appState.layers);
          }
          
          if (appState.mapView) {
            mapState.setViewState(appState.mapView);
          }
          
          // Mise à jour de l'état
          dispatch({
            type: APP_ACTIONS.SET_APP_STATE,
            payload: { lastSaved: appState.timestamp }
          });
          
          showNotification('État de l\'application restauré', 'success');
        } else {
          showNotification('Aucune sauvegarde trouvée', 'info');
        }
      }
    } catch (error) {
      setError('Erreur lors de la restauration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Valeur du contexte
  const value = {
    ...state,
    showNotification,
    hideNotification,
    setLoading,
    setError,
    showDialog,
    hideDialog,
    saveAppState,
    restoreAppState,
    layerManager,
    mapState,
    dataState,
    historyStore
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext doit être utilisé à l\'intérieur d\'un AppProvider');
  }
  return context;
}

export default AppContext;