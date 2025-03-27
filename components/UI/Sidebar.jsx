import React, { useState } from 'react';
import { 
  FiLayers, 
  FiMap, 
  FiChevronLeft, 
  FiChevronRight, 
  FiUploadCloud, 
  FiDownload, 
  FiSettings, 
  FiSun, 
  FiMoon, 
  FiInfo,
  FiDatabase,
  FiCpu,
  FiBarChart2,
  FiUndo,
  FiRedo,
  FiClipboard
} from 'react-icons/fi';
import { useSidebarStore } from '@/hooks/useSidebarState';
import { useThemeStore } from '@/hooks/useThemeState';
import { useHistoryStore } from '@/hooks/useHistoryStore';
import LayerSidebar from './LayerSidebar';
import BasemapSelector from './BasemapSelector';
import DataImport from '../DataHandling/DataImport';
import ExportDialog from '../DataHandling/ExportDialog';
import SpatialAnalysis from '../Analysis/SpatialAnalysis';
import ContextHelp from './ContextHelp';
import ProjectSettings from './ProjectSettings';
import LayerStyleEditor from './LayerStyleEditor';
import { useLayerManager } from '@/hooks/useLayerManager';

const Sidebar = () => {
  const { isOpen, setIsOpen, activeTab, setActiveTab } = useSidebarStore();
  const { theme, toggleTheme } = useThemeStore();
  const { undo, redo } = useHistoryStore();
  const { activeLayer } = useLayerManager();
  
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [editingStyle, setEditingStyle] = useState(false);
  
  const tabs = [
    { id: 'layers', icon: <FiLayers />, title: 'Couches' },
    { id: 'basemaps', icon: <FiMap />, title: 'Fond de carte' },
    { id: 'data', icon: <FiDatabase />, title: 'Données' },
    { id: 'analysis', icon: <FiBarChart2 />, title: 'Analyse' },
    { id: 'settings', icon: <FiSettings />, title: 'Projet' }
  ];
  
  // Gérer les raccourcis clavier
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    }
  };
  
  return (
    <>
      <div 
        className={`bg-white dark:bg-slate-800 h-full shadow-lg transition-all duration-300 flex flex-col ${
          isOpen ? 'w-72' : 'w-16'
        }`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-slate-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-slate-900 font-bold text-lg">
                M
              </div>
              <h1 className="text-lg font-semibold">MapCraft</h1>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto bg-slate-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-slate-900 font-bold text-lg">
              M
            </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors"
            aria-label={isOpen ? 'Réduire' : 'Agrandir'}
          >
            {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        </div>
        
        <div className="flex flex-col flex-grow overflow-hidden">
          <nav className="p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 py-2 px-3 rounded-md w-full text-left transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span className="text-xl">{tab.icon}</span>
                {isOpen && <span>{tab.title}</span>}
              </button>
            ))}
          </nav>
          
          {isOpen && (
            <div className="flex-grow overflow-hidden">
              {/* Contenu des onglets */}
              {activeTab === 'layers' && (
                <div className="h-full">
                  {activeLayer && editingStyle ? (
                    <LayerStyleEditor onClose={() => setEditingStyle(false)} />
                  ) : (
                    <LayerSidebar 
                      onImportData={() => setShowImport(true)}
                      onShowAnalysis={() => setShowAnalysis(true)}
                      onStyleEdit={() => setEditingStyle(true)}
                    />
                  )}
                </div>
              )}
              
              {activeTab === 'basemaps' && (
                <div className="p-3 h-full overflow-y-auto">
                  <BasemapSelector />
                </div>
              )}
              
              {activeTab === 'data' && (
                <div className="p-3 h-full overflow-y-auto">
                  <h3 className="font-medium mb-3">Gestion des données</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowImport(true)}
                      className="w-full py-2 px-3 flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiUploadCloud className="text-slate-500 dark:text-slate-400" />
                      <span>Importer des données</span>
                    </button>
                    
                    <button
                      onClick={() => setShowExport(true)}
                      className="w-full py-2 px-3 flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiDownload className="text-slate-500 dark:text-slate-400" />
                      <span>Exporter</span>
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Historique d'imports</h4>
                    <div className="border rounded-md border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                      <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                        <p>Aucun historique récent</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'analysis' && (
                <div className="p-3 h-full overflow-y-auto">
                  <h3 className="font-medium mb-3">Analyses cartographiques</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAnalysis(true)}
                      className="w-full py-2 px-3 flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiCpu className="text-slate-500 dark:text-slate-400" />
                      <span>Analyse spatiale</span>
                    </button>
                    
                    <button
                      className="w-full py-2 px-3 flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiBarChart2 className="text-slate-500 dark:text-slate-400" />
                      <span>Statistiques</span>
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Analyses récentes</h4>
                    <div className="border rounded-md border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                      <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                        <p>Aucune analyse récente</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="p-3 h-full overflow-y-auto">
                  <h3 className="font-medium mb-3">Paramètres du projet</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-full py-2 px-3 flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiSettings className="text-slate-500 dark:text-slate-400" />
                      <span>Configuration du projet</span>
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={undo}
                        className="flex-1 py-2 px-3 flex items-center justify-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Annuler (Ctrl+Z)"
                      >
                        <FiUndo className="text-slate-500 dark:text-slate-400" />
                        <span>Annuler</span>
                      </button>
                      
                      <button
                        onClick={redo}
                        className="flex-1 py-2 px-3 flex items-center justify-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Rétablir (Ctrl+Y)"
                      >
                        <FiRedo className="text-slate-500 dark:text-slate-400" />
                        <span>Rétablir</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Projets sauvegardés</h4>
                    <div className="border rounded-md border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                      <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                        <p>Aucun projet sauvegardé</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 p-2">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setShowImport(true)}
              className="flex flex-col items-center p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              aria-label="Importer des données"
            >
              <FiUploadCloud className="text-xl" />
              {isOpen && <span className="text-xs mt-1">Importer</span>}
            </button>
            
            <button
              onClick={() => setShowExport(true)}
              className="flex flex-col items-center p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              aria-label="Exporter"
            >
              <FiDownload className="text-xl" />
              {isOpen && <span className="text-xs mt-1">Exporter</span>}
            </button>
            
            <button
              onClick={() => setShowHelp(true)}
              className="flex flex-col items-center p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              aria-label="Aide"
            >
              <FiInfo className="text-xl" />
              {isOpen && <span className="text-xs mt-1">Aide</span>}
            </button>
            
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? (
                <>
                  <FiSun className="text-xl" />
                  {isOpen && <span className="text-xs mt-1">Jour</span>}
                </>
              ) : (
                <>
                  <FiMoon className="text-xl" />
                  {isOpen && <span className="text-xs mt-1">Nuit</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      {showImport && (
        <DataImport onClose={() => setShowImport(false)} />
      )}
      
      {showExport && (
        <ExportDialog onClose={() => setShowExport(false)} />
      )}
      
      {showAnalysis && (
        <SpatialAnalysis onClose={() => setShowAnalysis(false)} />
      )}
      
      {showHelp && (
        <ContextHelp onClose={() => setShowHelp(false)} />
      )}
      
      {showSettings && (
        <ProjectSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

export default Sidebar;