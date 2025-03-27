"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "./pages/index.js":
/*!************************!*\
  !*** ./pages/index.js ***!
  \************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Home; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/head */ \"./node_modules/next/head.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _barrel_optimize_names_Box_CircularProgress_mui_material__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! __barrel_optimize__?names=Box,CircularProgress!=!@mui/material */ \"__barrel_optimize__?names=Box,CircularProgress!=!./node_modules/@mui/material/esm/index.js\");\n/* harmony import */ var _hooks_useMapState_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../hooks/useMapState.js */ \"./hooks/useMapState.js\");\n/* harmony import */ var _hooks_useDataState_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../hooks/useDataState.js */ \"./hooks/useDataState.js\");\n/* harmony import */ var _utils_dataFormatters_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/dataFormatters.js */ \"./utils/dataFormatters.js\");\n\nvar _s = $RefreshSig$();\n\n\n\n\n\n\n// Lazy load components\nconst DeckGLMap = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.lazy)(()=>__webpack_require__.e(/*! import() */ \"components_Map_DeckGLMap_jsx\").then(__webpack_require__.bind(__webpack_require__, /*! ../components/Map/DeckGLMap */ \"./components/Map/DeckGLMap.jsx\")));\n_c = DeckGLMap;\nconst Sidebar = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.lazy)(()=>__webpack_require__.e(/*! import() */ \"components_UI_Sidebar_jsx\").then(__webpack_require__.bind(__webpack_require__, /*! ../components/UI/Sidebar */ \"./components/UI/Sidebar.jsx\")));\n_c1 = Sidebar;\nconst DataPanel = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.lazy)(()=>__webpack_require__.e(/*! import() */ \"components_UI_DataPanel_jsx\").then(__webpack_require__.bind(__webpack_require__, /*! ../components/UI/DataPanel */ \"./components/UI/DataPanel.jsx\")));\n_c2 = DataPanel;\nconst MapControls = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.lazy)(()=>__webpack_require__.e(/*! import() */ \"components_Map_MapControls_jsx\").then(__webpack_require__.bind(__webpack_require__, /*! ../components/Map/MapControls */ \"./components/Map/MapControls.jsx\")));\n_c3 = MapControls;\n// Loading fallback\nconst Loading = ()=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_CircularProgress_mui_material__WEBPACK_IMPORTED_MODULE_6__.Box, {\n        display: \"flex\",\n        justifyContent: \"center\",\n        alignItems: \"center\",\n        height: \"100vh\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_CircularProgress_mui_material__WEBPACK_IMPORTED_MODULE_6__.CircularProgress, {}, void 0, false, {\n            fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n            lineNumber: 17,\n            columnNumber: 5\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n        lineNumber: 16,\n        columnNumber: 3\n    }, undefined);\n_c4 = Loading;\nfunction Home() {\n    _s();\n    const { viewState, setViewState } = (0,_hooks_useMapState_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"])();\n    const { addData, datasets, visualizationType, setVisualizationType, classificationMethod, setClassificationMethod, colorPalette, setColorPalette, opacity, setOpacity, radius, setRadius, layers } = (0,_hooks_useDataState_js__WEBPACK_IMPORTED_MODULE_4__[\"default\"])();\n    const [sidebarOpen, setSidebarOpen] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    // Charger des données d'exemple au démarrage\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const sampleData = (0,_utils_dataFormatters_js__WEBPACK_IMPORTED_MODULE_5__.generateSampleData)(\"points\", 100);\n        addData(sampleData, \"Sample Points\");\n    }, [\n        addData\n    ]);\n    // Handle imported data\n    const handleDataImported = (newData)=>{\n        addData(newData, \"Imported Data\");\n        // Adapter le type de visualisation selon les données\n        if (newData && newData.features && newData.features.length > 0) {\n            const firstFeature = newData.features[0];\n            const geometryType = firstFeature.geometry.type;\n            if (geometryType === \"Point\") {\n                setVisualizationType(\"points\");\n            } else if (geometryType.includes(\"Polygon\")) {\n                setVisualizationType(\"choropleth\");\n            }\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_CircularProgress_mui_material__WEBPACK_IMPORTED_MODULE_6__.Box, {\n        sx: {\n            display: \"flex\",\n            height: \"100vh\",\n            overflow: \"hidden\"\n        },\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_head__WEBPACK_IMPORTED_MODULE_2___default()), {\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"title\", {\n                        children: \"MapCraft - \\xc9diteur Cartographique\"\n                    }, void 0, false, {\n                        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                        lineNumber: 67,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"description\",\n                        content: \"\\xc9diteur cartographique PWA avec deck.gl\"\n                    }, void 0, false, {\n                        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                        lineNumber: 68,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"icon\",\n                        href: \"/favicon.ico\"\n                    }, void 0, false, {\n                        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                        lineNumber: 69,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"manifest\",\n                        href: \"/manifest.json\"\n                    }, void 0, false, {\n                        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                        lineNumber: 70,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"theme-color\",\n                        content: \"#1a202c\"\n                    }, void 0, false, {\n                        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                        lineNumber: 71,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                lineNumber: 66,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {\n                fallback: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Loading, {}, void 0, false, {\n                    fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                    lineNumber: 74,\n                    columnNumber: 27\n                }, void 0),\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Sidebar, {\n                        open: sidebarOpen,\n                        setOpen: setSidebarOpen,\n                        onDataImported: handleDataImported\n                    }, void 0, false, {\n                        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                        lineNumber: 75,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_CircularProgress_mui_material__WEBPACK_IMPORTED_MODULE_6__.Box, {\n                        sx: {\n                            flexGrow: 1,\n                            position: \"relative\",\n                            overflow: \"hidden\"\n                        },\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(DeckGLMap, {\n                                layers: layers,\n                                viewState: viewState,\n                                onViewStateChange: (evt)=>setViewState(evt.viewState)\n                            }, void 0, false, {\n                                fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                                lineNumber: 82,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(MapControls, {\n                                viewState: viewState,\n                                setViewState: setViewState\n                            }, void 0, false, {\n                                fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                                lineNumber: 88,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(DataPanel, {\n                                visualizationType: visualizationType,\n                                setVisualizationType: setVisualizationType,\n                                classificationMethod: classificationMethod,\n                                setClassificationMethod: setClassificationMethod,\n                                colorPalette: colorPalette,\n                                setColorPalette: setColorPalette,\n                                opacity: opacity,\n                                setOpacity: setOpacity,\n                                radius: radius,\n                                setRadius: setRadius\n                            }, void 0, false, {\n                                fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                                lineNumber: 93,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                        lineNumber: 81,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n                lineNumber: 74,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\pages\\\\index.js\",\n        lineNumber: 65,\n        columnNumber: 5\n    }, this);\n}\n_s(Home, \"bh3f5tSL/Nv2ZLcxltarYrInN8g=\", false, function() {\n    return [\n        _hooks_useMapState_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"],\n        _hooks_useDataState_js__WEBPACK_IMPORTED_MODULE_4__[\"default\"]\n    ];\n});\n_c5 = Home;\nvar _c, _c1, _c2, _c3, _c4, _c5;\n$RefreshReg$(_c, \"DeckGLMap\");\n$RefreshReg$(_c1, \"Sidebar\");\n$RefreshReg$(_c2, \"DataPanel\");\n$RefreshReg$(_c3, \"MapControls\");\n$RefreshReg$(_c4, \"Loading\");\n$RefreshReg$(_c5, \"Home\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTs7Ozs7OzBDQUdoQiw4REFBQ1Q7Z0NBQ0NZLG1CQUFtQkE7Z0NBQ25CQyxzQkFBc0JBO2dDQUN0QkMsc0JBQXNCQTtnQ0FDdEJDLHlCQUF5QkE7Z0NBQ3pCQyxjQUFjQTtnQ0FDZEMsaUJBQWlCQTtnQ0FDakJDLFNBQVNBO2dDQUNUQyxZQUFZQTtnQ0FDWkMsUUFBUUE7Z0NBQ1JDLFdBQVdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNdkI7R0F4RndCZDs7UUFDY1osNkRBQVdBO1FBZTNDQyw4REFBWUE7OztNQWhCTVciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vcGFnZXMvaW5kZXguanM/YmVlNyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgU3VzcGVuc2UsIGxhenkgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBIZWFkIGZyb20gJ25leHQvaGVhZCc7XHJcbmltcG9ydCB7IEJveCwgQ2lyY3VsYXJQcm9ncmVzcyB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwnO1xyXG5pbXBvcnQgdXNlTWFwU3RhdGUgZnJvbSAnLi4vaG9va3MvdXNlTWFwU3RhdGUuanMnO1xyXG5pbXBvcnQgdXNlRGF0YVN0YXRlIGZyb20gJy4uL2hvb2tzL3VzZURhdGFTdGF0ZS5qcyc7XHJcbmltcG9ydCB7IGdlbmVyYXRlU2FtcGxlRGF0YSB9IGZyb20gJy4uL3V0aWxzL2RhdGFGb3JtYXR0ZXJzLmpzJztcclxuXHJcbi8vIExhenkgbG9hZCBjb21wb25lbnRzXHJcbmNvbnN0IERlY2tHTE1hcCA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9jb21wb25lbnRzL01hcC9EZWNrR0xNYXAnKSk7XHJcbmNvbnN0IFNpZGViYXIgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vY29tcG9uZW50cy9VSS9TaWRlYmFyJykpO1xyXG5jb25zdCBEYXRhUGFuZWwgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vY29tcG9uZW50cy9VSS9EYXRhUGFuZWwnKSk7XHJcbmNvbnN0IE1hcENvbnRyb2xzID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL2NvbXBvbmVudHMvTWFwL01hcENvbnRyb2xzJykpO1xyXG5cclxuLy8gTG9hZGluZyBmYWxsYmFja1xyXG5jb25zdCBMb2FkaW5nID0gKCkgPT4gKFxyXG4gIDxCb3ggZGlzcGxheT1cImZsZXhcIiBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBoZWlnaHQ9XCIxMDB2aFwiPlxyXG4gICAgPENpcmN1bGFyUHJvZ3Jlc3MgLz5cclxuICA8L0JveD5cclxuKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEhvbWUoKSB7XHJcbiAgY29uc3QgeyB2aWV3U3RhdGUsIHNldFZpZXdTdGF0ZSB9ID0gdXNlTWFwU3RhdGUoKTtcclxuICBjb25zdCB7IFxyXG4gICAgYWRkRGF0YSwgLy8gVXNlIGFkZERhdGEgaW5zdGVhZCBvZiBzZXREYXRhXHJcbiAgICBkYXRhc2V0cyxcclxuICAgIHZpc3VhbGl6YXRpb25UeXBlLCBcclxuICAgIHNldFZpc3VhbGl6YXRpb25UeXBlLCBcclxuICAgIGNsYXNzaWZpY2F0aW9uTWV0aG9kLCBcclxuICAgIHNldENsYXNzaWZpY2F0aW9uTWV0aG9kLFxyXG4gICAgY29sb3JQYWxldHRlLFxyXG4gICAgc2V0Q29sb3JQYWxldHRlLFxyXG4gICAgb3BhY2l0eSxcclxuICAgIHNldE9wYWNpdHksXHJcbiAgICByYWRpdXMsXHJcbiAgICBzZXRSYWRpdXMsXHJcbiAgICBsYXllcnNcclxuICB9ID0gdXNlRGF0YVN0YXRlKCk7XHJcbiAgXHJcbiAgY29uc3QgW3NpZGViYXJPcGVuLCBzZXRTaWRlYmFyT3Blbl0gPSB1c2VTdGF0ZSh0cnVlKTtcclxuICBcclxuICAvLyBDaGFyZ2VyIGRlcyBkb25uw6llcyBkJ2V4ZW1wbGUgYXUgZMOpbWFycmFnZVxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBzYW1wbGVEYXRhID0gZ2VuZXJhdGVTYW1wbGVEYXRhKCdwb2ludHMnLCAxMDApO1xyXG4gICAgYWRkRGF0YShzYW1wbGVEYXRhLCAnU2FtcGxlIFBvaW50cycpO1xyXG4gIH0sIFthZGREYXRhXSk7XHJcbiAgXHJcbiAgLy8gSGFuZGxlIGltcG9ydGVkIGRhdGFcclxuICBjb25zdCBoYW5kbGVEYXRhSW1wb3J0ZWQgPSAobmV3RGF0YSkgPT4ge1xyXG4gICAgYWRkRGF0YShuZXdEYXRhLCAnSW1wb3J0ZWQgRGF0YScpO1xyXG4gICAgXHJcbiAgICAvLyBBZGFwdGVyIGxlIHR5cGUgZGUgdmlzdWFsaXNhdGlvbiBzZWxvbiBsZXMgZG9ubsOpZXNcclxuICAgIGlmIChuZXdEYXRhICYmIG5ld0RhdGEuZmVhdHVyZXMgJiYgbmV3RGF0YS5mZWF0dXJlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGNvbnN0IGZpcnN0RmVhdHVyZSA9IG5ld0RhdGEuZmVhdHVyZXNbMF07XHJcbiAgICAgIGNvbnN0IGdlb21ldHJ5VHlwZSA9IGZpcnN0RmVhdHVyZS5nZW9tZXRyeS50eXBlO1xyXG4gICAgICBcclxuICAgICAgaWYgKGdlb21ldHJ5VHlwZSA9PT0gJ1BvaW50Jykge1xyXG4gICAgICAgIHNldFZpc3VhbGl6YXRpb25UeXBlKCdwb2ludHMnKTtcclxuICAgICAgfSBlbHNlIGlmIChnZW9tZXRyeVR5cGUuaW5jbHVkZXMoJ1BvbHlnb24nKSkge1xyXG4gICAgICAgIHNldFZpc3VhbGl6YXRpb25UeXBlKCdjaG9yb3BsZXRoJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIHJldHVybiAoXHJcbiAgICA8Qm94IHN4PXt7IGRpc3BsYXk6ICdmbGV4JywgaGVpZ2h0OiAnMTAwdmgnLCBvdmVyZmxvdzogJ2hpZGRlbicgfX0+XHJcbiAgICAgIDxIZWFkPlxyXG4gICAgICAgIDx0aXRsZT5NYXBDcmFmdCAtIMOJZGl0ZXVyIENhcnRvZ3JhcGhpcXVlPC90aXRsZT5cclxuICAgICAgICA8bWV0YSBuYW1lPVwiZGVzY3JpcHRpb25cIiBjb250ZW50PVwiw4lkaXRldXIgY2FydG9ncmFwaGlxdWUgUFdBIGF2ZWMgZGVjay5nbFwiIC8+XHJcbiAgICAgICAgPGxpbmsgcmVsPVwiaWNvblwiIGhyZWY9XCIvZmF2aWNvbi5pY29cIiAvPlxyXG4gICAgICAgIDxsaW5rIHJlbD1cIm1hbmlmZXN0XCIgaHJlZj1cIi9tYW5pZmVzdC5qc29uXCIgLz5cclxuICAgICAgICA8bWV0YSBuYW1lPVwidGhlbWUtY29sb3JcIiBjb250ZW50PVwiIzFhMjAyY1wiIC8+XHJcbiAgICAgIDwvSGVhZD5cclxuICAgICAgXHJcbiAgICAgIDxTdXNwZW5zZSBmYWxsYmFjaz17PExvYWRpbmcgLz59PlxyXG4gICAgICAgIDxTaWRlYmFyIFxyXG4gICAgICAgICAgb3Blbj17c2lkZWJhck9wZW59IFxyXG4gICAgICAgICAgc2V0T3Blbj17c2V0U2lkZWJhck9wZW59IFxyXG4gICAgICAgICAgb25EYXRhSW1wb3J0ZWQ9e2hhbmRsZURhdGFJbXBvcnRlZH0gXHJcbiAgICAgICAgLz5cclxuICAgICAgICBcclxuICAgICAgICA8Qm94IHN4PXt7IGZsZXhHcm93OiAxLCBwb3NpdGlvbjogJ3JlbGF0aXZlJywgb3ZlcmZsb3c6ICdoaWRkZW4nIH19PlxyXG4gICAgICAgICAgPERlY2tHTE1hcFxyXG4gICAgICAgICAgICBsYXllcnM9e2xheWVyc31cclxuICAgICAgICAgICAgdmlld1N0YXRlPXt2aWV3U3RhdGV9XHJcbiAgICAgICAgICAgIG9uVmlld1N0YXRlQ2hhbmdlPXtldnQgPT4gc2V0Vmlld1N0YXRlKGV2dC52aWV3U3RhdGUpfVxyXG4gICAgICAgICAgLz5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgPE1hcENvbnRyb2xzIFxyXG4gICAgICAgICAgICB2aWV3U3RhdGU9e3ZpZXdTdGF0ZX1cclxuICAgICAgICAgICAgc2V0Vmlld1N0YXRlPXtzZXRWaWV3U3RhdGV9XHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICA8RGF0YVBhbmVsIFxyXG4gICAgICAgICAgICB2aXN1YWxpemF0aW9uVHlwZT17dmlzdWFsaXphdGlvblR5cGV9IFxyXG4gICAgICAgICAgICBzZXRWaXN1YWxpemF0aW9uVHlwZT17c2V0VmlzdWFsaXphdGlvblR5cGV9XHJcbiAgICAgICAgICAgIGNsYXNzaWZpY2F0aW9uTWV0aG9kPXtjbGFzc2lmaWNhdGlvbk1ldGhvZH1cclxuICAgICAgICAgICAgc2V0Q2xhc3NpZmljYXRpb25NZXRob2Q9e3NldENsYXNzaWZpY2F0aW9uTWV0aG9kfVxyXG4gICAgICAgICAgICBjb2xvclBhbGV0dGU9e2NvbG9yUGFsZXR0ZX1cclxuICAgICAgICAgICAgc2V0Q29sb3JQYWxldHRlPXtzZXRDb2xvclBhbGV0dGV9XHJcbiAgICAgICAgICAgIG9wYWNpdHk9e29wYWNpdHl9XHJcbiAgICAgICAgICAgIHNldE9wYWNpdHk9e3NldE9wYWNpdHl9XHJcbiAgICAgICAgICAgIHJhZGl1cz17cmFkaXVzfVxyXG4gICAgICAgICAgICBzZXRSYWRpdXM9e3NldFJhZGl1c31cclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgPC9Cb3g+XHJcbiAgICAgIDwvU3VzcGVuc2U+XHJcbiAgICA8L0JveD5cclxuICApO1xyXG59Il0sIm5hbWVzIjpbIlJlYWN0IiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJTdXNwZW5zZSIsImxhenkiLCJIZWFkIiwiQm94IiwiQ2lyY3VsYXJQcm9ncmVzcyIsInVzZU1hcFN0YXRlIiwidXNlRGF0YVN0YXRlIiwiZ2VuZXJhdGVTYW1wbGVEYXRhIiwiRGVja0dMTWFwIiwiU2lkZWJhciIsIkRhdGFQYW5lbCIsIk1hcENvbnRyb2xzIiwiTG9hZGluZyIsImRpc3BsYXkiLCJqdXN0aWZ5Q29udGVudCIsImFsaWduSXRlbXMiLCJoZWlnaHQiLCJIb21lIiwidmlld1N0YXRlIiwic2V0Vmlld1N0YXRlIiwiYWRkRGF0YSIsImRhdGFzZXRzIiwidmlzdWFsaXphdGlvblR5cGUiLCJzZXRWaXN1YWxpemF0aW9uVHlwZSIsImNsYXNzaWZpY2F0aW9uTWV0aG9kIiwic2V0Q2xhc3NpZmljYXRpb25NZXRob2QiLCJjb2xvclBhbGV0dGUiLCJzZXRDb2xvclBhbGV0dGUiLCJvcGFjaXR5Iiwic2V0T3BhY2l0eSIsInJhZGl1cyIsInNldFJhZGl1cyIsImxheWVycyIsInNpZGViYXJPcGVuIiwic2V0U2lkZWJhck9wZW4iLCJzYW1wbGVEYXRhIiwiaGFuZGxlRGF0YUltcG9ydGVkIiwibmV3RGF0YSIsImZlYXR1cmVzIiwibGVuZ3RoIiwiZmlyc3RGZWF0dXJlIiwiZ2VvbWV0cnlUeXBlIiwiZ2VvbWV0cnkiLCJ0eXBlIiwiaW5jbHVkZXMiLCJzeCIsIm92ZXJmbG93IiwidGl0bGUiLCJtZXRhIiwibmFtZSIsImNvbnRlbnQiLCJsaW5rIiwicmVsIiwiaHJlZiIsImZhbGxiYWNrIiwib3BlbiIsInNldE9wZW4iLCJvbkRhdGFJbXBvcnRlZCIsImZsZXhHcm93IiwicG9zaXRpb24iLCJvblZpZXdTdGF0ZUNoYW5nZSIsImV2dCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/index.js\n"));

/***/ })

});