import React, { useState, useEffect } from 'react';
import {
  schemeBlues,
  schemeReds,
  schemeGreens,
  schemePurples,
  schemeOranges,
  schemeYlGnBu,
  schemeYlOrRd,
  schemePiYG,
  schemeBrBG,
  schemeRdBu,
  schemeSet1,
  schemeSet2,
  schemeTableau10,
  schemeCategory10,
  interpolateViridis,
  interpolateInferno,
  interpolatePlasma
} from 'd3-scale-chromatic';
import { FiRotateCcw, FiEye, FiCheck } from 'react-icons/fi';

// Crée un tableau de couleurs à partir d'une fonction d'interpolation
const createColorRangeFromInterpolator = (interpolator, steps = 9) => {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const color = interpolator(t);
    
    // Convertir la couleur CSS rgba en tableau RGB
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    
    // Convertir la couleur CSS hex en tableau RGB
    const hexMatch = color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    if (hexMatch) {
      return [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16)
      ];
    }
    
    return [0, 0, 0]; // Fallback
  });
};

const ColorPicker = ({ onChange, initialValue = null, showPreview = true }) => {
  const [activeTab, setActiveTab] = useState('sequential');
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [customColor, setCustomColor] = useState('#3388ff');
  const [isPaletteReversed, setIsPaletteReversed] = useState(false);
  
  // Initialiser les valeurs si fournies
  useEffect(() => {
    if (initialValue) {
      if (Array.isArray(initialValue) && initialValue.length >= 3) {
        // RGB array
        setSelectedColor(initialValue);
        setCustomColor(rgbToHex(initialValue[0], initialValue[1], initialValue[2]));
      } else if (typeof initialValue === 'string' && initialValue.startsWith('#')) {
        // Hex color
        setCustomColor(initialValue);
        setSelectedColor(hexToRgb(initialValue));
      } else if (initialValue.colorRange && Array.isArray(initialValue.colorRange)) {
        // Color range
        setSelectedPalette({
          name: 'Custom',
          colors: initialValue.colorRange
        });
        setIsPaletteReversed(initialValue.reverseColorScale || false);
      }
    }
  }, [initialValue]);
  
  // Palettes de couleurs organisées par type
  const palettes = {
    sequential: [
      { name: 'Blues', colors: schemeBlues[9] },
      { name: 'Reds', colors: schemeReds[9] },
      { name: 'Greens', colors: schemeGreens[9] },
      { name: 'Purples', colors: schemePurples[9] },
      { name: 'Oranges', colors: schemeOranges[9] },
      { name: 'YlGnBu', colors: schemeYlGnBu[9] },
      { name: 'YlOrRd', colors: schemeYlOrRd[9] },
      { name: 'Viridis', colors: createColorRangeFromInterpolator(interpolateViridis) },
      { name: 'Inferno', colors: createColorRangeFromInterpolator(interpolateInferno) },
      { name: 'Plasma', colors: createColorRangeFromInterpolator(interpolatePlasma) }
    ],
    diverging: [
      { name: 'RdBu', colors: schemeRdBu[11] },
      { name: 'PiYG', colors: schemePiYG[11] },
      { name: 'BrBG', colors: schemeBrBG[11] },
      { name: 'RdYlGn', colors: [
        [165, 0, 38], [215, 48, 39], [244, 109, 67], [253, 174, 97], 
        [254, 224, 144], [255, 255, 191], [217, 239, 139], 
        [166, 217, 106], [102, 189, 99], [26, 152, 80], [0, 104, 55]
      ]},
      { name: 'Spectral', colors: [
        [158, 1, 66], [213, 62, 79], [244, 109, 67], [253, 174, 97], 
        [254, 224, 139], [255, 255, 191], [230, 245, 152], 
        [171, 221, 164], [102, 194, 165], [50, 136, 189], [94, 79, 162]
      ]}
    ],
    categorical: [
      { name: 'Category10', colors: schemeCategory10 },
      { name: 'Tableau10', colors: schemeTableau10 },
      { name: 'Set1', colors: schemeSet1 },
      { name: 'Set2', colors: schemeSet2 },
      { name: 'Pastel', colors: [
        [141, 211, 199], [255, 255, 179], [190, 186, 218], [251, 128, 114], 
        [128, 177, 211], [253, 180, 98], [179, 222, 105], [252, 205, 229], 
        [217, 217, 217], [188, 128, 189]
      ]}
    ],
    monochrome: [
      { name: 'Gris', colors: [
        [247, 247, 247], [217, 217, 217], [189, 189, 189], 
        [150, 150, 150], [115, 115, 115], [82, 82, 82], 
        [37, 37, 37]
      ]},
      { name: 'Bleu monochromatique', colors: [
        [239, 243, 255], [198, 219, 239], [158, 202, 225], 
        [107, 174, 214], [66, 146, 198], [33, 113, 181], 
        [8, 81, 156], [8, 48, 107]
      ]},
      { name: 'Vert monochromatique', colors: [
        [237, 248, 233], [199, 233, 192], [161, 217, 155], 
        [116, 196, 118], [65, 171, 93], [35, 139, 69], 
        [0, 109, 44], [0, 68, 27]
      ]}
    ]
  };
  
  // Couleurs simples pour sélection rapide
  const quickColors = [
    { name: 'Bleu', hex: '#2196F3', rgb: [33, 150, 243] },
    { name: 'Rouge', hex: '#F44336', rgb: [244, 67, 54] },
    { name: 'Vert', hex: '#4CAF50', rgb: [76, 175, 80] },
    { name: 'Jaune', hex: '#FFEB3B', rgb: [255, 235, 59] },
    { name: 'Orange', hex: '#FF9800', rgb: [255, 152, 0] },
    { name: 'Violet', hex: '#9C27B0', rgb: [156, 39, 176] },
    { name: 'Noir', hex: '#000000', rgb: [0, 0, 0] },
    { name: 'Blanc', hex: '#FFFFFF', rgb: [255, 255, 255] }
  ];
  
  // Conversion de RGB à Hex
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };
  
  // Conversion de Hex à RGB
  const hexToRgb = (hex) => {
    // Expansion du format raccourci (par exemple, "#03F") en format complet (par exemple, "#0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });
  
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };
  
  // Sélectionner une palette entière
  const selectPalette = (palette) => {
    setSelectedPalette(palette);
    setSelectedColor(null);
    
    if (onChange) {
      const colors = isPaletteReversed ? [...palette.colors].reverse() : palette.colors;
      
      onChange({
        colorRange: colors,
        colorScale: activeTab,
        reverseColorScale: isPaletteReversed
      });
    }
  };
  
  // Sélectionner une couleur unique
  const selectColor = (color) => {
    setSelectedColor(color);
    setSelectedPalette(null);
    
    if (onChange) {
      onChange(color);
    }
  };
  
  // Gérer le changement de couleur personnalisée
  const handleCustomColorChange = (e) => {
    const hex = e.target.value;
    setCustomColor(hex);
    const rgb = hexToRgb(hex);
    setSelectedColor(rgb);
    
    if (onChange) {
      onChange(rgb);
    }
  };
  
  // Inverser la palette sélectionnée
  const reversePalette = () => {
    if (selectedPalette) {
      const newReversed = !isPaletteReversed;
      setIsPaletteReversed(newReversed);
      
      if (onChange) {
        const colors = newReversed ? [...selectedPalette.colors].reverse() : selectedPalette.colors;
        
        onChange({
          colorRange: colors,
          colorScale: activeTab,
          reverseColorScale: newReversed
        });
      }
    }
  };
  
  // Convertir un tableau RGB en chaîne CSS
  const rgbToString = (rgb, opacity = 1) => {
    if (!rgb || !Array.isArray(rgb)) return 'rgba(0, 0, 0, 1)';
    
    const r = rgb[0] || 0;
    const g = rgb[1] || 0;
    const b = rgb[2] || 0;
    const a = rgb[3] !== undefined ? rgb[3] / 255 : opacity;
    
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  
  return (
    <div>
      <div className="mb-2 grid grid-cols-8 gap-1">
        {quickColors.map(color => (
          <button 
            key={color.name}
            title={color.name}
            className={`w-full aspect-square rounded-full border transition-colors ${
              selectedColor && 
              selectedColor[0] === color.rgb[0] && 
              selectedColor[1] === color.rgb[1] && 
              selectedColor[2] === color.rgb[2]
                ? 'ring-2 ring-slate-700 dark:ring-slate-300 border-transparent'
                : 'border-slate-300 dark:border-slate-600'
            }`}
            style={{ backgroundColor: color.hex }}
            onClick={() => selectColor(color.rgb)}
            aria-label={`Couleur ${color.name}`}
          />
        ))}
      </div>
      
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-2">
        <button
          className={`py-1 px-2 text-xs border-b-2 ${
            activeTab === 'sequential'
              ? 'border-slate-900 dark:border-white font-medium'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('sequential')}
        >
          Séquentiel
        </button>
        <button
          className={`py-1 px-2 text-xs border-b-2 ${
            activeTab === 'diverging'
              ? 'border-slate-900 dark:border-white font-medium'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('diverging')}
        >
          Divergent
        </button>
        <button
          className={`py-1 px-2 text-xs border-b-2 ${
            activeTab === 'categorical'
              ? 'border-slate-900 dark:border-white font-medium'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('categorical')}
        >
          Catégories
        </button>
        <button
          className={`py-1 px-2 text-xs border-b-2 ${
            activeTab === 'monochrome'
              ? 'border-slate-900 dark:border-white font-medium'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('monochrome')}
        >
          Mono
        </button>
      </div>
      
      {/* Sélection de palette */}
      <div className="max-h-40 overflow-y-auto space-y-2 pr-1 mb-3">
        {palettes[activeTab].map((palette) => (
          <button
            key={palette.name}
            className={`w-full flex items-center p-1 rounded transition-colors ${
              selectedPalette?.name === palette.name
                ? 'ring-2 ring-slate-500 dark:ring-slate-300'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            onClick={() => selectPalette(palette)}
          >
            <div className="flex-grow h-6 rounded overflow-hidden flex">
              {palette.colors.map((color, index) => (
                <div
                  key={index}
                  className="flex-grow h-full"
                  style={{ 
                    backgroundColor: typeof color === 'string' ? color : rgbToString(color)
                  }}
                />
              ))}
            </div>
            <span className="text-xs ml-2 text-slate-600 dark:text-slate-300 truncate">
              {palette.name}
            </span>
          </button>
        ))}
      </div>
      
      {/* Couleur personnalisée */}
      <div className="mb-3">
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
          Couleur personnalisée
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-10 h-10 p-0 border-0 bg-transparent"
          />
          <input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            className="flex-grow p-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm"
            placeholder="#RRGGBB"
          />
        </div>
      </div>
      
      {/* Contrôles de palette */}
      {selectedPalette && (
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={reversePalette}
            className="py-1 px-2 flex items-center gap-1 text-xs border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <FiRotateCcw size={12} />
            <span>Inverser</span>
            {isPaletteReversed && <FiCheck size={12} className="ml-1 text-green-500" />}
          </button>
          
          {showPreview && (
            <button className="py-1 px-2 flex items-center gap-1 text-xs border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
              <FiEye size={12} />
              <span>Aperçu</span>
            </button>
          )}
        </div>
      )}
      
      {/* Aperçu de la couleur ou palette sélectionnée */}
      {(selectedColor || selectedPalette) && showPreview && (
        <div className="mb-2 p-2 border border-slate-200 dark:border-slate-700 rounded">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Aperçu:
          </div>
          
          {selectedColor ? (
            <div 
              className="h-8 rounded"
              style={{ backgroundColor: rgbToString(selectedColor) }}
            ></div>
          ) : selectedPalette && (
            <div className="h-8 rounded overflow-hidden flex">
              {(isPaletteReversed ? [...selectedPalette.colors].reverse() : selectedPalette.colors).map((color, index) => (
                <div
                  key={index}
                  className="flex-grow h-full"
                  style={{ 
                    backgroundColor: typeof color === 'string' ? color : rgbToString(color)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;