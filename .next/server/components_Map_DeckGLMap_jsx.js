"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "components_Map_DeckGLMap_jsx";
exports.ids = ["components_Map_DeckGLMap_jsx"];
exports.modules = {

/***/ "__barrel_optimize__?names=Box,Fade,Paper,Typography!=!./node_modules/@mui/material/esm/index.js":
/*!*******************************************************************************************************!*\
  !*** __barrel_optimize__?names=Box,Fade,Paper,Typography!=!./node_modules/@mui/material/esm/index.js ***!
  \*******************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Box: () => (/* reexport safe */ _Box_index_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]),\n/* harmony export */   Fade: () => (/* reexport safe */ _Fade_index_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"]),\n/* harmony export */   Paper: () => (/* reexport safe */ _Paper_index_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]),\n/* harmony export */   Typography: () => (/* reexport safe */ _Typography_index_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"])\n/* harmony export */ });\n/* harmony import */ var _Box_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Box/index.js */ \"./node_modules/@mui/material/esm/Box/index.js\");\n/* harmony import */ var _Fade_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Fade/index.js */ \"./node_modules/@mui/material/esm/Fade/index.js\");\n/* harmony import */ var _Paper_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Paper/index.js */ \"./node_modules/@mui/material/esm/Paper/index.js\");\n/* harmony import */ var _Typography_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Typography/index.js */ \"./node_modules/@mui/material/esm/Typography/index.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_Box_index_js__WEBPACK_IMPORTED_MODULE_0__, _Fade_index_js__WEBPACK_IMPORTED_MODULE_1__, _Paper_index_js__WEBPACK_IMPORTED_MODULE_2__, _Typography_index_js__WEBPACK_IMPORTED_MODULE_3__]);\n([_Box_index_js__WEBPACK_IMPORTED_MODULE_0__, _Fade_index_js__WEBPACK_IMPORTED_MODULE_1__, _Paper_index_js__WEBPACK_IMPORTED_MODULE_2__, _Typography_index_js__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX19iYXJyZWxfb3B0aW1pemVfXz9uYW1lcz1Cb3gsRmFkZSxQYXBlcixUeXBvZ3JhcGh5IT0hLi9ub2RlX21vZHVsZXMvQG11aS9tYXRlcmlhbC9lc20vaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQytDO0FBQ0U7QUFDRSIsInNvdXJjZXMiOlsid2VicGFjazovL21hcGNyYWZ0Ly4vbm9kZV9tb2R1bGVzL0BtdWkvbWF0ZXJpYWwvZXNtL2luZGV4LmpzP2ExYzgiXSwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgeyBkZWZhdWx0IGFzIEJveCB9IGZyb20gXCIuL0JveC9pbmRleC5qc1wiXG5leHBvcnQgeyBkZWZhdWx0IGFzIEZhZGUgfSBmcm9tIFwiLi9GYWRlL2luZGV4LmpzXCJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGFwZXIgfSBmcm9tIFwiLi9QYXBlci9pbmRleC5qc1wiXG5leHBvcnQgeyBkZWZhdWx0IGFzIFR5cG9ncmFwaHkgfSBmcm9tIFwiLi9UeXBvZ3JhcGh5L2luZGV4LmpzXCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///__barrel_optimize__?names=Box,Fade,Paper,Typography!=!./node_modules/@mui/material/esm/index.js\n");

/***/ }),

/***/ "./components/Map/DeckGLMap.jsx":
/*!**************************************!*\
  !*** ./components/Map/DeckGLMap.jsx ***!
  \**************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _deck_gl_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @deck.gl/react */ \"@deck.gl/react\");\n/* harmony import */ var _deck_gl_react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_deck_gl_react__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react_map_gl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-map-gl */ \"react-map-gl\");\n/* harmony import */ var react_map_gl__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_map_gl__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! __barrel_optimize__?names=Box,Fade,Paper,Typography!=!@mui/material */ \"__barrel_optimize__?names=Box,Fade,Paper,Typography!=!./node_modules/@mui/material/esm/index.js\");\n/* harmony import */ var _mui_material_styles__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @mui/material/styles */ \"@mui/material/styles\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_mui_material_styles__WEBPACK_IMPORTED_MODULE_4__, _barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__]);\n([_mui_material_styles__WEBPACK_IMPORTED_MODULE_4__, _barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n// Tooltip component for hover information\nconst CustomTooltip = ({ hoveredObject, x, y })=>{\n    const theme = (0,_mui_material_styles__WEBPACK_IMPORTED_MODULE_4__.useTheme)();\n    if (!hoveredObject) return null;\n    const properties = hoveredObject.properties || {};\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__.Fade, {\n        in: !!hoveredObject,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__.Paper, {\n            elevation: 3,\n            sx: {\n                position: \"absolute\",\n                zIndex: 10000,\n                pointerEvents: \"none\",\n                maxWidth: 300,\n                left: x,\n                top: y,\n                p: 1.5,\n                borderLeft: 4,\n                borderColor: \"primary.main\"\n            },\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__.Typography, {\n                    variant: \"subtitle2\",\n                    gutterBottom: true,\n                    children: properties.name || \"Sans nom\"\n                }, void 0, false, {\n                    fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n                    lineNumber: 31,\n                    columnNumber: 9\n                }, undefined),\n                Object.entries(properties).filter(([key])=>![\n                        \"name\",\n                        \"id\"\n                    ].includes(key)).map(([key, value])=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__.Box, {\n                        sx: {\n                            display: \"flex\",\n                            fontSize: \"0.85rem\",\n                            my: 0.5\n                        },\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__.Typography, {\n                                variant: \"caption\",\n                                sx: {\n                                    mr: 1,\n                                    fontWeight: 500,\n                                    minWidth: 70\n                                },\n                                children: [\n                                    key,\n                                    \":\"\n                                ]\n                            }, void 0, true, {\n                                fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n                                lineNumber: 39,\n                                columnNumber: 15\n                            }, undefined),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__.Typography, {\n                                variant: \"caption\",\n                                sx: {\n                                    wordBreak: \"break-word\"\n                                },\n                                children: typeof value === \"object\" ? JSON.stringify(value) : value\n                            }, void 0, false, {\n                                fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n                                lineNumber: 45,\n                                columnNumber: 15\n                            }, undefined)\n                        ]\n                    }, key, true, {\n                        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n                        lineNumber: 38,\n                        columnNumber: 13\n                    }, undefined))\n            ]\n        }, void 0, true, {\n            fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n            lineNumber: 17,\n            columnNumber: 7\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n        lineNumber: 16,\n        columnNumber: 5\n    }, undefined);\n};\nfunction DeckGLMap({ layers, viewState, onViewStateChange }) {\n    const theme = (0,_mui_material_styles__WEBPACK_IMPORTED_MODULE_4__.useTheme)();\n    const [hoverInfo, setHoverInfo] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    // Memoize deck.gl props to prevent unnecessary re-renders\n    const deckProps = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(()=>({\n            layers,\n            viewState,\n            onViewStateChange,\n            getTooltip: null,\n            controller: true,\n            pickingRadius: 5,\n            onHover: (info)=>{\n                if (info.object) {\n                    setHoverInfo({\n                        object: info.object,\n                        x: info.x,\n                        y: info.y\n                    });\n                } else {\n                    setHoverInfo(null);\n                }\n            }\n        }), [\n        layers,\n        viewState,\n        onViewStateChange\n    ]);\n    // Select appropriate map style based on theme\n    const mapStyle = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(()=>{\n        return theme.palette.mode === \"dark\" ? \"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json\" : \"https://basemaps.cartocdn.com/gl/positron-gl-style/style.json\";\n    }, [\n        theme.palette.mode\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Box_Fade_Paper_Typography_mui_material__WEBPACK_IMPORTED_MODULE_5__.Box, {\n        sx: {\n            position: \"absolute\",\n            width: \"100%\",\n            height: \"100%\",\n            \"& .mapboxgl-ctrl-bottom-right\": {\n                display: \"none\"\n            }\n        },\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_deck_gl_react__WEBPACK_IMPORTED_MODULE_2__.DeckGL, {\n                ...deckProps,\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_map_gl__WEBPACK_IMPORTED_MODULE_3__.Map, {\n                    mapStyle: mapStyle,\n                    preventStyleDiffing: true,\n                    reuseMaps: true,\n                    attributionControl: false\n                }, void 0, false, {\n                    fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n                    lineNumber: 99,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n                lineNumber: 98,\n                columnNumber: 7\n            }, this),\n            hoverInfo && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(CustomTooltip, {\n                hoveredObject: hoverInfo.object,\n                x: hoverInfo.x,\n                y: hoverInfo.y\n            }, void 0, false, {\n                fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n                lineNumber: 109,\n                columnNumber: 9\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"D:\\\\Users\\\\Simon\\\\OneDrive\\\\Documents\\\\GitHub\\\\map-craft\\\\components\\\\Map\\\\DeckGLMap.jsx\",\n        lineNumber: 88,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().memo(DeckGLMap));\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVVBO29CQUNWSyxxQkFBcUI7b0JBQ3JCQyxTQUFTO29CQUNUQyxvQkFBb0I7Ozs7Ozs7Ozs7O1lBS3ZCaEIsMkJBQ0MsOERBQUN6QztnQkFDQ0MsZUFBZXdDLFVBQVVRLE1BQU07Z0JBQy9CL0MsR0FBR3VDLFVBQVV2QyxDQUFDO2dCQUNkQyxHQUFHc0MsVUFBVXRDLENBQUM7Ozs7Ozs7Ozs7OztBQUt4QjtBQUVBLDhFQUFlYixpREFBVSxDQUFDK0MsVUFBVUEsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL21hcGNyYWZ0Ly4vY29tcG9uZW50cy9NYXAvRGVja0dMTWFwLmpzeD81YTExIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgRGVja0dMIH0gZnJvbSAnQGRlY2suZ2wvcmVhY3QnO1xyXG5pbXBvcnQgeyBNYXAgfSBmcm9tICdyZWFjdC1tYXAtZ2wnO1xyXG5pbXBvcnQgeyBCb3gsIFBhcGVyLCBUeXBvZ3JhcGh5LCBGYWRlIH0gZnJvbSAnQG11aS9tYXRlcmlhbCc7XHJcbmltcG9ydCB7IHVzZVRoZW1lIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9zdHlsZXMnO1xyXG5cclxuLy8gVG9vbHRpcCBjb21wb25lbnQgZm9yIGhvdmVyIGluZm9ybWF0aW9uXHJcbmNvbnN0IEN1c3RvbVRvb2x0aXAgPSAoeyBob3ZlcmVkT2JqZWN0LCB4LCB5IH0pID0+IHtcclxuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKCk7XHJcbiAgXHJcbiAgaWYgKCFob3ZlcmVkT2JqZWN0KSByZXR1cm4gbnVsbDtcclxuICBcclxuICBjb25zdCBwcm9wZXJ0aWVzID0gaG92ZXJlZE9iamVjdC5wcm9wZXJ0aWVzIHx8IHt9O1xyXG4gIFxyXG4gIHJldHVybiAoXHJcbiAgICA8RmFkZSBpbj17ISFob3ZlcmVkT2JqZWN0fT5cclxuICAgICAgPFBhcGVyXHJcbiAgICAgICAgZWxldmF0aW9uPXszfVxyXG4gICAgICAgIHN4PXt7XHJcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgIHpJbmRleDogMTAwMDAsXHJcbiAgICAgICAgICBwb2ludGVyRXZlbnRzOiAnbm9uZScsXHJcbiAgICAgICAgICBtYXhXaWR0aDogMzAwLFxyXG4gICAgICAgICAgbGVmdDogeCxcclxuICAgICAgICAgIHRvcDogeSxcclxuICAgICAgICAgIHA6IDEuNSxcclxuICAgICAgICAgIGJvcmRlckxlZnQ6IDQsXHJcbiAgICAgICAgICBib3JkZXJDb2xvcjogJ3ByaW1hcnkubWFpbicsXHJcbiAgICAgICAgfX1cclxuICAgICAgPlxyXG4gICAgICAgIDxUeXBvZ3JhcGh5IHZhcmlhbnQ9XCJzdWJ0aXRsZTJcIiBndXR0ZXJCb3R0b20+XHJcbiAgICAgICAgICB7cHJvcGVydGllcy5uYW1lIHx8ICdTYW5zIG5vbSd9XHJcbiAgICAgICAgPC9UeXBvZ3JhcGh5PlxyXG4gICAgICAgIFxyXG4gICAgICAgIHtPYmplY3QuZW50cmllcyhwcm9wZXJ0aWVzKVxyXG4gICAgICAgICAgLmZpbHRlcigoW2tleV0pID0+ICFbJ25hbWUnLCAnaWQnXS5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgICAgLm1hcCgoW2tleSwgdmFsdWVdKSA9PiAoXHJcbiAgICAgICAgICAgIDxCb3gga2V5PXtrZXl9IHN4PXt7IGRpc3BsYXk6ICdmbGV4JywgZm9udFNpemU6ICcwLjg1cmVtJywgbXk6IDAuNSB9fT5cclxuICAgICAgICAgICAgICA8VHlwb2dyYXBoeVxyXG4gICAgICAgICAgICAgICAgdmFyaWFudD1cImNhcHRpb25cIlxyXG4gICAgICAgICAgICAgICAgc3g9e3sgbXI6IDEsIGZvbnRXZWlnaHQ6IDUwMCwgbWluV2lkdGg6IDcwIH19XHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAge2tleX06XHJcbiAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxyXG4gICAgICAgICAgICAgIDxUeXBvZ3JhcGh5IHZhcmlhbnQ9XCJjYXB0aW9uXCIgc3g9e3sgd29yZEJyZWFrOiAnYnJlYWstd29yZCcgfX0+XHJcbiAgICAgICAgICAgICAgICB7dHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHZhbHVlKSA6IHZhbHVlfVxyXG4gICAgICAgICAgICAgIDwvVHlwb2dyYXBoeT5cclxuICAgICAgICAgICAgPC9Cb3g+XHJcbiAgICAgICAgICApKX1cclxuICAgICAgPC9QYXBlcj5cclxuICAgIDwvRmFkZT5cclxuICApO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gRGVja0dMTWFwKHsgbGF5ZXJzLCB2aWV3U3RhdGUsIG9uVmlld1N0YXRlQ2hhbmdlIH0pIHtcclxuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKCk7XHJcbiAgY29uc3QgW2hvdmVySW5mbywgc2V0SG92ZXJJbmZvXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIFxyXG4gIC8vIE1lbW9pemUgZGVjay5nbCBwcm9wcyB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IHJlLXJlbmRlcnNcclxuICBjb25zdCBkZWNrUHJvcHMgPSB1c2VNZW1vKCgpID0+ICh7XHJcbiAgICBsYXllcnMsXHJcbiAgICB2aWV3U3RhdGUsXHJcbiAgICBvblZpZXdTdGF0ZUNoYW5nZSxcclxuICAgIGdldFRvb2x0aXA6IG51bGwsIC8vIFdlJ2xsIHVzZSBvdXIgY3VzdG9tIHRvb2x0aXAgaW5zdGVhZFxyXG4gICAgY29udHJvbGxlcjogdHJ1ZSxcclxuICAgIHBpY2tpbmdSYWRpdXM6IDUsXHJcbiAgICBvbkhvdmVyOiAoaW5mbykgPT4ge1xyXG4gICAgICBpZiAoaW5mby5vYmplY3QpIHtcclxuICAgICAgICBzZXRIb3ZlckluZm8oe1xyXG4gICAgICAgICAgb2JqZWN0OiBpbmZvLm9iamVjdCxcclxuICAgICAgICAgIHg6IGluZm8ueCxcclxuICAgICAgICAgIHk6IGluZm8ueVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNldEhvdmVySW5mbyhudWxsKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pLCBbbGF5ZXJzLCB2aWV3U3RhdGUsIG9uVmlld1N0YXRlQ2hhbmdlXSk7XHJcblxyXG4gIC8vIFNlbGVjdCBhcHByb3ByaWF0ZSBtYXAgc3R5bGUgYmFzZWQgb24gdGhlbWVcclxuICBjb25zdCBtYXBTdHlsZSA9IHVzZU1lbW8oKCkgPT4ge1xyXG4gICAgcmV0dXJuIHRoZW1lLnBhbGV0dGUubW9kZSA9PT0gJ2RhcmsnXHJcbiAgICAgID8gJ2h0dHBzOi8vYmFzZW1hcHMuY2FydG9jZG4uY29tL2dsL2RhcmstbWF0dGVyLWdsLXN0eWxlL3N0eWxlLmpzb24nXHJcbiAgICAgIDogJ2h0dHBzOi8vYmFzZW1hcHMuY2FydG9jZG4uY29tL2dsL3Bvc2l0cm9uLWdsLXN0eWxlL3N0eWxlLmpzb24nO1xyXG4gIH0sIFt0aGVtZS5wYWxldHRlLm1vZGVdKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxCb3ggXHJcbiAgICAgIHN4PXt7IFxyXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBcclxuICAgICAgICB3aWR0aDogJzEwMCUnLCBcclxuICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAnJiAubWFwYm94Z2wtY3RybC1ib3R0b20tcmlnaHQnOiB7XHJcbiAgICAgICAgICBkaXNwbGF5OiAnbm9uZScsIC8vIEhpZGUgTWFwTGlicmUgYXR0cmlidXRpb25cclxuICAgICAgICB9LFxyXG4gICAgICB9fVxyXG4gICAgPlxyXG4gICAgICA8RGVja0dMIHsuLi5kZWNrUHJvcHN9PlxyXG4gICAgICAgIDxNYXAgXHJcbiAgICAgICAgICBtYXBTdHlsZT17bWFwU3R5bGV9XHJcbiAgICAgICAgICBwcmV2ZW50U3R5bGVEaWZmaW5nPXt0cnVlfVxyXG4gICAgICAgICAgcmV1c2VNYXBzXHJcbiAgICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w9e2ZhbHNlfVxyXG4gICAgICAgIC8+XHJcbiAgICAgIDwvRGVja0dMPlxyXG4gICAgICBcclxuICAgICAgey8qIEN1c3RvbSB0b29sdGlwICovfVxyXG4gICAgICB7aG92ZXJJbmZvICYmIChcclxuICAgICAgICA8Q3VzdG9tVG9vbHRpcCBcclxuICAgICAgICAgIGhvdmVyZWRPYmplY3Q9e2hvdmVySW5mby5vYmplY3R9IFxyXG4gICAgICAgICAgeD17aG92ZXJJbmZvLnh9IFxyXG4gICAgICAgICAgeT17aG92ZXJJbmZvLnl9XHJcbiAgICAgICAgLz5cclxuICAgICAgKX1cclxuICAgIDwvQm94PlxyXG4gICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlYWN0Lm1lbW8oRGVja0dMTWFwKTsiXSwibmFtZXMiOlsiUmVhY3QiLCJ1c2VTdGF0ZSIsInVzZU1lbW8iLCJEZWNrR0wiLCJNYXAiLCJCb3giLCJQYXBlciIsIlR5cG9ncmFwaHkiLCJGYWRlIiwidXNlVGhlbWUiLCJDdXN0b21Ub29sdGlwIiwiaG92ZXJlZE9iamVjdCIsIngiLCJ5IiwidGhlbWUiLCJwcm9wZXJ0aWVzIiwiaW4iLCJlbGV2YXRpb24iLCJzeCIsInBvc2l0aW9uIiwiekluZGV4IiwicG9pbnRlckV2ZW50cyIsIm1heFdpZHRoIiwibGVmdCIsInRvcCIsInAiLCJib3JkZXJMZWZ0IiwiYm9yZGVyQ29sb3IiLCJ2YXJpYW50IiwiZ3V0dGVyQm90dG9tIiwibmFtZSIsIk9iamVjdCIsImVudHJpZXMiLCJmaWx0ZXIiLCJrZXkiLCJpbmNsdWRlcyIsIm1hcCIsInZhbHVlIiwiZGlzcGxheSIsImZvbnRTaXplIiwibXkiLCJtciIsImZvbnRXZWlnaHQiLCJtaW5XaWR0aCIsIndvcmRCcmVhayIsIkpTT04iLCJzdHJpbmdpZnkiLCJEZWNrR0xNYXAiLCJsYXllcnMiLCJ2aWV3U3RhdGUiLCJvblZpZXdTdGF0ZUNoYW5nZSIsImhvdmVySW5mbyIsInNldEhvdmVySW5mbyIsImRlY2tQcm9wcyIsImdldFRvb2x0aXAiLCJjb250cm9sbGVyIiwicGlja2luZ1JhZGl1cyIsIm9uSG92ZXIiLCJpbmZvIiwib2JqZWN0IiwibWFwU3R5bGUiLCJwYWxldHRlIiwibW9kZSIsIndpZHRoIiwiaGVpZ2h0IiwicHJldmVudFN0eWxlRGlmZmluZyIsInJldXNlTWFwcyIsImF0dHJpYnV0aW9uQ29udHJvbCIsIm1lbW8iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./components/Map/DeckGLMap.jsx\n");

/***/ })

};
;