/**
 * Formate les données GeoJSON pour s'assurer qu'elles sont compatibles avec deck.gl
 * @param {Object} geojson - Données GeoJSON
 * @returns {Object} - Données GeoJSON formatées
 */
export function formatGeoJson(geojson) {
    if (!geojson || !geojson.features) return null;
    
    // Assurer que chaque feature a une propriété properties
    const features = geojson.features.map(feature => {
      if (!feature.properties) {
        feature.properties = {};
      }
      
      // Assurer que value et name existent
      if (feature.properties.value === undefined) {
        // Essayer de trouver une propriété numérique à utiliser comme value
        const numericProp = Object.entries(feature.properties)
          .find(([_, val]) => typeof val === 'number');
        
        if (numericProp) {
          feature.properties.value = numericProp[1];
        } else {
          feature.properties.value = 1; // Valeur par défaut
        }
      }
      
      if (!feature.properties.name) {
        // Essayer de trouver une propriété de type chaîne à utiliser comme name
        const stringProp = Object.entries(feature.properties)
          .find(([key, val]) => typeof val === 'string' && key !== 'id');
        
        if (stringProp) {
          feature.properties.name = stringProp[1];
        } else {
          feature.properties.name = `Entité ${feature.properties.id || Math.random().toString(36).substr(2, 5)}`;
        }
      }
      
      return feature;
    });
    
    return {
      type: 'FeatureCollection',
      features
    };
  }
  
  /**
   * Convertit un CSV avec coordonnées en GeoJSON
   * @param {string} csv - Contenu CSV
   * @param {Object} options - Options de conversion
   * @returns {Object} - Données GeoJSON
   */
  export function csvToGeoJson(csvText, options = {}) {
    // Séparation des lignes et entêtes
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Détection automatique des colonnes de coordonnées
    const latField = headers.find(h => 
      /^lat(itude)?$/i.test(h)
    ) || options.latField || 'latitude';
    
    const lonField = headers.find(h => 
      /^lon(g|gitude)?$/i.test(h)
    ) || options.lonField || 'longitude';
    
    const valueField = options.valueField || headers.find(h => 
      /^(value|val|nombre|count|montant|amount|total)$/i.test(h)
    );
    
    const nameField = options.nameField || headers.find(h => 
      /^(name|nom|label|titre|title|id)$/i.test(h)
    );
    
    const latIndex = headers.indexOf(latField);
    const lonIndex = headers.indexOf(lonField);
    
    if (latIndex === -1 || lonIndex === -1) {
      throw new Error(`Les champs de latitude (${latField}) ou longitude (${lonField}) n'ont pas été trouvés dans le CSV.`);
    }
    
    // Création des features GeoJSON
    const features = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const properties = {};
      
      headers.forEach((header, i) => {
        let value = values[i];
        if (!isNaN(Number(value))) {
          value = Number(value);
        }
        properties[header] = value;
      });
      
      // Configurer value et name
      if (valueField && properties[valueField] !== undefined) {
        properties.value = Number(properties[valueField]);
      } else {
        // Trouver la première propriété numérique
        const numericProp = Object.entries(properties)
          .find(([key, val]) => typeof val === 'number' && key !== latField && key !== lonField);
        
        if (numericProp) {
          properties.value = numericProp[1];
        } else {
          properties.value = 1; // Valeur par défaut
        }
      }
      
      if (nameField && properties[nameField] !== undefined) {
        properties.name = properties[nameField];
      } else {
        properties.name = `Point ${index + 1}`;
      }
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            Number(values[lonIndex]), 
            Number(values[latIndex])
          ]
        },
        properties
      };
    });
    
    return { 
      type: 'FeatureCollection', 
      features 
    };
  }
  
  /**
   * Génère des données d'exemple pour le développement
   * @param {string} type - Type de données (points, polygons)
   * @param {number} count - Nombre d'entités à générer
   * @returns {Object} - Données GeoJSON
   */
  export function generateSampleData(type = 'points', count = 100) {
    const features = [];
    
    if (type === 'points') {
      for (let i = 0; i < count; i++) {
        // Générer des points aléatoires en France métropolitaine
        const lon = 2 + Math.random() * 6 - 3; // -1 à 8
        const lat = 46 + Math.random() * 6 - 3; // 43 à 49
        const value = Math.floor(Math.random() * 100);
        
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          },
          properties: {
            id: i,
            name: `Point ${i + 1}`,
            value
          }
        });
      }
    } else if (type === 'polygons') {
      // Générer quelques polygones simples
      for (let i = 0; i < Math.min(count, 20); i++) {
        const centerLon = 2 + Math.random() * 6 - 3;
        const centerLat = 46 + Math.random() * 6 - 3;
        const size = 0.2 + Math.random() * 0.3;
        
        // Créer un polygone simple (carré ou hexagone)
        let coordinates;
        
        if (Math.random() > 0.5) {
          // Carré
          coordinates = [
            [
              [centerLon - size, centerLat - size],
              [centerLon + size, centerLat - size],
              [centerLon + size, centerLat + size],
              [centerLon - size, centerLat + size],
              [centerLon - size, centerLat - size]
            ]
          ];
        } else {
          // Hexagone
          const points = [];
          for (let j = 0; j < 6; j++) {
            const angle = (Math.PI / 3) * j;
            points.push([
              centerLon + size * Math.cos(angle),
              centerLat + size * Math.sin(angle)
            ]);
          }
          points.push(points[0]); // Fermer le polygone
          coordinates = [points];
        }
        
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates
          },
          properties: {
            id: i,
            name: `Zone ${i + 1}`,
            value: Math.floor(Math.random() * 100)
          }
        });
      }
    }
    
    return {
      type: 'FeatureCollection',
      features
    };
  }