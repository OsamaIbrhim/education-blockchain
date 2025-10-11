/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./context/LanguageContext.tsx":
/*!*************************************!*\
  !*** ./context/LanguageContext.tsx ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   LanguageProvider: () => (/* binding */ LanguageProvider),\n/* harmony export */   useLanguage: () => (/* binding */ useLanguage)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst LanguageContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nconst LanguageProvider = ({ children })=>{\n    const [language, setLanguageState] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('en');\n    const [translations, setTranslations] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({});\n    const [allTranslations, setAllTranslations] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({});\n    // Define supported languages based on your i18n files\n    // This could also be derived or managed more dynamically if needed.\n    const PREDEFINED_SUPPORTED_LANGUAGES = [\n        'en',\n        'ar'\n    ];\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"LanguageProvider.useEffect\": ()=>{\n            const fetchTranslations = {\n                \"LanguageProvider.useEffect.fetchTranslations\": async ()=>{\n                    try {\n                        const enRes = await fetch('/i18n/en.json');\n                        const enData = await enRes.json();\n                        const arRes = await fetch('/i18n/ar.json');\n                        const arData = await arRes.json();\n                        setAllTranslations({\n                            en: enData,\n                            ar: arData\n                        });\n                    // Removed: setTranslations(enData); // Default to English\n                    // The useEffect below will handle setting translations based on the current language\n                    } catch (error) {\n                        console.error('Failed to load translations:', error);\n                        setAllTranslations({\n                            en: {},\n                            ar: {}\n                        });\n                        setTranslations({});\n                    }\n                }\n            }[\"LanguageProvider.useEffect.fetchTranslations\"];\n            fetchTranslations();\n        }\n    }[\"LanguageProvider.useEffect\"], []);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"LanguageProvider.useEffect\": ()=>{\n            if (language === 'ar') {\n                document.documentElement.dir = 'rtl';\n            } else {\n                document.documentElement.dir = 'ltr';\n            }\n            setTranslations(allTranslations[language] || {});\n        }\n    }[\"LanguageProvider.useEffect\"], [\n        language,\n        allTranslations\n    ]);\n    const setLanguage = (lang)=>{\n        // Validate against the predefined list of supported languages\n        if (PREDEFINED_SUPPORTED_LANGUAGES.includes(lang)) {\n            setLanguageState(lang);\n        } else {\n            console.warn(`Attempted to set unsupported language: '\\${lang}'. Defaulting to '\\${PREDEFINED_SUPPORTED_LANGUAGES[0] || 'en'}'.`);\n            // Default to the first supported language or 'en' as a fallback\n            setLanguageState(PREDEFINED_SUPPORTED_LANGUAGES[0] || 'en');\n        }\n    };\n    const t = (key)=>{\n        if (!translations || Object.keys(translations).length === 0) return '...';\n        return translations[key] || key;\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(LanguageContext.Provider, {\n        value: {\n            language,\n            setLanguage,\n            translations,\n            t\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\context\\\\LanguageContext.tsx\",\n        lineNumber: 70,\n        columnNumber: 5\n    }, undefined);\n};\nconst useLanguage = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(LanguageContext);\n    if (!context) {\n        throw new Error('useLanguage must be used within a LanguageProvider');\n    }\n    return context;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL2NvbnRleHQvTGFuZ3VhZ2VDb250ZXh0LnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQXlGO0FBYXpGLE1BQU1LLGdDQUFrQkosb0RBQWFBLENBQWtDSztBQUVoRSxNQUFNQyxtQkFBc0QsQ0FBQyxFQUFFQyxRQUFRLEVBQUU7SUFDOUUsTUFBTSxDQUFDQyxVQUFVQyxpQkFBaUIsR0FBR1IsK0NBQVFBLENBQVM7SUFDdEQsTUFBTSxDQUFDUyxjQUFjQyxnQkFBZ0IsR0FBR1YsK0NBQVFBLENBQWUsQ0FBQztJQUNoRSxNQUFNLENBQUNXLGlCQUFpQkMsbUJBQW1CLEdBQUdaLCtDQUFRQSxDQUFtQyxDQUFDO0lBRTFGLHNEQUFzRDtJQUN0RCxvRUFBb0U7SUFDcEUsTUFBTWEsaUNBQWlDO1FBQUM7UUFBTTtLQUFLO0lBRW5EWixnREFBU0E7c0NBQUM7WUFDUixNQUFNYTtnRUFBb0I7b0JBQ3hCLElBQUk7d0JBQ0YsTUFBTUMsUUFBUSxNQUFNQyxNQUFNO3dCQUMxQixNQUFNQyxTQUFTLE1BQU1GLE1BQU1HLElBQUk7d0JBQy9CLE1BQU1DLFFBQVEsTUFBTUgsTUFBTTt3QkFDMUIsTUFBTUksU0FBUyxNQUFNRCxNQUFNRCxJQUFJO3dCQUMvQk4sbUJBQW1COzRCQUFFUyxJQUFJSjs0QkFBUUssSUFBSUY7d0JBQU87b0JBQzVDLDBEQUEwRDtvQkFDMUQscUZBQXFGO29CQUN2RixFQUFFLE9BQU9HLE9BQU87d0JBQ2RDLFFBQVFELEtBQUssQ0FBQyxnQ0FBZ0NBO3dCQUM5Q1gsbUJBQW1COzRCQUFFUyxJQUFJLENBQUM7NEJBQUdDLElBQUksQ0FBQzt3QkFBRTt3QkFDcENaLGdCQUFnQixDQUFDO29CQUNuQjtnQkFDRjs7WUFDQUk7UUFDRjtxQ0FBRyxFQUFFO0lBRUxiLGdEQUFTQTtzQ0FBQztZQUNSLElBQUlNLGFBQWEsTUFBTTtnQkFDckJrQixTQUFTQyxlQUFlLENBQUNDLEdBQUcsR0FBRztZQUNqQyxPQUFPO2dCQUNMRixTQUFTQyxlQUFlLENBQUNDLEdBQUcsR0FBRztZQUNqQztZQUNBakIsZ0JBQWdCQyxlQUFlLENBQUNKLFNBQVMsSUFBSSxDQUFDO1FBQ2hEO3FDQUFHO1FBQUNBO1FBQVVJO0tBQWdCO0lBRTlCLE1BQU1pQixjQUFjLENBQUNDO1FBQ25CLDhEQUE4RDtRQUM5RCxJQUFJaEIsK0JBQStCaUIsUUFBUSxDQUFDRCxPQUFPO1lBQ2pEckIsaUJBQWlCcUI7UUFDbkIsT0FBTztZQUNMTCxRQUFRTyxJQUFJLENBQUMsQ0FBQyxpSEFBaUgsQ0FBQztZQUNoSSxnRUFBZ0U7WUFDaEV2QixpQkFBaUJLLDhCQUE4QixDQUFDLEVBQUUsSUFBSTtRQUN4RDtJQUNGO0lBRUEsTUFBTW1CLElBQUksQ0FBQ0M7UUFDVCxJQUFJLENBQUN4QixnQkFBZ0J5QixPQUFPQyxJQUFJLENBQUMxQixjQUFjMkIsTUFBTSxLQUFLLEdBQUcsT0FBTztRQUNwRSxPQUFPM0IsWUFBWSxDQUFDd0IsSUFBSSxJQUFJQTtJQUM5QjtJQUVBLHFCQUNFLDhEQUFDOUIsZ0JBQWdCa0MsUUFBUTtRQUFDQyxPQUFPO1lBQUUvQjtZQUFVcUI7WUFBYW5CO1lBQWN1QjtRQUFFO2tCQUN2RTFCOzs7Ozs7QUFHUCxFQUFFO0FBRUssTUFBTWlDLGNBQWM7SUFDekIsTUFBTUMsVUFBVXRDLGlEQUFVQSxDQUFDQztJQUMzQixJQUFJLENBQUNxQyxTQUFTO1FBQ1osTUFBTSxJQUFJQyxNQUFNO0lBQ2xCO0lBQ0EsT0FBT0Q7QUFDVCxFQUFFIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXG9zYW1hXFxPbmVEcml2ZVxcRGVza3RvcFxcR3JhZHVhdGlvblxcZWR1Y2F0aW9uLWJsb2NrY2hhaW5cXGNvbnRleHRcXExhbmd1YWdlQ29udGV4dC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNvbnRleHQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcclxuXHJcbmludGVyZmFjZSBUcmFuc2xhdGlvbnMge1xyXG4gIFtrZXk6IHN0cmluZ106IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIExhbmd1YWdlQ29udGV4dFR5cGUge1xyXG4gIGxhbmd1YWdlOiBzdHJpbmc7XHJcbiAgc2V0TGFuZ3VhZ2U6IChsYW5ndWFnZTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIHRyYW5zbGF0aW9uczogVHJhbnNsYXRpb25zO1xyXG4gIHQ6IChrZXk6IHN0cmluZykgPT4gc3RyaW5nO1xyXG59XHJcblxyXG5jb25zdCBMYW5ndWFnZUNvbnRleHQgPSBjcmVhdGVDb250ZXh0PExhbmd1YWdlQ29udGV4dFR5cGUgfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCk7XHJcblxyXG5leHBvcnQgY29uc3QgTGFuZ3VhZ2VQcm92aWRlcjogUmVhY3QuRkM8eyBjaGlsZHJlbjogUmVhY3ROb2RlIH0+ID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xyXG4gIGNvbnN0IFtsYW5ndWFnZSwgc2V0TGFuZ3VhZ2VTdGF0ZV0gPSB1c2VTdGF0ZTxzdHJpbmc+KCdlbicpO1xyXG4gIGNvbnN0IFt0cmFuc2xhdGlvbnMsIHNldFRyYW5zbGF0aW9uc10gPSB1c2VTdGF0ZTxUcmFuc2xhdGlvbnM+KHt9KTtcclxuICBjb25zdCBbYWxsVHJhbnNsYXRpb25zLCBzZXRBbGxUcmFuc2xhdGlvbnNdID0gdXNlU3RhdGU8eyBbbGFuZzogc3RyaW5nXTogVHJhbnNsYXRpb25zIH0+KHt9KTtcclxuXHJcbiAgLy8gRGVmaW5lIHN1cHBvcnRlZCBsYW5ndWFnZXMgYmFzZWQgb24geW91ciBpMThuIGZpbGVzXHJcbiAgLy8gVGhpcyBjb3VsZCBhbHNvIGJlIGRlcml2ZWQgb3IgbWFuYWdlZCBtb3JlIGR5bmFtaWNhbGx5IGlmIG5lZWRlZC5cclxuICBjb25zdCBQUkVERUZJTkVEX1NVUFBPUlRFRF9MQU5HVUFHRVMgPSBbJ2VuJywgJ2FyJ107XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBmZXRjaFRyYW5zbGF0aW9ucyA9IGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBlblJlcyA9IGF3YWl0IGZldGNoKCcvaTE4bi9lbi5qc29uJyk7XHJcbiAgICAgICAgY29uc3QgZW5EYXRhID0gYXdhaXQgZW5SZXMuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IGFyUmVzID0gYXdhaXQgZmV0Y2goJy9pMThuL2FyLmpzb24nKTtcclxuICAgICAgICBjb25zdCBhckRhdGEgPSBhd2FpdCBhclJlcy5qc29uKCk7XHJcbiAgICAgICAgc2V0QWxsVHJhbnNsYXRpb25zKHsgZW46IGVuRGF0YSwgYXI6IGFyRGF0YSB9KTtcclxuICAgICAgICAvLyBSZW1vdmVkOiBzZXRUcmFuc2xhdGlvbnMoZW5EYXRhKTsgLy8gRGVmYXVsdCB0byBFbmdsaXNoXHJcbiAgICAgICAgLy8gVGhlIHVzZUVmZmVjdCBiZWxvdyB3aWxsIGhhbmRsZSBzZXR0aW5nIHRyYW5zbGF0aW9ucyBiYXNlZCBvbiB0aGUgY3VycmVudCBsYW5ndWFnZVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHRyYW5zbGF0aW9uczonLCBlcnJvcik7XHJcbiAgICAgICAgc2V0QWxsVHJhbnNsYXRpb25zKHsgZW46IHt9LCBhcjoge30gfSk7XHJcbiAgICAgICAgc2V0VHJhbnNsYXRpb25zKHt9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGZldGNoVHJhbnNsYXRpb25zKCk7XHJcbiAgfSwgW10pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGxhbmd1YWdlID09PSAnYXInKSB7XHJcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kaXIgPSAncnRsJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kaXIgPSAnbHRyJztcclxuICAgIH1cclxuICAgIHNldFRyYW5zbGF0aW9ucyhhbGxUcmFuc2xhdGlvbnNbbGFuZ3VhZ2VdIHx8IHt9KTtcclxuICB9LCBbbGFuZ3VhZ2UsIGFsbFRyYW5zbGF0aW9uc10pO1xyXG5cclxuICBjb25zdCBzZXRMYW5ndWFnZSA9IChsYW5nOiBzdHJpbmcpID0+IHtcclxuICAgIC8vIFZhbGlkYXRlIGFnYWluc3QgdGhlIHByZWRlZmluZWQgbGlzdCBvZiBzdXBwb3J0ZWQgbGFuZ3VhZ2VzXHJcbiAgICBpZiAoUFJFREVGSU5FRF9TVVBQT1JURURfTEFOR1VBR0VTLmluY2x1ZGVzKGxhbmcpKSB7XHJcbiAgICAgIHNldExhbmd1YWdlU3RhdGUobGFuZyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLndhcm4oYEF0dGVtcHRlZCB0byBzZXQgdW5zdXBwb3J0ZWQgbGFuZ3VhZ2U6ICdcXCR7bGFuZ30nLiBEZWZhdWx0aW5nIHRvICdcXCR7UFJFREVGSU5FRF9TVVBQT1JURURfTEFOR1VBR0VTWzBdIHx8ICdlbid9Jy5gKTtcclxuICAgICAgLy8gRGVmYXVsdCB0byB0aGUgZmlyc3Qgc3VwcG9ydGVkIGxhbmd1YWdlIG9yICdlbicgYXMgYSBmYWxsYmFja1xyXG4gICAgICBzZXRMYW5ndWFnZVN0YXRlKFBSRURFRklORURfU1VQUE9SVEVEX0xBTkdVQUdFU1swXSB8fCAnZW4nKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCB0ID0gKGtleTogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgIGlmICghdHJhbnNsYXRpb25zIHx8IE9iamVjdC5rZXlzKHRyYW5zbGF0aW9ucykubGVuZ3RoID09PSAwKSByZXR1cm4gJy4uLic7XHJcbiAgICByZXR1cm4gdHJhbnNsYXRpb25zW2tleV0gfHwga2V5O1xyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8TGFuZ3VhZ2VDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7IGxhbmd1YWdlLCBzZXRMYW5ndWFnZSwgdHJhbnNsYXRpb25zLCB0IH19PlxyXG4gICAgICB7Y2hpbGRyZW59XHJcbiAgICA8L0xhbmd1YWdlQ29udGV4dC5Qcm92aWRlcj5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHVzZUxhbmd1YWdlID0gKCk6IExhbmd1YWdlQ29udGV4dFR5cGUgPT4ge1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KExhbmd1YWdlQ29udGV4dCk7XHJcbiAgaWYgKCFjb250ZXh0KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VzZUxhbmd1YWdlIG11c3QgYmUgdXNlZCB3aXRoaW4gYSBMYW5ndWFnZVByb3ZpZGVyJyk7XHJcbiAgfVxyXG4gIHJldHVybiBjb250ZXh0O1xyXG59OyJdLCJuYW1lcyI6WyJSZWFjdCIsImNyZWF0ZUNvbnRleHQiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVzZUNvbnRleHQiLCJMYW5ndWFnZUNvbnRleHQiLCJ1bmRlZmluZWQiLCJMYW5ndWFnZVByb3ZpZGVyIiwiY2hpbGRyZW4iLCJsYW5ndWFnZSIsInNldExhbmd1YWdlU3RhdGUiLCJ0cmFuc2xhdGlvbnMiLCJzZXRUcmFuc2xhdGlvbnMiLCJhbGxUcmFuc2xhdGlvbnMiLCJzZXRBbGxUcmFuc2xhdGlvbnMiLCJQUkVERUZJTkVEX1NVUFBPUlRFRF9MQU5HVUFHRVMiLCJmZXRjaFRyYW5zbGF0aW9ucyIsImVuUmVzIiwiZmV0Y2giLCJlbkRhdGEiLCJqc29uIiwiYXJSZXMiLCJhckRhdGEiLCJlbiIsImFyIiwiZXJyb3IiLCJjb25zb2xlIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJkaXIiLCJzZXRMYW5ndWFnZSIsImxhbmciLCJpbmNsdWRlcyIsIndhcm4iLCJ0Iiwia2V5IiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsIlByb3ZpZGVyIiwidmFsdWUiLCJ1c2VMYW5ndWFnZSIsImNvbnRleHQiLCJFcnJvciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./context/LanguageContext.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @chakra-ui/react */ \"@chakra-ui/react\");\n/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! wagmi */ \"wagmi\");\n/* harmony import */ var viem_chains__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! viem/chains */ \"viem/chains\");\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/router */ \"(pages-dir-node)/./node_modules/.pnpm/next@15.5.2_@babel+core@7.2_3e63eebb870b32cfa5803bfbaa08371a/node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var context_LanguageContext__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! context/LanguageContext */ \"(pages-dir-node)/./context/LanguageContext.tsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__, wagmi__WEBPACK_IMPORTED_MODULE_4__, viem_chains__WEBPACK_IMPORTED_MODULE_5__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__]);\n([_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__, wagmi__WEBPACK_IMPORTED_MODULE_4__, viem_chains__WEBPACK_IMPORTED_MODULE_5__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\n\n\n\n\nconst config = (0,wagmi__WEBPACK_IMPORTED_MODULE_4__.createConfig)({\n    chains: [\n        viem_chains__WEBPACK_IMPORTED_MODULE_5__.mainnet,\n        viem_chains__WEBPACK_IMPORTED_MODULE_5__.sepolia\n    ],\n    transports: {\n        [viem_chains__WEBPACK_IMPORTED_MODULE_5__.mainnet.id]: (0,wagmi__WEBPACK_IMPORTED_MODULE_4__.http)(),\n        [viem_chains__WEBPACK_IMPORTED_MODULE_5__.sepolia.id]: (0,wagmi__WEBPACK_IMPORTED_MODULE_4__.http)()\n    }\n});\nconst queryClient = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__.QueryClient({\n    defaultOptions: {\n        queries: {\n            refetchOnWindowFocus: false,\n            retry: false\n        }\n    }\n});\nconst theme = (0,_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__.extendTheme)({\n    config: {\n        initialColorMode: 'light',\n        useSystemColorMode: false\n    },\n    styles: {\n        global: {\n            body: {\n                bg: 'gray.50'\n            }\n        }\n    },\n    components: {\n        Button: {\n            defaultProps: {\n                colorScheme: 'red'\n            }\n        },\n        Toast: {\n            defaultProps: {\n                position: 'top',\n                isClosable: true,\n                duration: 3000\n            }\n        }\n    }\n});\nfunction App({ Component, pageProps }) {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_7__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"App.useEffect\": ()=>{\n            const handleRouteChange = {\n                \"App.useEffect.handleRouteChange\": (url)=>{\n                    console.log('Route changing to:', url);\n                }\n            }[\"App.useEffect.handleRouteChange\"];\n            const handleRouteChangeComplete = {\n                \"App.useEffect.handleRouteChangeComplete\": (url)=>{\n                    console.log('Route change completed:', url);\n                }\n            }[\"App.useEffect.handleRouteChangeComplete\"];\n            const handleRouteChangeError = {\n                \"App.useEffect.handleRouteChangeError\": (err, url)=>{\n                    console.error('Route change error:', {\n                        url,\n                        err\n                    });\n                }\n            }[\"App.useEffect.handleRouteChangeError\"];\n            router.events.on('routeChangeStart', handleRouteChange);\n            router.events.on('routeChangeComplete', handleRouteChangeComplete);\n            router.events.on('routeChangeError', handleRouteChangeError);\n            return ({\n                \"App.useEffect\": ()=>{\n                    router.events.off('routeChangeStart', handleRouteChange);\n                    router.events.off('routeChangeComplete', handleRouteChangeComplete);\n                    router.events.off('routeChangeError', handleRouteChangeError);\n                }\n            })[\"App.useEffect\"];\n        }\n    }[\"App.useEffect\"], [\n        router\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(context_LanguageContext__WEBPACK_IMPORTED_MODULE_8__.LanguageProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(context_LanguageContext__WEBPACK_IMPORTED_MODULE_8__.LanguageProvider, {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__.ChakraProvider, {\n                theme: theme,\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__.QueryClientProvider, {\n                    client: queryClient,\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(wagmi__WEBPACK_IMPORTED_MODULE_4__.WagmiProvider, {\n                        config: config,\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                            ...pageProps\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n                            lineNumber: 91,\n                            columnNumber: 11\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n                        lineNumber: 90,\n                        columnNumber: 9\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n                    lineNumber: 89,\n                    columnNumber: 7\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n                lineNumber: 88,\n                columnNumber: 5\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n            lineNumber: 87,\n            columnNumber: 5\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n        lineNumber: 86,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3BhZ2VzL19hcHAudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUF5QjtBQUNLO0FBRWdDO0FBQ3BCO0FBQ0k7QUFDMEI7QUFDbkM7QUFDRTtBQUNOO0FBQ3lCO0FBRTFELE1BQU1hLFNBQVNULG1EQUFZQSxDQUFDO0lBQzFCVSxRQUFRO1FBQUNULGdEQUFPQTtRQUFFQyxnREFBT0E7S0FBQztJQUMxQlMsWUFBWTtRQUNWLENBQUNWLGdEQUFPQSxDQUFDVyxFQUFFLENBQUMsRUFBRWIsMkNBQUlBO1FBQ2xCLENBQUNHLGdEQUFPQSxDQUFDVSxFQUFFLENBQUMsRUFBRWIsMkNBQUlBO0lBQ3BCO0FBQ0Y7QUFFQSxNQUFNYyxjQUFjLElBQUlWLDhEQUFXQSxDQUFDO0lBQ2xDVyxnQkFBZ0I7UUFDZEMsU0FBUztZQUNQQyxzQkFBc0I7WUFDdEJDLE9BQU87UUFDVDtJQUNGO0FBQ0Y7QUFFQSxNQUFNQyxRQUFRcEIsNkRBQVdBLENBQUM7SUFDeEJXLFFBQVE7UUFDTlUsa0JBQWtCO1FBQ2xCQyxvQkFBb0I7SUFDdEI7SUFDQUMsUUFBUTtRQUNOQyxRQUFRO1lBQ05DLE1BQU07Z0JBQ0pDLElBQUk7WUFDTjtRQUNGO0lBQ0Y7SUFDQUMsWUFBWTtRQUNWQyxRQUFRO1lBQ05DLGNBQWM7Z0JBQ1pDLGFBQWE7WUFDZjtRQUNGO1FBQ0FDLE9BQU87WUFDTEYsY0FBYztnQkFDWkcsVUFBVTtnQkFDVkMsWUFBWTtnQkFDWkMsVUFBVTtZQUNaO1FBQ0Y7SUFDRjtBQUNGO0FBRWUsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUM1RCxNQUFNQyxTQUFTOUIsc0RBQVNBO0lBRXhCQyxnREFBU0E7eUJBQUM7WUFDUixNQUFNOEI7bURBQW9CLENBQUNDO29CQUN6QkMsUUFBUUMsR0FBRyxDQUFDLHNCQUFzQkY7Z0JBQ3BDOztZQUVBLE1BQU1HOzJEQUE0QixDQUFDSDtvQkFDakNDLFFBQVFDLEdBQUcsQ0FBQywyQkFBMkJGO2dCQUN6Qzs7WUFFQSxNQUFNSTt3REFBeUIsQ0FBQ0MsS0FBVUw7b0JBQ3hDQyxRQUFRSyxLQUFLLENBQUMsdUJBQXVCO3dCQUFFTjt3QkFBS0s7b0JBQUk7Z0JBQ2xEOztZQUVBUCxPQUFPUyxNQUFNLENBQUNDLEVBQUUsQ0FBQyxvQkFBb0JUO1lBQ3JDRCxPQUFPUyxNQUFNLENBQUNDLEVBQUUsQ0FBQyx1QkFBdUJMO1lBQ3hDTCxPQUFPUyxNQUFNLENBQUNDLEVBQUUsQ0FBQyxvQkFBb0JKO1lBRXJDO2lDQUFPO29CQUNMTixPQUFPUyxNQUFNLENBQUNFLEdBQUcsQ0FBQyxvQkFBb0JWO29CQUN0Q0QsT0FBT1MsTUFBTSxDQUFDRSxHQUFHLENBQUMsdUJBQXVCTjtvQkFDekNMLE9BQU9TLE1BQU0sQ0FBQ0UsR0FBRyxDQUFDLG9CQUFvQkw7Z0JBQ3hDOztRQUNGO3dCQUFHO1FBQUNOO0tBQU87SUFFWCxxQkFDRSw4REFBQzVCLHFFQUFnQkE7a0JBQ2pCLDRFQUFDQSxxRUFBZ0JBO3NCQUNqQiw0RUFBQ1gsNERBQWNBO2dCQUFDcUIsT0FBT0E7MEJBQ3JCLDRFQUFDZCxzRUFBbUJBO29CQUFDNEMsUUFBUW5DOzhCQUMzQiw0RUFBQ1IsZ0RBQWFBO3dCQUFDSSxRQUFRQTtrQ0FDckIsNEVBQUN5Qjs0QkFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBT2xDIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXG9zYW1hXFxPbmVEcml2ZVxcRGVza3RvcFxcR3JhZHVhdGlvblxcZWR1Y2F0aW9uLWJsb2NrY2hhaW5cXHBhZ2VzXFxfYXBwLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXHJcbmltcG9ydCAnLi4vc3R5bGVzL2dsb2JhbHMuY3NzJ1xyXG5pbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnXHJcbmltcG9ydCB7IENoYWtyYVByb3ZpZGVyLCBleHRlbmRUaGVtZSB9IGZyb20gJ0BjaGFrcmEtdWkvcmVhY3QnXHJcbmltcG9ydCB7IGh0dHAsIGNyZWF0ZUNvbmZpZyB9IGZyb20gJ3dhZ21pJ1xyXG5pbXBvcnQgeyBtYWlubmV0LCBzZXBvbGlhIH0gZnJvbSAndmllbS9jaGFpbnMnXHJcbmltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J1xyXG5pbXBvcnQgeyBXYWdtaVByb3ZpZGVyIH0gZnJvbSAnd2FnbWknXHJcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJ1xyXG5pbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCdcclxuaW1wb3J0IHsgTGFuZ3VhZ2VQcm92aWRlciB9IGZyb20gJ2NvbnRleHQvTGFuZ3VhZ2VDb250ZXh0J1xyXG5cclxuY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnKHtcclxuICBjaGFpbnM6IFttYWlubmV0LCBzZXBvbGlhXSxcclxuICB0cmFuc3BvcnRzOiB7XHJcbiAgICBbbWFpbm5ldC5pZF06IGh0dHAoKSxcclxuICAgIFtzZXBvbGlhLmlkXTogaHR0cCgpXHJcbiAgfVxyXG59KVxyXG5cclxuY29uc3QgcXVlcnlDbGllbnQgPSBuZXcgUXVlcnlDbGllbnQoe1xyXG4gIGRlZmF1bHRPcHRpb25zOiB7XHJcbiAgICBxdWVyaWVzOiB7XHJcbiAgICAgIHJlZmV0Y2hPbldpbmRvd0ZvY3VzOiBmYWxzZSxcclxuICAgICAgcmV0cnk6IGZhbHNlXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG5cclxuY29uc3QgdGhlbWUgPSBleHRlbmRUaGVtZSh7XHJcbiAgY29uZmlnOiB7XHJcbiAgICBpbml0aWFsQ29sb3JNb2RlOiAnbGlnaHQnLFxyXG4gICAgdXNlU3lzdGVtQ29sb3JNb2RlOiBmYWxzZSxcclxuICB9LFxyXG4gIHN0eWxlczoge1xyXG4gICAgZ2xvYmFsOiB7XHJcbiAgICAgIGJvZHk6IHtcclxuICAgICAgICBiZzogJ2dyYXkuNTAnLFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBjb21wb25lbnRzOiB7XHJcbiAgICBCdXR0b246IHtcclxuICAgICAgZGVmYXVsdFByb3BzOiB7XHJcbiAgICAgICAgY29sb3JTY2hlbWU6ICdyZWQnLFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgVG9hc3Q6IHtcclxuICAgICAgZGVmYXVsdFByb3BzOiB7XHJcbiAgICAgICAgcG9zaXRpb246ICd0b3AnLFxyXG4gICAgICAgIGlzQ2xvc2FibGU6IHRydWUsXHJcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xyXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpXHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBoYW5kbGVSb3V0ZUNoYW5nZSA9ICh1cmw6IHN0cmluZykgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnUm91dGUgY2hhbmdpbmcgdG86JywgdXJsKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhbmRsZVJvdXRlQ2hhbmdlQ29tcGxldGUgPSAodXJsOiBzdHJpbmcpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ1JvdXRlIGNoYW5nZSBjb21wbGV0ZWQ6JywgdXJsKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhbmRsZVJvdXRlQ2hhbmdlRXJyb3IgPSAoZXJyOiBhbnksIHVybDogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JvdXRlIGNoYW5nZSBlcnJvcjonLCB7IHVybCwgZXJyIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcm91dGVyLmV2ZW50cy5vbigncm91dGVDaGFuZ2VTdGFydCcsIGhhbmRsZVJvdXRlQ2hhbmdlKVxyXG4gICAgcm91dGVyLmV2ZW50cy5vbigncm91dGVDaGFuZ2VDb21wbGV0ZScsIGhhbmRsZVJvdXRlQ2hhbmdlQ29tcGxldGUpXHJcbiAgICByb3V0ZXIuZXZlbnRzLm9uKCdyb3V0ZUNoYW5nZUVycm9yJywgaGFuZGxlUm91dGVDaGFuZ2VFcnJvcilcclxuXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICByb3V0ZXIuZXZlbnRzLm9mZigncm91dGVDaGFuZ2VTdGFydCcsIGhhbmRsZVJvdXRlQ2hhbmdlKVxyXG4gICAgICByb3V0ZXIuZXZlbnRzLm9mZigncm91dGVDaGFuZ2VDb21wbGV0ZScsIGhhbmRsZVJvdXRlQ2hhbmdlQ29tcGxldGUpXHJcbiAgICAgIHJvdXRlci5ldmVudHMub2ZmKCdyb3V0ZUNoYW5nZUVycm9yJywgaGFuZGxlUm91dGVDaGFuZ2VFcnJvcilcclxuICAgIH1cclxuICB9LCBbcm91dGVyXSlcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxMYW5ndWFnZVByb3ZpZGVyPlxyXG4gICAgPExhbmd1YWdlUHJvdmlkZXI+XHJcbiAgICA8Q2hha3JhUHJvdmlkZXIgdGhlbWU9e3RoZW1lfT5cclxuICAgICAgPFF1ZXJ5Q2xpZW50UHJvdmlkZXIgY2xpZW50PXtxdWVyeUNsaWVudH0+XHJcbiAgICAgICAgPFdhZ21pUHJvdmlkZXIgY29uZmlnPXtjb25maWd9PlxyXG4gICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgICAgIDwvV2FnbWlQcm92aWRlcj5cclxuICAgICAgPC9RdWVyeUNsaWVudFByb3ZpZGVyPlxyXG4gICAgPC9DaGFrcmFQcm92aWRlcj5cclxuICAgIDwvTGFuZ3VhZ2VQcm92aWRlcj5cclxuICAgIDwvTGFuZ3VhZ2VQcm92aWRlcj5cclxuICApXHJcbn0gIl0sIm5hbWVzIjpbIlJlYWN0IiwiQ2hha3JhUHJvdmlkZXIiLCJleHRlbmRUaGVtZSIsImh0dHAiLCJjcmVhdGVDb25maWciLCJtYWlubmV0Iiwic2Vwb2xpYSIsIlF1ZXJ5Q2xpZW50IiwiUXVlcnlDbGllbnRQcm92aWRlciIsIldhZ21pUHJvdmlkZXIiLCJ1c2VSb3V0ZXIiLCJ1c2VFZmZlY3QiLCJMYW5ndWFnZVByb3ZpZGVyIiwiY29uZmlnIiwiY2hhaW5zIiwidHJhbnNwb3J0cyIsImlkIiwicXVlcnlDbGllbnQiLCJkZWZhdWx0T3B0aW9ucyIsInF1ZXJpZXMiLCJyZWZldGNoT25XaW5kb3dGb2N1cyIsInJldHJ5IiwidGhlbWUiLCJpbml0aWFsQ29sb3JNb2RlIiwidXNlU3lzdGVtQ29sb3JNb2RlIiwic3R5bGVzIiwiZ2xvYmFsIiwiYm9keSIsImJnIiwiY29tcG9uZW50cyIsIkJ1dHRvbiIsImRlZmF1bHRQcm9wcyIsImNvbG9yU2NoZW1lIiwiVG9hc3QiLCJwb3NpdGlvbiIsImlzQ2xvc2FibGUiLCJkdXJhdGlvbiIsIkFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsInJvdXRlciIsImhhbmRsZVJvdXRlQ2hhbmdlIiwidXJsIiwiY29uc29sZSIsImxvZyIsImhhbmRsZVJvdXRlQ2hhbmdlQ29tcGxldGUiLCJoYW5kbGVSb3V0ZUNoYW5nZUVycm9yIiwiZXJyIiwiZXJyb3IiLCJldmVudHMiLCJvbiIsIm9mZiIsImNsaWVudCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./pages/_app.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "@chakra-ui/react":
/*!***********************************!*\
  !*** external "@chakra-ui/react" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = import("@chakra-ui/react");;

/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@tanstack/react-query");;

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "viem/chains":
/*!******************************!*\
  !*** external "viem/chains" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = import("viem/chains");;

/***/ }),

/***/ "wagmi":
/*!************************!*\
  !*** external "wagmi" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = import("wagmi");;

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@15.5.2_@babel+core@7.2_3e63eebb870b32cfa5803bfbaa08371a","vendor-chunks/@swc+helpers@0.5.15"], () => (__webpack_exec__("(pages-dir-node)/./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();