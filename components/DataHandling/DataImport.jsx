import React, { useCallback, useState } from 'react';
import { formatGeoJson, csvToGeoJson, generateSampleData } from '../../utils/dataFormatters';
import styles from '../../styles/DataImport.module.css';

export default function DataImport({ onDataImported }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          let data;
          if (fileExtension === 'geojson' || fileExtension === 'json') {
            data = JSON.parse(e.target.result);
            data = formatGeoJson(data);
          } else if (fileExtension === 'csv') {
            data = csvToGeoJson(e.target.result);
          } else {
            throw new Error(`Format de fichier non supporté: ${fileExtension}`);
          }

          onDataImported(data);
          setLoading(false);
        } catch (err) {
          setError(`Erreur lors du traitement du fichier: ${err.message}`);
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Erreur lors de la lecture du fichier');
        setLoading(false);
      };

      if (fileExtension === 'geojson' || fileExtension === 'json' || fileExtension === 'csv') {
        reader.readAsText(file);
      } else {
        setError(`Format de fichier non supporté: ${fileExtension}`);
        setLoading(false);
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
      setLoading(false);
    }
  }, [onDataImported]);

  const loadSampleData = useCallback((type = 'points') => {
    setLoading(true);
    setError(null);

    try {
      const sampleData = generateSampleData(type, type === 'points' ? 100 : 20);
      onDataImported(sampleData);
    } catch (err) {
      setError(`Erreur lors du chargement des données d'exemple: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [onDataImported]);

  return (
    <div className={styles.dataImport}>
      <h2>Importer des données</h2>
      
      <div className={styles.uploadSection}>
        <label className={styles.fileInput}>
          <span>Choisir un fichier</span>
          <input 
            type="file"
            accept=".geojson,.json,.csv" 
            onChange={handleFileUpload}
            disabled={loading}
          />
        </label>
        <p className={styles.supportedFormats}>
          Formats supportés: GeoJSON, CSV avec coordonnées
        </p>
      </div>
      
      <div className={styles.sampleSection}>
        <h3>Données d'exemple</h3>
        <div className={styles.sampleButtons}>
          <button 
            onClick={() => loadSampleData('points')}
            disabled={loading}
            className={styles.button}
          >
            Points aléatoires
          </button>
          <button 
            onClick={() => loadSampleData('polygons')}
            disabled={loading}
            className={styles.button}
          >
            Polygones aléatoires
          </button>
        </div>
      </div>
      
      {loading && <p className={styles.loading}>Chargement en cours...</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}