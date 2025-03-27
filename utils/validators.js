/**
 * Validateurs pour différents types de données
 */

/**
 * Vérifie si un objet est un GeoJSON valide
 * @param {Object} data - Données à vérifier
 * @returns {Object} Résultat de validation {valid: boolean, errors: Array}
 */
export function validateGeoJSON(data) {
    const errors = [];
  
    if (!data) {
      return { valid: false, errors: ['Données non fournies'] };
    }
  
    // Vérification du type
    if (!data.type) {
      errors.push('Type GeoJSON manquant');
    } else if (!['FeatureCollection', 'Feature', 'Point', 'LineString', 'Polygon', 
                'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'].includes(data.type)) {
      errors.push(`Type GeoJSON "${data.type}" non valide`);
    }
  
    // Vérification des features pour FeatureCollection
    if (data.type === 'FeatureCollection') {
      if (!Array.isArray(data.features)) {
        errors.push('Propriété "features" manquante ou non valide dans la FeatureCollection');
      } else if (data.features.length === 0) {
        errors.push('FeatureCollection vide (aucune entité)');
      } else {
        // Vérification de chaque feature
        data.features.forEach((feature, index) => {
          if (!feature.type || feature.type !== 'Feature') {
            errors.push(`L'entité à l'index ${index} n'est pas de type "Feature"`);
          }
          
          if (!feature.geometry) {
            errors.push(`Géométrie manquante pour l'entité à l'index ${index}`);
          } else if (!feature.geometry.type || !feature.geometry.coordinates) {
            errors.push(`Géométrie non valide pour l'entité à l'index ${index}`);
          }
          
          if (!feature.properties) {
            errors.push(`Propriétés manquantes pour l'entité à l'index ${index}`);
          }
        });
      }
    }
  
    // Vérification pour Feature simple
    if (data.type === 'Feature') {
      if (!data.geometry) {
        errors.push('Géométrie manquante dans l\'entité');
      } else if (!data.geometry.type || !data.geometry.coordinates) {
        errors.push('Géométrie non valide dans l\'entité');
      }
      
      if (!data.properties) {
        errors.push('Propriétés manquantes dans l\'entité');
      }
    }
  
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Vérifie si un fichier CSV contient des coordonnées géographiques
   * @param {Array} headers - En-têtes du CSV
   * @param {Array} rows - Lignes de données
   * @returns {Object} Résultat de validation avec colonnes détectées
   */
  export function validateCSVCoordinates(headers, rows) {
    if (!headers || !Array.isArray(headers) || !rows || !Array.isArray(rows)) {
      return { 
        valid: false, 
        errors: ['Données CSV non valides'],
        latColumn: null,
        lonColumn: null
      };
    }
  
    // Recherche de colonnes de coordonnées par nom
    const latCandidates = ['latitude', 'lat', 'y', 'ylat'];
    const lonCandidates = ['longitude', 'lon', 'lng', 'x', 'xlong'];
    
    let latColumn = null;
    let lonColumn = null;
    
    // Cherche des correspondances exactes d'abord
    for (const header of headers) {
      const lowerHeader = header.toLowerCase();
      if (!latColumn && latCandidates.includes(lowerHeader)) {
        latColumn = header;
      }
      if (!lonColumn && lonCandidates.includes(lowerHeader)) {
        lonColumn = header;
      }
    }
    
    // Si pas trouvé, cherche des correspondances partielles
    if (!latColumn || !lonColumn) {
      for (const header of headers) {
        const lowerHeader = header.toLowerCase();
        if (!latColumn && latCandidates.some(candidate => lowerHeader.includes(candidate))) {
          latColumn = header;
        }
        if (!lonColumn && lonCandidates.some(candidate => lowerHeader.includes(candidate))) {
          lonColumn = header;
        }
      }
    }
    
    // Vérifier si les coordonnées ont été trouvées
    if (!latColumn || !lonColumn) {
      return {
        valid: false,
        errors: ['Colonnes de latitude/longitude non détectées'],
        latColumn: null,
        lonColumn: null
      };
    }
    
    // Vérifier si les colonnes contiennent des valeurs numériques valides
    let validRows = 0;
    const errors = [];
    
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const row = rows[i];
      const lat = parseFloat(row[latColumn]);
      const lon = parseFloat(row[lonColumn]);
      
      if (isNaN(lat) || isNaN(lon)) {
        errors.push(`La ligne ${i + 1} contient des coordonnées non valides`);
      } else if (lat < -90 || lat > 90) {
        errors.push(`Latitude hors limites à la ligne ${i + 1}: ${lat}`);
      } else if (lon < -180 || lon > 180) {
        errors.push(`Longitude hors limites à la ligne ${i + 1}: ${lon}`);
      } else {
        validRows++;
      }
    }
    
    return {
      valid: validRows > 0,
      errors,
      latColumn,
      lonColumn
    };
  }
  
  /**
   * Vérifie si une valeur est un nombre valide
   * @param {*} value - Valeur à vérifier
   * @returns {boolean} Vrai si c'est un nombre valide
   */
  export function isValidNumber(value) {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }
  
  /**
   * Vérifie si une couleur est valide (hex, RGB, nom)
   * @param {string} color - Couleur à vérifier
   * @returns {boolean} Vrai si la couleur est valide
   */
  export function isValidColor(color) {
    if (!color || typeof color !== 'string') {
      return false;
    }
    
    // Test pour les couleurs hexadécimales (#fff ou #ffffff)
    if (color.startsWith('#')) {
      return /^#([0-9A-F]{3}){1,2}$/i.test(color);
    }
    
    // Test pour rgb() ou rgba()
    if (color.startsWith('rgb')) {
      const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
      const rgbaRegex = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(0|1|0?\.\d+)\s*\)$/;
      
      if (rgbRegex.test(color)) {
        const matches = color.match(rgbRegex);
        const r = parseInt(matches[1], 10);
        const g = parseInt(matches[2], 10);
        const b = parseInt(matches[3], 10);
        return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
      }
      
      if (rgbaRegex.test(color)) {
        const matches = color.match(rgbaRegex);
        const r = parseInt(matches[1], 10);
        const g = parseInt(matches[2], 10);
        const b = parseInt(matches[3], 10);
        const a = parseFloat(matches[4]);
        return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1;
      }
      
      return false;
    }
    
    // Liste des noms de couleurs HTML standard
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
      'gray', 'grey', 'silver', 'maroon', 'olive', 'navy', 'purple', 'teal',
      'aqua', 'fuchsia', 'lime'
    ];
    
    return namedColors.includes(color.toLowerCase());
  }