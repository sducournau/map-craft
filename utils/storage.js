/**
 * Utilitaires pour la gestion du stockage local avec IndexedDB
 * Ce module fournit des fonctions pour enregistrer et charger des projets
 * cartographiques et des jeux de données
 */

// Noms des bases de données et des magasins
const DB_NAME = 'mapcraft_db';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const DATASETS_STORE = 'datasets';

/**
 * Sauvegarde un projet dans IndexedDB
 * @param {Object} project - Objet contenant les données du projet
 * @returns {Promise<string>} - ID du projet sauvegardé
 */
export const saveProject = (project) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Gérer la création/mise à jour de la structure de la base de données
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Créer les magasins d'objets s'ils n'existent pas déjà
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('lastModified', 'lastModified', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(DATASETS_STORE)) {
        const datasetStore = db.createObjectStore(DATASETS_STORE, { keyPath: 'id' });
        datasetStore.createIndex('name', 'name', { unique: false });
        datasetStore.createIndex('importDate', 'importDate', { unique: false });
      }
    };
    
    request.onerror = (event) => {
      reject(new Error(`Erreur d'ouverture de la base de données: ${event.target.error}`));
    };
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      
      try {
        const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
        const store = transaction.objectStore(PROJECTS_STORE);
        
        // Génère un ID basé sur la date si aucun n'est fourni
        const projectToSave = { 
          ...project,
          id: project.id || `project_${Date.now()}`,
          lastModified: new Date().toISOString()
        };
        
        const saveRequest = store.put(projectToSave);
        
        saveRequest.onsuccess = () => {
          resolve(projectToSave.id);
        };
        
        saveRequest.onerror = (event) => {
          reject(new Error(`Erreur lors de l'enregistrement du projet: ${event.target.error}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      } catch (err) {
        reject(new Error(`Erreur de transaction: ${err.message}`));
      }
    };
  });
};

/**
 * Charge un projet depuis IndexedDB
 * @param {string} projectId - ID du projet à charger
 * @returns {Promise<Object>} - Données du projet
 */
export const loadProject = (projectId) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Gérer la création/mise à jour de la structure de la base de données
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Créer les magasins d'objets s'ils n'existent pas déjà
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('lastModified', 'lastModified', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(DATASETS_STORE)) {
        const datasetStore = db.createObjectStore(DATASETS_STORE, { keyPath: 'id' });
        datasetStore.createIndex('name', 'name', { unique: false });
        datasetStore.createIndex('importDate', 'importDate', { unique: false });
      }
    };
    
    request.onerror = (event) => {
      reject(new Error(`Erreur d'ouverture de la base de données: ${event.target.error}`));
    };
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      
      try {
        const transaction = db.transaction([PROJECTS_STORE], 'readonly');
        const store = transaction.objectStore(PROJECTS_STORE);
        
        const getRequest = store.get(projectId);
        
        getRequest.onsuccess = (event) => {
          const project = event.target.result;
          if (project) {
            resolve(project);
          } else {
            reject(new Error(`Projet introuvable: ${projectId}`));
          }
        };
        
        getRequest.onerror = (event) => {
          reject(new Error(`Erreur lors du chargement du projet: ${event.target.error}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      } catch (err) {
        reject(new Error(`Erreur de transaction: ${err.message}`));
      }
    };
  });
};

/**
 * Liste tous les projets enregistrés
 * @returns {Promise<Array>} - Liste des projets
 */
export const listProjects = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Gérer la création/mise à jour de la structure de la base de données
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Créer les magasins d'objets s'ils n'existent pas déjà
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('lastModified', 'lastModified', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(DATASETS_STORE)) {
        const datasetStore = db.createObjectStore(DATASETS_STORE, { keyPath: 'id' });
        datasetStore.createIndex('name', 'name', { unique: false });
        datasetStore.createIndex('importDate', 'importDate', { unique: false });
      }
    };
    
    request.onerror = (event) => {
      reject(new Error(`Erreur d'ouverture de la base de données: ${event.target.error}`));
    };
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      
      try {
        const transaction = db.transaction([PROJECTS_STORE], 'readonly');
        const store = transaction.objectStore(PROJECTS_STORE);
        const index = store.index('lastModified');
        
        const projects = [];
        
        index.openCursor(null, 'prev').onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            projects.push(cursor.value);
            cursor.continue();
          } else {
            resolve(projects);
          }
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      } catch (err) {
        reject(new Error(`Erreur de transaction: ${err.message}`));
      }
    };
  });
};

/**
 * Supprimer un projet
 * @param {string} projectId - ID du projet à supprimer
 * @returns {Promise<void>}
 */
export const deleteProject = (projectId) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Gérer la création/mise à jour de la structure de la base de données
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Créer les magasins d'objets s'ils n'existent pas déjà
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('lastModified', 'lastModified', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(DATASETS_STORE)) {
        const datasetStore = db.createObjectStore(DATASETS_STORE, { keyPath: 'id' });
        datasetStore.createIndex('name', 'name', { unique: false });
        datasetStore.createIndex('importDate', 'importDate', { unique: false });
      }
    };
    
    request.onerror = (event) => {
      reject(new Error(`Erreur d'ouverture de la base de données: ${event.target.error}`));
    };
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      
      try {
        const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
        const store = transaction.objectStore(PROJECTS_STORE);
        
        const deleteRequest = store.delete(projectId);
        
        deleteRequest.onsuccess = () => {
          resolve();
        };
        
        deleteRequest.onerror = (event) => {
          reject(new Error(`Erreur lors de la suppression du projet: ${event.target.error}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      } catch (err) {
        reject(new Error(`Erreur de transaction: ${err.message}`));
      }
    };
  });
};

/**
 * Sauvegarder un jeu de données
 * @param {Object} dataset - Jeu de données à sauvegarder
 * @returns {Promise<string>} - ID du jeu de données
 */
export const saveDataset = (dataset) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Gérer la création/mise à jour de la structure de la base de données
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Créer les magasins d'objets s'ils n'existent pas déjà
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('lastModified', 'lastModified', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(DATASETS_STORE)) {
        const datasetStore = db.createObjectStore(DATASETS_STORE, { keyPath: 'id' });
        datasetStore.createIndex('name', 'name', { unique: false });
        datasetStore.createIndex('importDate', 'importDate', { unique: false });
      }
    };
    
    request.onerror = (event) => {
      reject(new Error(`Erreur d'ouverture de la base de données: ${event.target.error}`));
    };
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      
      try {
        const transaction = db.transaction([DATASETS_STORE], 'readwrite');
        const store = transaction.objectStore(DATASETS_STORE);
        
        // Ajout de métadonnées
        const datasetToSave = { 
          ...dataset,
          id: dataset.id || `dataset_${Date.now()}`,
          importDate: dataset.importDate || new Date().toISOString()
        };
        
        const saveRequest = store.put(datasetToSave);
        
        saveRequest.onsuccess = () => {
          resolve(datasetToSave.id);
        };
        
        saveRequest.onerror = (event) => {
          reject(new Error(`Erreur lors de l'enregistrement du jeu de données: ${event.target.error}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      } catch (err) {
        reject(new Error(`Erreur de transaction: ${err.message}`));
      }
    };
  });
};

/**
 * Charger un jeu de données
 * @param {string} datasetId - ID du jeu de données
 * @returns {Promise<Object>} - Jeu de données
 */
export const loadDataset = (datasetId) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Gérer la création/mise à jour de la structure de la base de données
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Créer les magasins d'objets s'ils n'existent pas déjà
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('lastModified', 'lastModified', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(DATASETS_STORE)) {
        const datasetStore = db.createObjectStore(DATASETS_STORE, { keyPath: 'id' });
        datasetStore.createIndex('name', 'name', { unique: false });
        datasetStore.createIndex('importDate', 'importDate', { unique: false });
      }
    };
    
    request.onerror = (event) => {
      reject(new Error(`Erreur d'ouverture de la base de données: ${event.target.error}`));
    };
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      
      try {
        const transaction = db.transaction([DATASETS_STORE], 'readonly');
        const store = transaction.objectStore(DATASETS_STORE);
        
        const getRequest = store.get(datasetId);
        
        getRequest.onsuccess = (event) => {
          const dataset = event.target.result;
          if (dataset) {
            resolve(dataset);
          } else {
            reject(new Error(`Jeu de données introuvable: ${datasetId}`));
          }
        };
        
        getRequest.onerror = (event) => {
          reject(new Error(`Erreur lors du chargement du jeu de données: ${event.target.error}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      } catch (err) {
        reject(new Error(`Erreur de transaction: ${err.message}`));
      }
    };
  });
};

/**
 * Liste tous les jeux de données
 * @returns {Promise<Array>} - Liste des jeux de données
 */
export const listDatasets = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Gérer la création/mise à jour de la structure de la base de données
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Créer les magasins d'objets s'ils n'existent pas déjà
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('lastModified', 'lastModified', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(DATASETS_STORE)) {
        const datasetStore = db.createObjectStore(DATASETS_STORE, { keyPath: 'id' });
        datasetStore.createIndex('name', 'name', { unique: false });
        datasetStore.createIndex('importDate', 'importDate', { unique: false });
      }
    };
    
    request.onerror = (event) => {
      reject(new Error(`Erreur d'ouverture de la base de données: ${event.target.error}`));
    };
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      
      try {
        const transaction = db.transaction([DATASETS_STORE], 'readonly');
        const store = transaction.objectStore(DATASETS_STORE);
        const index = store.index('importDate');
        
        const datasets = [];
        
        index.openCursor(null, 'prev').onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            datasets.push(cursor.value);
            cursor.continue();
          } else {
            resolve(datasets);
          }
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      } catch (err) {
        reject(new Error(`Erreur de transaction: ${err.message}`));
      }
    };
  });
};