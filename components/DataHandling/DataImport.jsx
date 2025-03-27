const handleFileUpload = useCallback(async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setLoading(true);
  setError(null);

  try {
    // Validate file size
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('Le fichier est trop volumineux (limite de 50MB)');
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Validate supported file extensions
    if (!['geojson', 'json', 'csv', 'gpkg', 'zip'].includes(fileExtension)) {
      throw new Error(`Format de fichier non supporté: ${fileExtension}. Formats acceptés: GeoJSON, CSV, GeoPackage, Shapefile (ZIP)`);
    }

    const reader = new FileReader();

    // Set up promise-based file reader
    const readFilePromise = new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Erreur lors de la lecture du fichier'));
    });

    // Start reading the file
    if (fileExtension === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    // Wait for file to be read
    const result = await readFilePromise;

    // Process file based on its type
    let data;
    if (fileExtension === 'geojson' || fileExtension === 'json') {
      try {
        // Handle GeoJSON
        data = JSON.parse(result);
        data = formatGeoJson(data);
        
        // Basic validation
        if (!data.type || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
          throw new Error('Format GeoJSON invalide');
        }
      } catch (parseError) {
        throw new Error(`Erreur de parsing JSON: ${parseError.message}`);
      }
    } else if (fileExtension === 'csv') {
      // Handle CSV with custom options if provided
      try {
        data = csvToGeoJson(result, dataType === 'auto' ? {} : customOptions);
        
        // Check if any features were created
        if (!data.features || data.features.length === 0) {
          throw new Error('Aucune donnée géospatiale n\'a pu être extraite du CSV');
        }
      } catch (csvError) {
        throw new Error(`Erreur lors de la conversion du CSV: ${csvError.message}`);
      }
    } else if (fileExtension === 'gpkg') {
      // Handle GeoPackage
      try {
        data = await processGeoPackage(file);
      } catch (gpkgError) {
        throw new Error(`Erreur lors du traitement du GeoPackage: ${gpkgError.message}`);
      }
    } else if (fileExtension === 'zip') {
      // Handle Shapefile in ZIP
      try {
        data = await processShapefile(result);
      } catch (shpError) {
        throw new Error(`Erreur lors du traitement du Shapefile: ${shpError.message}`);
      }
    }

    // Final validation
    if (!data || !data.features || data.features.length === 0) {
      throw new Error('Aucune donnée valide n\'a été trouvée dans le fichier');
    }

    onDataImported(data);
    if (onClose) onClose();
  } catch (err) {
    console.error('Error processing file:', err);
    setError(`Erreur: ${err.message}`);
  } finally {
    setLoading(false);
  }
}, [onDataImported, onClose, dataType, customOptions]);