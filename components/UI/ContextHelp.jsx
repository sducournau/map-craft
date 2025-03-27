import React, { useState } from 'react';
import { FiX, FiInfo, FiBook, FiHelpCircle, FiExternalLink } from 'react-icons/fi';

const ContextHelp = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: 'Aperçu', icon: <FiInfo /> },
    { id: 'data', name: 'Données', icon: <FiBook /> },
    { id: 'layers', name: 'Couches', icon: <FiBook /> },
    { id: 'analysis', name: 'Analyse', icon: <FiBook /> },
    { id: 'shortcuts', name: 'Raccourcis', icon: <FiBook /> }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <h3 className="text-lg font-medium mb-3">Bienvenue dans MapCraft</h3>
            <p className="mb-3">
              MapCraft est un éditeur cartographique Web qui vous permet de créer, visualiser et analyser des données géospatiales directement dans votre navigateur.
            </p>
            <h4 className="font-medium mb-2">Principales fonctionnalités :</h4>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Importation de données GeoJSON et CSV avec coordonnées</li>
              <li>Visualisation sous forme de points, choroplèthes, cartes de chaleur, etc.</li>
              <li>Gestion avancée des couches avec styles personnalisables</li>
              <li>Analyses spatiales (buffer, intersection, etc.)</li>
              <li>Exportation des données et des cartes</li>
            </ul>
            <p>
              Pour commencer, importez des données via le bouton d'importation en bas de l'écran ou utilisez les données d'exemple.
            </p>
          </div>
        );
        
      case 'data':
        return (
          <div>
            <h3 className="text-lg font-medium mb-3">Gestion des données</h3>
            <h4 className="font-medium mb-2">Formats supportés :</h4>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li><strong>GeoJSON</strong> : Format standard pour les données géospatiales</li>
              <li><strong>CSV</strong> : Avec colonnes de latitude/longitude</li>
            </ul>
            
            <h4 className="font-medium mb-2">Importation :</h4>
            <p className="mb-3">
              Cliquez sur le bouton <span className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Importer</span> en bas de l'écran
              ou utilisez l'onglet Données dans la barre latérale.
            </p>
            
            <h4 className="font-medium mb-2">Colonnes CSV requises :</h4>
            <p className="mb-3">
              Pour les fichiers CSV, assurez-vous d'avoir des colonnes nommées <code>latitude</code>/<code>longitude</code>, 
              ou <code>lat</code>/<code>lng</code>, ou <code>y</code>/<code>x</code>.
            </p>
            
            <h4 className="font-medium mb-2">Exportation :</h4>
            <p>
              Utilisez le bouton <span className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Exporter</span> en bas de l'écran
              pour télécharger vos données au format GeoJSON ou CSV.
            </p>
          </div>
        );
        
      case 'layers':
        return (
          <div>
            <h3 className="text-lg font-medium mb-3">Gestion des couches</h3>
            <h4 className="font-medium mb-2">Interface de couches :</h4>
            <p className="mb-3">
              L'onglet <strong>Couches</strong> dans la barre latérale vous permet de :
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Activer/désactiver la visibilité des couches</li>
              <li>Réorganiser les couches par glisser-déposer</li>
              <li>Modifier le style des couches</li>
              <li>Dupliquer, supprimer ou verrouiller des couches</li>
              <li>Créer des groupes de couches</li>
            </ul>
            
            <h4 className="font-medium mb-2">Styles de visualisation :</h4>
            <p className="mb-2">
              Selon le type de données, différentes visualisations sont disponibles :
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li><strong>Points</strong> : Points, clusters, cartes de chaleur</li>
              <li><strong>Polygones</strong> : Choroplèthes, extrusions 3D</li>
              <li><strong>Lignes</strong> : Lignes simples, trajectoires</li>
            </ul>
            
            <h4 className="font-medium mb-2">Propriétés de style :</h4>
            <p>
              Vous pouvez personnaliser les couleurs, tailles, opacités et autres propriétés
              via l'éditeur de style accessible en cliquant sur l'icône 
              <span className="px-1 py-0.5 mx-1 bg-slate-200 dark:bg-slate-700 rounded">⚙️</span>
              à côté d'une couche.
            </p>
          </div>
        );
        
      case 'analysis':
        return (
          <div>
            <h3 className="text-lg font-medium mb-3">Analyse spatiale</h3>
            <p className="mb-3">
              MapCraft propose plusieurs outils d'analyse spatiale pour 
              transformer et interroger vos données géographiques.
            </p>
            
            <h4 className="font-medium mb-2">Analyses disponibles :</h4>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>
                <strong>Buffer</strong> : Créer des zones tampons autour des entités
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Utile pour déterminer les zones d'influence ou de service
                </span>
              </li>
              <li>
                <strong>Centroïde</strong> : Calculer le centre géométrique des entités
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Simplifie des polygones complexes en points
                </span>
              </li>
              <li>
                <strong>Intersection</strong> : Trouver les zones communes entre deux couches
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ex: zones urbaines situées dans une zone à risque
                </span>
              </li>
              <li>
                <strong>Union</strong> : Combiner deux couches
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fusionner plusieurs entités en une seule
                </span>
              </li>
              <li>
                <strong>Différence</strong> : Soustraire une couche d'une autre
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ex: surface forestière hors zones protégées
                </span>
              </li>
              <li>
                <strong>Voronoï</strong> : Créer un pavage de l'espace basé sur la proximité
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Utile pour déterminer des zones d'influence
                </span>
              </li>
            </ul>
            
            <p>
              Accédez aux outils d'analyse via l'onglet <strong>Analyse</strong> dans la barre latérale
              ou en cliquant sur <strong>Analyse spatiale</strong> en bas de la liste des couches.
            </p>
          </div>
        );
        
      case 'shortcuts':
        return (
          <div>
            <h3 className="text-lg font-medium mb-3">Raccourcis clavier</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Annuler</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl + Z</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Rétablir</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl + Y</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Sauvegarder</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl + S</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Importer</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl + O</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Exporter</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl + E</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Basculer la barre latérale</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl + B</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Aide</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">F1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Zoom avant</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Zoom arrière</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Réinitialiser la vue</span>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">0</span>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Section non trouvée</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl h-3/4 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium flex items-center">
            <FiHelpCircle className="mr-2" />
            Aide et documentation
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <FiX />
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation latérale */}
          <div className="w-1/4 border-r border-slate-200 dark:border-slate-700">
            <nav className="p-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center mb-1 ${
                    activeSection === section.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  <span>{section.name}</span>
                </button>
              ))}
            </nav>
            
            <div className="p-3 mt-auto">
              <a
                href="https://github.com/yourusername/mapcraft"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center text-blue-600 dark:text-blue-400 hover:underline p-2"
              >
                <span>Documentation complète</span>
                <FiExternalLink className="ml-1" />
              </a>
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextHelp;