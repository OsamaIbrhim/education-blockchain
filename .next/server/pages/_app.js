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

/***/ "./context/LanguageContext.tsx":
/*!*************************************!*\
  !*** ./context/LanguageContext.tsx ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   LanguageProvider: () => (/* binding */ LanguageProvider),\n/* harmony export */   useLanguage: () => (/* binding */ useLanguage)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst LanguageContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nconst LanguageProvider = ({ children })=>{\n    const [language, setLanguageState] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"en\");\n    const [translations, setTranslations] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({});\n    const [allTranslations, setAllTranslations] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({});\n    // Define supported languages based on your i18n files\n    // This could also be derived or managed more dynamically if needed.\n    const PREDEFINED_SUPPORTED_LANGUAGES = [\n        \"en\",\n        \"ar\"\n    ];\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const fetchTranslations = async ()=>{\n            try {\n                const enRes = await fetch(\"/i18n/en.json\");\n                const enData = await enRes.json();\n                const arRes = await fetch(\"/i18n/ar.json\");\n                const arData = await arRes.json();\n                setAllTranslations({\n                    en: enData,\n                    ar: arData\n                });\n            // Removed: setTranslations(enData); // Default to English\n            // The useEffect below will handle setting translations based on the current language\n            } catch (error) {\n                console.error(\"Failed to load translations:\", error);\n                setAllTranslations({\n                    en: {},\n                    ar: {}\n                });\n                setTranslations({});\n            }\n        };\n        fetchTranslations();\n    }, []);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (language === \"ar\") {\n            document.documentElement.dir = \"rtl\";\n        } else {\n            document.documentElement.dir = \"ltr\";\n        }\n        setTranslations(allTranslations[language] || {});\n    }, [\n        language,\n        allTranslations\n    ]);\n    const setLanguage = (lang)=>{\n        // Validate against the predefined list of supported languages\n        if (PREDEFINED_SUPPORTED_LANGUAGES.includes(lang)) {\n            setLanguageState(lang);\n        } else {\n            console.warn(`Attempted to set unsupported language: '\\${lang}'. Defaulting to '\\${PREDEFINED_SUPPORTED_LANGUAGES[0] || 'en'}'.`);\n            // Default to the first supported language or 'en' as a fallback\n            setLanguageState(PREDEFINED_SUPPORTED_LANGUAGES[0] || \"en\");\n        }\n    };\n    const t = (key)=>{\n        if (!translations || Object.keys(translations).length === 0) return \"...\";\n        return translations[key] || key;\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(LanguageContext.Provider, {\n        value: {\n            language,\n            setLanguage,\n            translations,\n            t\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\context\\\\LanguageContext.tsx\",\n        lineNumber: 70,\n        columnNumber: 5\n    }, undefined);\n};\nconst useLanguage = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(LanguageContext);\n    if (!context) {\n        throw new Error(\"useLanguage must be used within a LanguageProvider\");\n    }\n    return context;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb250ZXh0L0xhbmd1YWdlQ29udGV4dC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUF5RjtBQWF6RixNQUFNSyxnQ0FBa0JKLG9EQUFhQSxDQUFrQ0s7QUFFaEUsTUFBTUMsbUJBQXNELENBQUMsRUFBRUMsUUFBUSxFQUFFO0lBQzlFLE1BQU0sQ0FBQ0MsVUFBVUMsaUJBQWlCLEdBQUdSLCtDQUFRQSxDQUFTO0lBQ3RELE1BQU0sQ0FBQ1MsY0FBY0MsZ0JBQWdCLEdBQUdWLCtDQUFRQSxDQUFlLENBQUM7SUFDaEUsTUFBTSxDQUFDVyxpQkFBaUJDLG1CQUFtQixHQUFHWiwrQ0FBUUEsQ0FBbUMsQ0FBQztJQUUxRixzREFBc0Q7SUFDdEQsb0VBQW9FO0lBQ3BFLE1BQU1hLGlDQUFpQztRQUFDO1FBQU07S0FBSztJQUVuRFosZ0RBQVNBLENBQUM7UUFDUixNQUFNYSxvQkFBb0I7WUFDeEIsSUFBSTtnQkFDRixNQUFNQyxRQUFRLE1BQU1DLE1BQU07Z0JBQzFCLE1BQU1DLFNBQVMsTUFBTUYsTUFBTUcsSUFBSTtnQkFDL0IsTUFBTUMsUUFBUSxNQUFNSCxNQUFNO2dCQUMxQixNQUFNSSxTQUFTLE1BQU1ELE1BQU1ELElBQUk7Z0JBQy9CTixtQkFBbUI7b0JBQUVTLElBQUlKO29CQUFRSyxJQUFJRjtnQkFBTztZQUM1QywwREFBMEQ7WUFDMUQscUZBQXFGO1lBQ3ZGLEVBQUUsT0FBT0csT0FBTztnQkFDZEMsUUFBUUQsS0FBSyxDQUFDLGdDQUFnQ0E7Z0JBQzlDWCxtQkFBbUI7b0JBQUVTLElBQUksQ0FBQztvQkFBR0MsSUFBSSxDQUFDO2dCQUFFO2dCQUNwQ1osZ0JBQWdCLENBQUM7WUFDbkI7UUFDRjtRQUNBSTtJQUNGLEdBQUcsRUFBRTtJQUVMYixnREFBU0EsQ0FBQztRQUNSLElBQUlNLGFBQWEsTUFBTTtZQUNyQmtCLFNBQVNDLGVBQWUsQ0FBQ0MsR0FBRyxHQUFHO1FBQ2pDLE9BQU87WUFDTEYsU0FBU0MsZUFBZSxDQUFDQyxHQUFHLEdBQUc7UUFDakM7UUFDQWpCLGdCQUFnQkMsZUFBZSxDQUFDSixTQUFTLElBQUksQ0FBQztJQUNoRCxHQUFHO1FBQUNBO1FBQVVJO0tBQWdCO0lBRTlCLE1BQU1pQixjQUFjLENBQUNDO1FBQ25CLDhEQUE4RDtRQUM5RCxJQUFJaEIsK0JBQStCaUIsUUFBUSxDQUFDRCxPQUFPO1lBQ2pEckIsaUJBQWlCcUI7UUFDbkIsT0FBTztZQUNMTCxRQUFRTyxJQUFJLENBQUMsQ0FBQyxpSEFBaUgsQ0FBQztZQUNoSSxnRUFBZ0U7WUFDaEV2QixpQkFBaUJLLDhCQUE4QixDQUFDLEVBQUUsSUFBSTtRQUN4RDtJQUNGO0lBRUEsTUFBTW1CLElBQUksQ0FBQ0M7UUFDVCxJQUFJLENBQUN4QixnQkFBZ0J5QixPQUFPQyxJQUFJLENBQUMxQixjQUFjMkIsTUFBTSxLQUFLLEdBQUcsT0FBTztRQUNwRSxPQUFPM0IsWUFBWSxDQUFDd0IsSUFBSSxJQUFJQTtJQUM5QjtJQUVBLHFCQUNFLDhEQUFDOUIsZ0JBQWdCa0MsUUFBUTtRQUFDQyxPQUFPO1lBQUUvQjtZQUFVcUI7WUFBYW5CO1lBQWN1QjtRQUFFO2tCQUN2RTFCOzs7Ozs7QUFHUCxFQUFFO0FBRUssTUFBTWlDLGNBQWM7SUFDekIsTUFBTUMsVUFBVXRDLGlEQUFVQSxDQUFDQztJQUMzQixJQUFJLENBQUNxQyxTQUFTO1FBQ1osTUFBTSxJQUFJQyxNQUFNO0lBQ2xCO0lBQ0EsT0FBT0Q7QUFDVCxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWR1Y2F0aW9uLWJsb2NrY2hhaW4vLi9jb250ZXh0L0xhbmd1YWdlQ29udGV4dC50c3g/YTc3OSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgY3JlYXRlQ29udGV4dCwgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ29udGV4dCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xyXG5cclxuaW50ZXJmYWNlIFRyYW5zbGF0aW9ucyB7XHJcbiAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgTGFuZ3VhZ2VDb250ZXh0VHlwZSB7XHJcbiAgbGFuZ3VhZ2U6IHN0cmluZztcclxuICBzZXRMYW5ndWFnZTogKGxhbmd1YWdlOiBzdHJpbmcpID0+IHZvaWQ7XHJcbiAgdHJhbnNsYXRpb25zOiBUcmFuc2xhdGlvbnM7XHJcbiAgdDogKGtleTogc3RyaW5nKSA9PiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IExhbmd1YWdlQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8TGFuZ3VhZ2VDb250ZXh0VHlwZSB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcclxuXHJcbmV4cG9ydCBjb25zdCBMYW5ndWFnZVByb3ZpZGVyOiBSZWFjdC5GQzx7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfT4gPSAoeyBjaGlsZHJlbiB9KSA9PiB7XHJcbiAgY29uc3QgW2xhbmd1YWdlLCBzZXRMYW5ndWFnZVN0YXRlXSA9IHVzZVN0YXRlPHN0cmluZz4oJ2VuJyk7XHJcbiAgY29uc3QgW3RyYW5zbGF0aW9ucywgc2V0VHJhbnNsYXRpb25zXSA9IHVzZVN0YXRlPFRyYW5zbGF0aW9ucz4oe30pO1xyXG4gIGNvbnN0IFthbGxUcmFuc2xhdGlvbnMsIHNldEFsbFRyYW5zbGF0aW9uc10gPSB1c2VTdGF0ZTx7IFtsYW5nOiBzdHJpbmddOiBUcmFuc2xhdGlvbnMgfT4oe30pO1xyXG5cclxuICAvLyBEZWZpbmUgc3VwcG9ydGVkIGxhbmd1YWdlcyBiYXNlZCBvbiB5b3VyIGkxOG4gZmlsZXNcclxuICAvLyBUaGlzIGNvdWxkIGFsc28gYmUgZGVyaXZlZCBvciBtYW5hZ2VkIG1vcmUgZHluYW1pY2FsbHkgaWYgbmVlZGVkLlxyXG4gIGNvbnN0IFBSRURFRklORURfU1VQUE9SVEVEX0xBTkdVQUdFUyA9IFsnZW4nLCAnYXInXTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IGZldGNoVHJhbnNsYXRpb25zID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGVuUmVzID0gYXdhaXQgZmV0Y2goJy9pMThuL2VuLmpzb24nKTtcclxuICAgICAgICBjb25zdCBlbkRhdGEgPSBhd2FpdCBlblJlcy5qc29uKCk7XHJcbiAgICAgICAgY29uc3QgYXJSZXMgPSBhd2FpdCBmZXRjaCgnL2kxOG4vYXIuanNvbicpO1xyXG4gICAgICAgIGNvbnN0IGFyRGF0YSA9IGF3YWl0IGFyUmVzLmpzb24oKTtcclxuICAgICAgICBzZXRBbGxUcmFuc2xhdGlvbnMoeyBlbjogZW5EYXRhLCBhcjogYXJEYXRhIH0pO1xyXG4gICAgICAgIC8vIFJlbW92ZWQ6IHNldFRyYW5zbGF0aW9ucyhlbkRhdGEpOyAvLyBEZWZhdWx0IHRvIEVuZ2xpc2hcclxuICAgICAgICAvLyBUaGUgdXNlRWZmZWN0IGJlbG93IHdpbGwgaGFuZGxlIHNldHRpbmcgdHJhbnNsYXRpb25zIGJhc2VkIG9uIHRoZSBjdXJyZW50IGxhbmd1YWdlXHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgdHJhbnNsYXRpb25zOicsIGVycm9yKTtcclxuICAgICAgICBzZXRBbGxUcmFuc2xhdGlvbnMoeyBlbjoge30sIGFyOiB7fSB9KTtcclxuICAgICAgICBzZXRUcmFuc2xhdGlvbnMoe30pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgZmV0Y2hUcmFuc2xhdGlvbnMoKTtcclxuICB9LCBbXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAobGFuZ3VhZ2UgPT09ICdhcicpIHtcclxuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRpciA9ICdydGwnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRpciA9ICdsdHInO1xyXG4gICAgfVxyXG4gICAgc2V0VHJhbnNsYXRpb25zKGFsbFRyYW5zbGF0aW9uc1tsYW5ndWFnZV0gfHwge30pO1xyXG4gIH0sIFtsYW5ndWFnZSwgYWxsVHJhbnNsYXRpb25zXSk7XHJcblxyXG4gIGNvbnN0IHNldExhbmd1YWdlID0gKGxhbmc6IHN0cmluZykgPT4ge1xyXG4gICAgLy8gVmFsaWRhdGUgYWdhaW5zdCB0aGUgcHJlZGVmaW5lZCBsaXN0IG9mIHN1cHBvcnRlZCBsYW5ndWFnZXNcclxuICAgIGlmIChQUkVERUZJTkVEX1NVUFBPUlRFRF9MQU5HVUFHRVMuaW5jbHVkZXMobGFuZykpIHtcclxuICAgICAgc2V0TGFuZ3VhZ2VTdGF0ZShsYW5nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihgQXR0ZW1wdGVkIHRvIHNldCB1bnN1cHBvcnRlZCBsYW5ndWFnZTogJ1xcJHtsYW5nfScuIERlZmF1bHRpbmcgdG8gJ1xcJHtQUkVERUZJTkVEX1NVUFBPUlRFRF9MQU5HVUFHRVNbMF0gfHwgJ2VuJ30nLmApO1xyXG4gICAgICAvLyBEZWZhdWx0IHRvIHRoZSBmaXJzdCBzdXBwb3J0ZWQgbGFuZ3VhZ2Ugb3IgJ2VuJyBhcyBhIGZhbGxiYWNrXHJcbiAgICAgIHNldExhbmd1YWdlU3RhdGUoUFJFREVGSU5FRF9TVVBQT1JURURfTEFOR1VBR0VTWzBdIHx8ICdlbicpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHQgPSAoa2V5OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgaWYgKCF0cmFuc2xhdGlvbnMgfHwgT2JqZWN0LmtleXModHJhbnNsYXRpb25zKS5sZW5ndGggPT09IDApIHJldHVybiAnLi4uJztcclxuICAgIHJldHVybiB0cmFuc2xhdGlvbnNba2V5XSB8fCBrZXk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxMYW5ndWFnZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgbGFuZ3VhZ2UsIHNldExhbmd1YWdlLCB0cmFuc2xhdGlvbnMsIHQgfX0+XHJcbiAgICAgIHtjaGlsZHJlbn1cclxuICAgIDwvTGFuZ3VhZ2VDb250ZXh0LlByb3ZpZGVyPlxyXG4gICk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdXNlTGFuZ3VhZ2UgPSAoKTogTGFuZ3VhZ2VDb250ZXh0VHlwZSA9PiB7XHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoTGFuZ3VhZ2VDb250ZXh0KTtcclxuICBpZiAoIWNvbnRleHQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigndXNlTGFuZ3VhZ2UgbXVzdCBiZSB1c2VkIHdpdGhpbiBhIExhbmd1YWdlUHJvdmlkZXInKTtcclxuICB9XHJcbiAgcmV0dXJuIGNvbnRleHQ7XHJcbn07Il0sIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlQ29udGV4dCIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlQ29udGV4dCIsIkxhbmd1YWdlQ29udGV4dCIsInVuZGVmaW5lZCIsIkxhbmd1YWdlUHJvdmlkZXIiLCJjaGlsZHJlbiIsImxhbmd1YWdlIiwic2V0TGFuZ3VhZ2VTdGF0ZSIsInRyYW5zbGF0aW9ucyIsInNldFRyYW5zbGF0aW9ucyIsImFsbFRyYW5zbGF0aW9ucyIsInNldEFsbFRyYW5zbGF0aW9ucyIsIlBSRURFRklORURfU1VQUE9SVEVEX0xBTkdVQUdFUyIsImZldGNoVHJhbnNsYXRpb25zIiwiZW5SZXMiLCJmZXRjaCIsImVuRGF0YSIsImpzb24iLCJhclJlcyIsImFyRGF0YSIsImVuIiwiYXIiLCJlcnJvciIsImNvbnNvbGUiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImRpciIsInNldExhbmd1YWdlIiwibGFuZyIsImluY2x1ZGVzIiwid2FybiIsInQiLCJrZXkiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiUHJvdmlkZXIiLCJ2YWx1ZSIsInVzZUxhbmd1YWdlIiwiY29udGV4dCIsIkVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./context/LanguageContext.tsx\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @chakra-ui/react */ \"@chakra-ui/react\");\n/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! wagmi */ \"wagmi\");\n/* harmony import */ var viem_chains__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! viem/chains */ \"viem/chains\");\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/router */ \"./node_modules/.pnpm/next@14.2.27_@babel+core@7._a83636c527cd4a5cf205a1e55d47933a/node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var context_LanguageContext__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! context/LanguageContext */ \"./context/LanguageContext.tsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__, wagmi__WEBPACK_IMPORTED_MODULE_4__, viem_chains__WEBPACK_IMPORTED_MODULE_5__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__]);\n([_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__, wagmi__WEBPACK_IMPORTED_MODULE_4__, viem_chains__WEBPACK_IMPORTED_MODULE_5__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\n\n\n\n\nconst config = (0,wagmi__WEBPACK_IMPORTED_MODULE_4__.createConfig)({\n    chains: [\n        viem_chains__WEBPACK_IMPORTED_MODULE_5__.mainnet,\n        viem_chains__WEBPACK_IMPORTED_MODULE_5__.sepolia\n    ],\n    transports: {\n        [viem_chains__WEBPACK_IMPORTED_MODULE_5__.mainnet.id]: (0,wagmi__WEBPACK_IMPORTED_MODULE_4__.http)(),\n        [viem_chains__WEBPACK_IMPORTED_MODULE_5__.sepolia.id]: (0,wagmi__WEBPACK_IMPORTED_MODULE_4__.http)()\n    }\n});\nconst queryClient = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__.QueryClient({\n    defaultOptions: {\n        queries: {\n            refetchOnWindowFocus: false,\n            retry: false\n        }\n    }\n});\nconst theme = (0,_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__.extendTheme)({\n    config: {\n        initialColorMode: \"light\",\n        useSystemColorMode: false\n    },\n    styles: {\n        global: {\n            body: {\n                bg: \"gray.50\"\n            }\n        }\n    },\n    components: {\n        Button: {\n            defaultProps: {\n                colorScheme: \"red\"\n            }\n        },\n        Toast: {\n            defaultProps: {\n                position: \"top\",\n                isClosable: true,\n                duration: 3000\n            }\n        }\n    }\n});\nfunction App({ Component, pageProps }) {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_7__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const handleRouteChange = (url)=>{\n            console.log(\"Route changing to:\", url);\n        };\n        const handleRouteChangeComplete = (url)=>{\n            console.log(\"Route change completed:\", url);\n        };\n        const handleRouteChangeError = (err, url)=>{\n            console.error(\"Route change error:\", {\n                url,\n                err\n            });\n        };\n        router.events.on(\"routeChangeStart\", handleRouteChange);\n        router.events.on(\"routeChangeComplete\", handleRouteChangeComplete);\n        router.events.on(\"routeChangeError\", handleRouteChangeError);\n        return ()=>{\n            router.events.off(\"routeChangeStart\", handleRouteChange);\n            router.events.off(\"routeChangeComplete\", handleRouteChangeComplete);\n            router.events.off(\"routeChangeError\", handleRouteChangeError);\n        };\n    }, [\n        router\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(context_LanguageContext__WEBPACK_IMPORTED_MODULE_8__.LanguageProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(context_LanguageContext__WEBPACK_IMPORTED_MODULE_8__.LanguageProvider, {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__.ChakraProvider, {\n                theme: theme,\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__.QueryClientProvider, {\n                    client: queryClient,\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(wagmi__WEBPACK_IMPORTED_MODULE_4__.WagmiProvider, {\n                        config: config,\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                            ...pageProps\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n                            lineNumber: 91,\n                            columnNumber: 11\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n                        lineNumber: 90,\n                        columnNumber: 9\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n                    lineNumber: 89,\n                    columnNumber: 7\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n                lineNumber: 88,\n                columnNumber: 5\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n            lineNumber: 87,\n            columnNumber: 5\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education-blockchain\\\\pages\\\\_app.tsx\",\n        lineNumber: 86,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBeUI7QUFDSztBQUVnQztBQUNwQjtBQUNJO0FBQzBCO0FBQ25DO0FBQ0U7QUFDTjtBQUN5QjtBQUUxRCxNQUFNYSxTQUFTVCxtREFBWUEsQ0FBQztJQUMxQlUsUUFBUTtRQUFDVCxnREFBT0E7UUFBRUMsZ0RBQU9BO0tBQUM7SUFDMUJTLFlBQVk7UUFDVixDQUFDVixnREFBT0EsQ0FBQ1csRUFBRSxDQUFDLEVBQUViLDJDQUFJQTtRQUNsQixDQUFDRyxnREFBT0EsQ0FBQ1UsRUFBRSxDQUFDLEVBQUViLDJDQUFJQTtJQUNwQjtBQUNGO0FBRUEsTUFBTWMsY0FBYyxJQUFJViw4REFBV0EsQ0FBQztJQUNsQ1csZ0JBQWdCO1FBQ2RDLFNBQVM7WUFDUEMsc0JBQXNCO1lBQ3RCQyxPQUFPO1FBQ1Q7SUFDRjtBQUNGO0FBRUEsTUFBTUMsUUFBUXBCLDZEQUFXQSxDQUFDO0lBQ3hCVyxRQUFRO1FBQ05VLGtCQUFrQjtRQUNsQkMsb0JBQW9CO0lBQ3RCO0lBQ0FDLFFBQVE7UUFDTkMsUUFBUTtZQUNOQyxNQUFNO2dCQUNKQyxJQUFJO1lBQ047UUFDRjtJQUNGO0lBQ0FDLFlBQVk7UUFDVkMsUUFBUTtZQUNOQyxjQUFjO2dCQUNaQyxhQUFhO1lBQ2Y7UUFDRjtRQUNBQyxPQUFPO1lBQ0xGLGNBQWM7Z0JBQ1pHLFVBQVU7Z0JBQ1ZDLFlBQVk7Z0JBQ1pDLFVBQVU7WUFDWjtRQUNGO0lBQ0Y7QUFDRjtBQUVlLFNBQVNDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDNUQsTUFBTUMsU0FBUzlCLHNEQUFTQTtJQUV4QkMsZ0RBQVNBLENBQUM7UUFDUixNQUFNOEIsb0JBQW9CLENBQUNDO1lBQ3pCQyxRQUFRQyxHQUFHLENBQUMsc0JBQXNCRjtRQUNwQztRQUVBLE1BQU1HLDRCQUE0QixDQUFDSDtZQUNqQ0MsUUFBUUMsR0FBRyxDQUFDLDJCQUEyQkY7UUFDekM7UUFFQSxNQUFNSSx5QkFBeUIsQ0FBQ0MsS0FBVUw7WUFDeENDLFFBQVFLLEtBQUssQ0FBQyx1QkFBdUI7Z0JBQUVOO2dCQUFLSztZQUFJO1FBQ2xEO1FBRUFQLE9BQU9TLE1BQU0sQ0FBQ0MsRUFBRSxDQUFDLG9CQUFvQlQ7UUFDckNELE9BQU9TLE1BQU0sQ0FBQ0MsRUFBRSxDQUFDLHVCQUF1Qkw7UUFDeENMLE9BQU9TLE1BQU0sQ0FBQ0MsRUFBRSxDQUFDLG9CQUFvQko7UUFFckMsT0FBTztZQUNMTixPQUFPUyxNQUFNLENBQUNFLEdBQUcsQ0FBQyxvQkFBb0JWO1lBQ3RDRCxPQUFPUyxNQUFNLENBQUNFLEdBQUcsQ0FBQyx1QkFBdUJOO1lBQ3pDTCxPQUFPUyxNQUFNLENBQUNFLEdBQUcsQ0FBQyxvQkFBb0JMO1FBQ3hDO0lBQ0YsR0FBRztRQUFDTjtLQUFPO0lBRVgscUJBQ0UsOERBQUM1QixxRUFBZ0JBO2tCQUNqQiw0RUFBQ0EscUVBQWdCQTtzQkFDakIsNEVBQUNYLDREQUFjQTtnQkFBQ3FCLE9BQU9BOzBCQUNyQiw0RUFBQ2Qsc0VBQW1CQTtvQkFBQzRDLFFBQVFuQzs4QkFDM0IsNEVBQUNSLGdEQUFhQTt3QkFBQ0ksUUFBUUE7a0NBQ3JCLDRFQUFDeUI7NEJBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU9sQyIsInNvdXJjZXMiOlsid2VicGFjazovL2VkdWNhdGlvbi1ibG9ja2NoYWluLy4vcGFnZXMvX2FwcC50c3g/MmZiZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXHJcbmltcG9ydCAnLi4vc3R5bGVzL2dsb2JhbHMuY3NzJ1xyXG5pbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnXHJcbmltcG9ydCB7IENoYWtyYVByb3ZpZGVyLCBleHRlbmRUaGVtZSB9IGZyb20gJ0BjaGFrcmEtdWkvcmVhY3QnXHJcbmltcG9ydCB7IGh0dHAsIGNyZWF0ZUNvbmZpZyB9IGZyb20gJ3dhZ21pJ1xyXG5pbXBvcnQgeyBtYWlubmV0LCBzZXBvbGlhIH0gZnJvbSAndmllbS9jaGFpbnMnXHJcbmltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J1xyXG5pbXBvcnQgeyBXYWdtaVByb3ZpZGVyIH0gZnJvbSAnd2FnbWknXHJcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJ1xyXG5pbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCdcclxuaW1wb3J0IHsgTGFuZ3VhZ2VQcm92aWRlciB9IGZyb20gJ2NvbnRleHQvTGFuZ3VhZ2VDb250ZXh0J1xyXG5cclxuY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnKHtcclxuICBjaGFpbnM6IFttYWlubmV0LCBzZXBvbGlhXSxcclxuICB0cmFuc3BvcnRzOiB7XHJcbiAgICBbbWFpbm5ldC5pZF06IGh0dHAoKSxcclxuICAgIFtzZXBvbGlhLmlkXTogaHR0cCgpXHJcbiAgfVxyXG59KVxyXG5cclxuY29uc3QgcXVlcnlDbGllbnQgPSBuZXcgUXVlcnlDbGllbnQoe1xyXG4gIGRlZmF1bHRPcHRpb25zOiB7XHJcbiAgICBxdWVyaWVzOiB7XHJcbiAgICAgIHJlZmV0Y2hPbldpbmRvd0ZvY3VzOiBmYWxzZSxcclxuICAgICAgcmV0cnk6IGZhbHNlXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG5cclxuY29uc3QgdGhlbWUgPSBleHRlbmRUaGVtZSh7XHJcbiAgY29uZmlnOiB7XHJcbiAgICBpbml0aWFsQ29sb3JNb2RlOiAnbGlnaHQnLFxyXG4gICAgdXNlU3lzdGVtQ29sb3JNb2RlOiBmYWxzZSxcclxuICB9LFxyXG4gIHN0eWxlczoge1xyXG4gICAgZ2xvYmFsOiB7XHJcbiAgICAgIGJvZHk6IHtcclxuICAgICAgICBiZzogJ2dyYXkuNTAnLFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBjb21wb25lbnRzOiB7XHJcbiAgICBCdXR0b246IHtcclxuICAgICAgZGVmYXVsdFByb3BzOiB7XHJcbiAgICAgICAgY29sb3JTY2hlbWU6ICdyZWQnLFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgVG9hc3Q6IHtcclxuICAgICAgZGVmYXVsdFByb3BzOiB7XHJcbiAgICAgICAgcG9zaXRpb246ICd0b3AnLFxyXG4gICAgICAgIGlzQ2xvc2FibGU6IHRydWUsXHJcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xyXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpXHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBoYW5kbGVSb3V0ZUNoYW5nZSA9ICh1cmw6IHN0cmluZykgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnUm91dGUgY2hhbmdpbmcgdG86JywgdXJsKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhbmRsZVJvdXRlQ2hhbmdlQ29tcGxldGUgPSAodXJsOiBzdHJpbmcpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ1JvdXRlIGNoYW5nZSBjb21wbGV0ZWQ6JywgdXJsKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhbmRsZVJvdXRlQ2hhbmdlRXJyb3IgPSAoZXJyOiBhbnksIHVybDogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JvdXRlIGNoYW5nZSBlcnJvcjonLCB7IHVybCwgZXJyIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcm91dGVyLmV2ZW50cy5vbigncm91dGVDaGFuZ2VTdGFydCcsIGhhbmRsZVJvdXRlQ2hhbmdlKVxyXG4gICAgcm91dGVyLmV2ZW50cy5vbigncm91dGVDaGFuZ2VDb21wbGV0ZScsIGhhbmRsZVJvdXRlQ2hhbmdlQ29tcGxldGUpXHJcbiAgICByb3V0ZXIuZXZlbnRzLm9uKCdyb3V0ZUNoYW5nZUVycm9yJywgaGFuZGxlUm91dGVDaGFuZ2VFcnJvcilcclxuXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICByb3V0ZXIuZXZlbnRzLm9mZigncm91dGVDaGFuZ2VTdGFydCcsIGhhbmRsZVJvdXRlQ2hhbmdlKVxyXG4gICAgICByb3V0ZXIuZXZlbnRzLm9mZigncm91dGVDaGFuZ2VDb21wbGV0ZScsIGhhbmRsZVJvdXRlQ2hhbmdlQ29tcGxldGUpXHJcbiAgICAgIHJvdXRlci5ldmVudHMub2ZmKCdyb3V0ZUNoYW5nZUVycm9yJywgaGFuZGxlUm91dGVDaGFuZ2VFcnJvcilcclxuICAgIH1cclxuICB9LCBbcm91dGVyXSlcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxMYW5ndWFnZVByb3ZpZGVyPlxyXG4gICAgPExhbmd1YWdlUHJvdmlkZXI+XHJcbiAgICA8Q2hha3JhUHJvdmlkZXIgdGhlbWU9e3RoZW1lfT5cclxuICAgICAgPFF1ZXJ5Q2xpZW50UHJvdmlkZXIgY2xpZW50PXtxdWVyeUNsaWVudH0+XHJcbiAgICAgICAgPFdhZ21pUHJvdmlkZXIgY29uZmlnPXtjb25maWd9PlxyXG4gICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgICAgIDwvV2FnbWlQcm92aWRlcj5cclxuICAgICAgPC9RdWVyeUNsaWVudFByb3ZpZGVyPlxyXG4gICAgPC9DaGFrcmFQcm92aWRlcj5cclxuICAgIDwvTGFuZ3VhZ2VQcm92aWRlcj5cclxuICAgIDwvTGFuZ3VhZ2VQcm92aWRlcj5cclxuICApXHJcbn0gIl0sIm5hbWVzIjpbIlJlYWN0IiwiQ2hha3JhUHJvdmlkZXIiLCJleHRlbmRUaGVtZSIsImh0dHAiLCJjcmVhdGVDb25maWciLCJtYWlubmV0Iiwic2Vwb2xpYSIsIlF1ZXJ5Q2xpZW50IiwiUXVlcnlDbGllbnRQcm92aWRlciIsIldhZ21pUHJvdmlkZXIiLCJ1c2VSb3V0ZXIiLCJ1c2VFZmZlY3QiLCJMYW5ndWFnZVByb3ZpZGVyIiwiY29uZmlnIiwiY2hhaW5zIiwidHJhbnNwb3J0cyIsImlkIiwicXVlcnlDbGllbnQiLCJkZWZhdWx0T3B0aW9ucyIsInF1ZXJpZXMiLCJyZWZldGNoT25XaW5kb3dGb2N1cyIsInJldHJ5IiwidGhlbWUiLCJpbml0aWFsQ29sb3JNb2RlIiwidXNlU3lzdGVtQ29sb3JNb2RlIiwic3R5bGVzIiwiZ2xvYmFsIiwiYm9keSIsImJnIiwiY29tcG9uZW50cyIsIkJ1dHRvbiIsImRlZmF1bHRQcm9wcyIsImNvbG9yU2NoZW1lIiwiVG9hc3QiLCJwb3NpdGlvbiIsImlzQ2xvc2FibGUiLCJkdXJhdGlvbiIsIkFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsInJvdXRlciIsImhhbmRsZVJvdXRlQ2hhbmdlIiwidXJsIiwiY29uc29sZSIsImxvZyIsImhhbmRsZVJvdXRlQ2hhbmdlQ29tcGxldGUiLCJoYW5kbGVSb3V0ZUNoYW5nZUVycm9yIiwiZXJyIiwiZXJyb3IiLCJldmVudHMiLCJvbiIsIm9mZiIsImNsaWVudCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



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

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

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

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@14.2.27_@babel+core@7._a83636c527cd4a5cf205a1e55d47933a","vendor-chunks/@swc+helpers@0.5.5"], () => (__webpack_exec__("./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();