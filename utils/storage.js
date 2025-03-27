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

// Function to check if IndexedDB is available
const isIndexedDBAvailable = () => {
  return typeof window !== 'undefined' && 
         window.indexedDB !== undefined && 
         window.indexedDB !== null;
};

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Initialize database structure
const initializeDB = (db) => {
  // Create object stores if they don't exist
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

/**
 * Sauvegarde un projet dans IndexedDB
 * @param {Object} project - Objet contenant les données du projet
 * @returns {Promise<string>} - ID du projet sauvegardé
 */
export const saveProject = (project) => {
  return new Promise((resolve, reject) => {
    // Generate ID if not provided
    const projectToSave = { 
      ...project,
      id: project.id || `project_${Date.now()}`,
      lastModified: new Date().toISOString()
    };

    // Try IndexedDB first
    if (isIndexedDBAvailable()) {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (e) => {
          initializeDB(e.target.result);
        };
        
        request.onerror = (event) => {
          // Fall back to localStorage if indexedDB fails
          if (isLocalStorageAvailable()) {
            try {
              localStorage.setItem(`project_${projectToSave.id}`, JSON.stringify(projectToSave));
              resolve(projectToSave.id);
            } catch (err) {
              reject(new Error(`Fallback storage error: ${err.message}`));
            }
          } else {
            reject(new Error(`Database error: ${event.target.error}`));
          }
        };
        
        request.onsuccess = (e) => {
          const db = e.target.result;
          
          try {
            const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
            const store = transaction.objectStore(PROJECTS_STORE);
            
            const saveRequest = store.put(projectToSave);
            
            saveRequest.onsuccess = () => {
              resolve(projectToSave.id);
            };
            
            saveRequest.onerror = (event) => {
              db.close();
              reject(new Error(`Save error: ${event.target.error}`));
            };
            
            transaction.oncomplete = () => {
              db.close();
            };
            
            transaction.onerror = (event) => {
              db.close();
              reject(new Error(`Transaction error: ${event.target.error}`));
            };
          } catch (err) {
            db.close();
            reject(new Error(`Transaction setup error: ${err.message}`));
          }
        };
      } catch (err) {
        // Fall back to localStorage if indexedDB fails
        if (isLocalStorageAvailable()) {
          try {
            localStorage.setItem(`project_${projectToSave.id}`, JSON.stringify(projectToSave));
            resolve(projectToSave.id);
          } catch (localErr) {
            reject(new Error(`Fallback storage error: ${localErr.message}`));
          }
        } else {
          reject(new Error(`IndexedDB error: ${err.message}`));
        }
      }
    } 
    // Fall back to localStorage if indexedDB is not available
    else if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(`project_${projectToSave.id}`, JSON.stringify(projectToSave));
        resolve(projectToSave.id);
      } catch (err) {
        reject(new Error(`Fallback storage error: ${err.message}`));
      }
    } 
    // No storage available
    else {
      reject(new Error('No storage mechanism available'));
    }
  });
};

/**
 * Charge un projet depuis IndexedDB
 * @param {string} projectId - ID du projet à charger
 * @returns {Promise<Object>} - Données du projet
 */
export const loadProject = (projectId) => {
  return new Promise((resolve, reject) => {
    // Try localStorage first if IndexedDB is not available
    if (!isIndexedDBAvailable()) {
      if (isLocalStorageAvailable()) {
        try {
          const projectJson = localStorage.getItem(`project_${projectId}`);
          if (projectJson) {
            resolve(JSON.parse(projectJson));
          } else {
            reject(new Error(`Projet introuvable: ${projectId}`));
          }
        } catch (err) {
          reject(new Error(`Erreur localStorage: ${err.message}`));
        }
      } else {
        reject(new Error('No storage mechanism available'));
      }
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (e) => {
        initializeDB(e.target.result);
      };
      
      request.onerror = (event) => {
        // Fall back to localStorage
        if (isLocalStorageAvailable()) {
          try {
            const projectJson = localStorage.getItem(`project_${projectId}`);
            if (projectJson) {
              resolve(JSON.parse(projectJson));
            } else {
              reject(new Error(`Projet introuvable: ${projectId}`));
            }
          } catch (err) {
            reject(new Error(`Erreur localStorage: ${err.message}`));
          }
        } else {
          reject(new Error(`Erreur d'ouverture de la base de données: ${event.target.error}`));
        }
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
              // Try localStorage as a fallback
              if (isLocalStorageAvailable()) {
                try {
                  const projectJson = localStorage.getItem(`project_${projectId}`);
                  if (projectJson) {
                    resolve(JSON.parse(projectJson));
                    return;
                  }
                } catch (error) {
                  console.warn('Error reading from localStorage:', error);
                }
              }
              reject(new Error(`Projet introuvable: ${projectId}`));
            }
          };
          
          getRequest.onerror = (event) => {
            db.close();
            reject(new Error(`Erreur lors du chargement du projet: ${event.target.error}`));
          };
          
          transaction.oncomplete = () => {
            db.close();
          };
          
          transaction.onerror = (event) => {
            db.close();
            reject(new Error(`Erreur de transaction: ${event.target.error}`));
          };
        } catch (err) {
          db.close();
          reject(new Error(`Erreur de configuration de transaction: ${err.message}`));
        }
      };
    } catch (error) {
      // Fall back to localStorage
      if (isLocalStorageAvailable()) {
        try {
          const projectJson = localStorage.getItem(`project_${projectId}`);
          if (projectJson) {
            resolve(JSON.parse(projectJson));
          } else {
            reject(new Error(`Projet introuvable: ${projectId}`));
          }
        } catch (err) {
          reject(new Error(`Erreur localStorage: ${err.message}`));
        }
      } else {
        reject(new Error(`Erreur IndexedDB: ${error.message}`));
      }
    }
  });
};

/**
 * Liste tous les projets enregistrés
 * @returns {Promise<Array>} - Liste des projets
 */
export const listProjects = () => {
  return new Promise((resolve, reject) => {
    // Use localStorage if IndexedDB is not available
    if (!isIndexedDBAvailable()) {
      if (isLocalStorageAvailable()) {
        try {
          const projects = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('project_')) {
              try {
                const project = JSON.parse(localStorage.getItem(key));
                projects.push(project);
              } catch (parseError) {
                console.warn(`Error parsing project ${key}:`, parseError);
              }
            }
          }
          // Sort by lastModified date (newest first)
          projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
          resolve(projects);
        } catch (err) {
          reject(new Error(`LocalStorage error: ${err.message}`));
        }
      } else {
        reject(new Error('No storage mechanism available'));
      }
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (e) => {
        initializeDB(e.target.result);
      };
      
      request.onerror = (event) => {
        // Fall back to localStorage
        if (isLocalStorageAvailable()) {
          try {
            const projects = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key.startsWith('project_')) {
                try {
                  const project = JSON.parse(localStorage.getItem(key));
                  projects.push(project);
                } catch (parseError) {
                  console.warn(`Error parsing project ${key}:`, parseError);
                }
              }
            }
            // Sort by lastModified date (newest first)
            projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
            resolve(projects);
          } catch (err) {
            reject(new Error(`LocalStorage error: ${err.message}`));
          }
        } else {
          reject(new Error(`Database error: ${event.target.error}`));
        }
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
          
          transaction.onerror = (event) => {
            db.close();
            reject(new Error(`Transaction error: ${event.target.error}`));
          };
        } catch (err) {
          db.close();
          reject(new Error(`Transaction setup error: ${err.message}`));
        }
      };
    } catch (error) {
      // Fall back to localStorage
      if (isLocalStorageAvailable()) {
        try {
          const projects = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('project_')) {
              try {
                const project = JSON.parse(localStorage.getItem(key));
                projects.push(project);
              } catch (parseError) {
                console.warn(`Error parsing project ${key}:`, parseError);
              }
            }
          }
          // Sort by lastModified date (newest first)
          projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
          resolve(projects);
        } catch (err) {
          reject(new Error(`LocalStorage error: ${err.message}`));
        }
      } else {
        reject(new Error(`IndexedDB error: ${error.message}`));
      }
    }
  });
};

/**
 * Sauvegarder un jeu de données
 * @param {Object} dataset - Jeu de données à sauvegarder
 * @returns {Promise<string>} - ID du jeu de données
 */
export const saveDataset = (dataset) => {
  return new Promise((resolve, reject) => {
    // Prepare dataset with ID and date
    const datasetToSave = { 
      ...dataset,
      id: dataset.id || `dataset_${Date.now()}`,
      importDate: dataset.importDate || new Date().toISOString()
    };

    // Handle different storage methods
    if (!isIndexedDBAvailable()) {
      // Fallback to localStorage
      if (isLocalStorageAvailable()) {
        try {
          localStorage.setItem(`dataset_${datasetToSave.id}`, JSON.stringify(datasetToSave));
          resolve(datasetToSave.id);
        } catch (err) {
          reject(new Error(`Fallback storage error: ${err.message}`));
        }
      } else {
        reject(new Error('No storage mechanism available'));
      }
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (e) => {
        initializeDB(e.target.result);
      };
      
      request.onerror = (event) => {
        // Fall back to localStorage
        if (isLocalStorageAvailable()) {
          try {
            localStorage.setItem(`dataset_${datasetToSave.id}`, JSON.stringify(datasetToSave));
            resolve(datasetToSave.id);
          } catch (err) {
            reject(new Error(`Fallback storage error: ${err.message}`));
          }
        } else {
          reject(new Error(`Database error: ${event.target.error}`));
        }
      };
      
      request.onsuccess = (e) => {
        const db = e.target.result;
        
        try {
          const transaction = db.transaction([DATASETS_STORE], 'readwrite');
          const store = transaction.objectStore(DATASETS_STORE);
          
          const saveRequest = store.put(datasetToSave);
          
          saveRequest.onsuccess = () => {
            resolve(datasetToSave.id);
          };
          
          saveRequest.onerror = (event) => {
            db.close();
            
            // Fall back to localStorage
            if (isLocalStorageAvailable()) {
              try {
                localStorage.setItem(`dataset_${datasetToSave.id}`, JSON.stringify(datasetToSave));
                resolve(datasetToSave.id);
              } catch (err) {
                reject(new Error(`Fallback storage error: ${err.message}`));
              }
            } else {
              reject(new Error(`Save error: ${event.target.error}`));
            }
          };
          
          transaction.oncomplete = () => {
            db.close();
          };
          
          transaction.onerror = (event) => {
            db.close();
            reject(new Error(`Transaction error: ${event.target.error}`));
          };
        } catch (err) {
          db.close();
          reject(new Error(`Transaction setup error: ${err.message}`));
        }
      };
    } catch (error) {
      // Fall back to localStorage
      if (isLocalStorageAvailable()) {
        try {
          localStorage.setItem(`dataset_${datasetToSave.id}`, JSON.stringify(datasetToSave));
          resolve(datasetToSave.id);
        } catch (err) {
          reject(new Error(`Fallback storage error: ${err.message}`));
        }
      } else {
        reject(new Error(`IndexedDB error: ${error.message}`));
      }
    }
  });
};

/**
 * Charger un jeu de données
 * @param {string} datasetId - ID du jeu de données
 * @returns {Promise<Object>} - Jeu de données
 */
export const loadDataset = (datasetId) => {
  return new Promise((resolve, reject) => {
    // Try localStorage if IndexedDB is not available
    if (!isIndexedDBAvailable()) {
      if (isLocalStorageAvailable()) {
        try {
          const datasetJson = localStorage.getItem(`dataset_${datasetId}`);
          if (datasetJson) {
            resolve(JSON.parse(datasetJson));
          } else {
            reject(new Error(`Jeu de données introuvable: ${datasetId}`));
          }
        } catch (err) {
          reject(new Error(`Erreur localStorage: ${err.message}`));
        }
      } else {
        reject(new Error('No storage mechanism available'));
      }
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (e) => {
        initializeDB(e.target.result);
      };
      
      request.onerror = (event) => {
        // Fall back to localStorage
        if (isLocalStorageAvailable()) {
          try {
            const datasetJson = localStorage.getItem(`dataset_${datasetId}`);
            if (datasetJson) {
              resolve(JSON.parse(datasetJson));
            } else {
              reject(new Error(`Jeu de données introuvable: ${datasetId}`));
            }
          } catch (err) {
            reject(new Error(`Erreur localStorage: ${err.message}`));
          }
        } else {
          reject(new Error(`Erreur d'ouverture de la base de données: ${event.target.error}`));
        }
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
              // Try localStorage as a fallback
              if (isLocalStorageAvailable()) {
                try {
                  const datasetJson = localStorage.getItem(`dataset_${datasetId}`);
                  if (datasetJson) {
                    resolve(JSON.parse(datasetJson));
                    return;
                  }
                } catch (error) {
                  console.warn('Error reading from localStorage:', error);
                }
              }
              reject(new Error(`Jeu de données introuvable: ${datasetId}`));
            }
          };
          
          getRequest.onerror = (event) => {
            db.close();
            reject(new Error(`Erreur lors du chargement du jeu de données: ${event.target.error}`));
          };
          
          transaction.oncomplete = () => {
            db.close();
          };
          
          transaction.onerror = (event) => {
            db.close();
            reject(new Error(`Erreur de transaction: ${event.target.error}`));
          };
        } catch (err) {
          db.close();
          reject(new Error(`Erreur de configuration de transaction: ${err.message}`));
        }
      };
    } catch (error) {
      // Fall back to localStorage
      if (isLocalStorageAvailable()) {
        try {
          const datasetJson = localStorage.getItem(`dataset_${datasetId}`);
          if (datasetJson) {
            resolve(JSON.parse(datasetJson));
          } else {
            reject(new Error(`Jeu de données introuvable: ${datasetId}`));
          }
        } catch (err) {
          reject(new Error(`Erreur localStorage: ${err.message}`));
        }
      } else {
        reject(new Error(`Erreur IndexedDB: ${error.message}`));
      }
    }
  });
};

/**
 * Liste tous les jeux de données
 * @returns {Promise<Array>} - Liste des jeux de données
 */
export const listDatasets = () => {
  return new Promise((resolve, reject) => {
    // Use localStorage if IndexedDB is not available
    if (!isIndexedDBAvailable()) {
      if (isLocalStorageAvailable()) {
        try {
          const datasets = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('dataset_')) {
              try {
                const dataset = JSON.parse(localStorage.getItem(key));
                datasets.push(dataset);
              } catch (parseError) {
                console.warn(`Error parsing dataset ${key}:`, parseError);
              }
            }
          }
          // Sort by importDate date (newest first)
          datasets.sort((a, b) => new Date(b.importDate) - new Date(a.importDate));
          resolve(datasets);
        } catch (err) {
          reject(new Error(`LocalStorage error: ${err.message}`));
        }
      } else {
        reject(new Error('No storage mechanism available'));
      }
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (e) => {
        initializeDB(e.target.result);
      };
      
      request.onerror = (event) => {
        // Fall back to localStorage
        if (isLocalStorageAvailable()) {
          try {
            const datasets = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key.startsWith('dataset_')) {
                try {
                  const dataset = JSON.parse(localStorage.getItem(key));
                  datasets.push(dataset);
                } catch (parseError) {
                  console.warn(`Error parsing dataset ${key}:`, parseError);
                }
              }
            }
            // Sort by importDate date (newest first)
            datasets.sort((a, b) => new Date(b.importDate) - new Date(a.importDate));
            resolve(datasets);
          } catch (err) {
            reject(new Error(`LocalStorage error: ${err.message}`));
          }
        } else {
          reject(new Error(`Database error: ${event.target.error}`));
        }
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
          
          transaction.onerror = (event) => {
            db.close();
            reject(new Error(`Transaction error: ${event.target.error}`));
          };
        } catch (err) {
          db.close();
          reject(new Error(`Transaction setup error: ${err.message}`));
        }
      };
    } catch (error) {
      // Fall back to localStorage
      if (isLocalStorageAvailable()) {
        try {
          const datasets = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('dataset_')) {
              try {
                const dataset = JSON.parse(localStorage.getItem(key));
                datasets.push(dataset);
              } catch (parseError) {
                console.warn(`Error parsing dataset ${key}:`, parseError);
              }
            }
          }
          // Sort by importDate date (newest first)
          datasets.sort((a, b) => new Date(b.importDate) - new Date(a.importDate));
          resolve(datasets);
        } catch (err) {
          reject(new Error(`LocalStorage error: ${err.message}`));
        }
      } else {
        reject(new Error(`IndexedDB error: ${error.message}`));
      }
    }
  });
};