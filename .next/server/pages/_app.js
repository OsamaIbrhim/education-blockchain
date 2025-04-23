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

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @chakra-ui/react */ \"@chakra-ui/react\");\n/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! wagmi */ \"wagmi\");\n/* harmony import */ var viem_chains__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! viem/chains */ \"viem/chains\");\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_7__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__, wagmi__WEBPACK_IMPORTED_MODULE_4__, viem_chains__WEBPACK_IMPORTED_MODULE_5__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__]);\n([_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__, wagmi__WEBPACK_IMPORTED_MODULE_4__, viem_chains__WEBPACK_IMPORTED_MODULE_5__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\n\n\n\nconst config = (0,wagmi__WEBPACK_IMPORTED_MODULE_4__.createConfig)({\n    chains: [\n        viem_chains__WEBPACK_IMPORTED_MODULE_5__.mainnet,\n        viem_chains__WEBPACK_IMPORTED_MODULE_5__.sepolia\n    ],\n    transports: {\n        [viem_chains__WEBPACK_IMPORTED_MODULE_5__.mainnet.id]: (0,wagmi__WEBPACK_IMPORTED_MODULE_4__.http)(),\n        [viem_chains__WEBPACK_IMPORTED_MODULE_5__.sepolia.id]: (0,wagmi__WEBPACK_IMPORTED_MODULE_4__.http)()\n    }\n});\nconst queryClient = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__.QueryClient({\n    defaultOptions: {\n        queries: {\n            refetchOnWindowFocus: false,\n            retry: false\n        }\n    }\n});\nconst theme = (0,_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__.extendTheme)({\n    config: {\n        initialColorMode: \"light\",\n        useSystemColorMode: false\n    },\n    styles: {\n        global: {\n            body: {\n                bg: \"gray.50\"\n            }\n        }\n    },\n    components: {\n        Button: {\n            defaultProps: {\n                colorScheme: \"red\"\n            }\n        },\n        Toast: {\n            defaultProps: {\n                position: \"top\",\n                isClosable: true,\n                duration: 3000\n            }\n        }\n    }\n});\nfunction App({ Component, pageProps }) {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_7__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const handleRouteChange = (url)=>{\n            console.log(\"Route changing to:\", url);\n        };\n        const handleRouteChangeComplete = (url)=>{\n            console.log(\"Route change completed:\", url);\n        };\n        const handleRouteChangeError = (err, url)=>{\n            console.error(\"Route change error:\", {\n                url,\n                err\n            });\n        };\n        router.events.on(\"routeChangeStart\", handleRouteChange);\n        router.events.on(\"routeChangeComplete\", handleRouteChangeComplete);\n        router.events.on(\"routeChangeError\", handleRouteChangeError);\n        return ()=>{\n            router.events.off(\"routeChangeStart\", handleRouteChange);\n            router.events.off(\"routeChangeComplete\", handleRouteChangeComplete);\n            router.events.off(\"routeChangeError\", handleRouteChangeError);\n        };\n    }, [\n        router\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__.ChakraProvider, {\n        theme: theme,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_6__.QueryClientProvider, {\n            client: queryClient,\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(wagmi__WEBPACK_IMPORTED_MODULE_4__.WagmiProvider, {\n                config: config,\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education blockchain\\\\pages\\\\_app.tsx\",\n                    lineNumber: 88,\n                    columnNumber: 11\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education blockchain\\\\pages\\\\_app.tsx\",\n                lineNumber: 87,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education blockchain\\\\pages\\\\_app.tsx\",\n            lineNumber: 86,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\osama\\\\OneDrive\\\\Desktop\\\\Graduation\\\\education blockchain\\\\pages\\\\_app.tsx\",\n        lineNumber: 85,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUF5QjtBQUNLO0FBRWdDO0FBQ3BCO0FBQ0k7QUFDMEI7QUFDbkM7QUFDRTtBQUNOO0FBRWpDLE1BQU1ZLFNBQVNSLG1EQUFZQSxDQUFDO0lBQzFCUyxRQUFRO1FBQUNSLGdEQUFPQTtRQUFFQyxnREFBT0E7S0FBQztJQUMxQlEsWUFBWTtRQUNWLENBQUNULGdEQUFPQSxDQUFDVSxFQUFFLENBQUMsRUFBRVosMkNBQUlBO1FBQ2xCLENBQUNHLGdEQUFPQSxDQUFDUyxFQUFFLENBQUMsRUFBRVosMkNBQUlBO0lBQ3BCO0FBQ0Y7QUFFQSxNQUFNYSxjQUFjLElBQUlULDhEQUFXQSxDQUFDO0lBQ2xDVSxnQkFBZ0I7UUFDZEMsU0FBUztZQUNQQyxzQkFBc0I7WUFDdEJDLE9BQU87UUFDVDtJQUNGO0FBQ0Y7QUFFQSxNQUFNQyxRQUFRbkIsNkRBQVdBLENBQUM7SUFDeEJVLFFBQVE7UUFDTlUsa0JBQWtCO1FBQ2xCQyxvQkFBb0I7SUFDdEI7SUFDQUMsUUFBUTtRQUNOQyxRQUFRO1lBQ05DLE1BQU07Z0JBQ0pDLElBQUk7WUFDTjtRQUNGO0lBQ0Y7SUFDQUMsWUFBWTtRQUNWQyxRQUFRO1lBQ05DLGNBQWM7Z0JBQ1pDLGFBQWE7WUFDZjtRQUNGO1FBQ0FDLE9BQU87WUFDTEYsY0FBYztnQkFDWkcsVUFBVTtnQkFDVkMsWUFBWTtnQkFDWkMsVUFBVTtZQUNaO1FBQ0Y7SUFDRjtBQUNGO0FBRWUsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUM1RCxNQUFNQyxTQUFTN0Isc0RBQVNBO0lBRXhCQyxnREFBU0EsQ0FBQztRQUNSLE1BQU02QixvQkFBb0IsQ0FBQ0M7WUFDekJDLFFBQVFDLEdBQUcsQ0FBQyxzQkFBc0JGO1FBQ3BDO1FBRUEsTUFBTUcsNEJBQTRCLENBQUNIO1lBQ2pDQyxRQUFRQyxHQUFHLENBQUMsMkJBQTJCRjtRQUN6QztRQUVBLE1BQU1JLHlCQUF5QixDQUFDQyxLQUFVTDtZQUN4Q0MsUUFBUUssS0FBSyxDQUFDLHVCQUF1QjtnQkFBRU47Z0JBQUtLO1lBQUk7UUFDbEQ7UUFFQVAsT0FBT1MsTUFBTSxDQUFDQyxFQUFFLENBQUMsb0JBQW9CVDtRQUNyQ0QsT0FBT1MsTUFBTSxDQUFDQyxFQUFFLENBQUMsdUJBQXVCTDtRQUN4Q0wsT0FBT1MsTUFBTSxDQUFDQyxFQUFFLENBQUMsb0JBQW9CSjtRQUVyQyxPQUFPO1lBQ0xOLE9BQU9TLE1BQU0sQ0FBQ0UsR0FBRyxDQUFDLG9CQUFvQlY7WUFDdENELE9BQU9TLE1BQU0sQ0FBQ0UsR0FBRyxDQUFDLHVCQUF1Qk47WUFDekNMLE9BQU9TLE1BQU0sQ0FBQ0UsR0FBRyxDQUFDLG9CQUFvQkw7UUFDeEM7SUFDRixHQUFHO1FBQUNOO0tBQU87SUFFWCxxQkFDRSw4REFBQ3RDLDREQUFjQTtRQUFDb0IsT0FBT0E7a0JBQ3JCLDRFQUFDYixzRUFBbUJBO1lBQUMyQyxRQUFRbkM7c0JBQzNCLDRFQUFDUCxnREFBYUE7Z0JBQUNHLFFBQVFBOzBCQUNyQiw0RUFBQ3lCO29CQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtsQyIsInNvdXJjZXMiOlsid2VicGFjazovL2VkdWNhdGlvbi1ibG9ja2NoYWluLy4vcGFnZXMvX2FwcC50c3g/MmZiZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcydcbmltcG9ydCB0eXBlIHsgQXBwUHJvcHMgfSBmcm9tICduZXh0L2FwcCdcbmltcG9ydCB7IENoYWtyYVByb3ZpZGVyLCBleHRlbmRUaGVtZSB9IGZyb20gJ0BjaGFrcmEtdWkvcmVhY3QnXG5pbXBvcnQgeyBodHRwLCBjcmVhdGVDb25maWcgfSBmcm9tICd3YWdtaSdcbmltcG9ydCB7IG1haW5uZXQsIHNlcG9saWEgfSBmcm9tICd2aWVtL2NoYWlucydcbmltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J1xuaW1wb3J0IHsgV2FnbWlQcm92aWRlciB9IGZyb20gJ3dhZ21pJ1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInXG5pbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCdcblxuY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnKHtcbiAgY2hhaW5zOiBbbWFpbm5ldCwgc2Vwb2xpYV0sXG4gIHRyYW5zcG9ydHM6IHtcbiAgICBbbWFpbm5ldC5pZF06IGh0dHAoKSxcbiAgICBbc2Vwb2xpYS5pZF06IGh0dHAoKVxuICB9XG59KVxuXG5jb25zdCBxdWVyeUNsaWVudCA9IG5ldyBRdWVyeUNsaWVudCh7XG4gIGRlZmF1bHRPcHRpb25zOiB7XG4gICAgcXVlcmllczoge1xuICAgICAgcmVmZXRjaE9uV2luZG93Rm9jdXM6IGZhbHNlLFxuICAgICAgcmV0cnk6IGZhbHNlXG4gICAgfVxuICB9XG59KVxuXG5jb25zdCB0aGVtZSA9IGV4dGVuZFRoZW1lKHtcbiAgY29uZmlnOiB7XG4gICAgaW5pdGlhbENvbG9yTW9kZTogJ2xpZ2h0JyxcbiAgICB1c2VTeXN0ZW1Db2xvck1vZGU6IGZhbHNlLFxuICB9LFxuICBzdHlsZXM6IHtcbiAgICBnbG9iYWw6IHtcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgYmc6ICdncmF5LjUwJyxcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGNvbXBvbmVudHM6IHtcbiAgICBCdXR0b246IHtcbiAgICAgIGRlZmF1bHRQcm9wczoge1xuICAgICAgICBjb2xvclNjaGVtZTogJ3JlZCcsXG4gICAgICB9XG4gICAgfSxcbiAgICBUb2FzdDoge1xuICAgICAgZGVmYXVsdFByb3BzOiB7XG4gICAgICAgIHBvc2l0aW9uOiAndG9wJyxcbiAgICAgICAgaXNDbG9zYWJsZTogdHJ1ZSxcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgaGFuZGxlUm91dGVDaGFuZ2UgPSAodXJsOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdSb3V0ZSBjaGFuZ2luZyB0bzonLCB1cmwpXG4gICAgfVxuXG4gICAgY29uc3QgaGFuZGxlUm91dGVDaGFuZ2VDb21wbGV0ZSA9ICh1cmw6IHN0cmluZykgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ1JvdXRlIGNoYW5nZSBjb21wbGV0ZWQ6JywgdXJsKVxuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZVJvdXRlQ2hhbmdlRXJyb3IgPSAoZXJyOiBhbnksIHVybDogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdSb3V0ZSBjaGFuZ2UgZXJyb3I6JywgeyB1cmwsIGVyciB9KVxuICAgIH1cblxuICAgIHJvdXRlci5ldmVudHMub24oJ3JvdXRlQ2hhbmdlU3RhcnQnLCBoYW5kbGVSb3V0ZUNoYW5nZSlcbiAgICByb3V0ZXIuZXZlbnRzLm9uKCdyb3V0ZUNoYW5nZUNvbXBsZXRlJywgaGFuZGxlUm91dGVDaGFuZ2VDb21wbGV0ZSlcbiAgICByb3V0ZXIuZXZlbnRzLm9uKCdyb3V0ZUNoYW5nZUVycm9yJywgaGFuZGxlUm91dGVDaGFuZ2VFcnJvcilcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICByb3V0ZXIuZXZlbnRzLm9mZigncm91dGVDaGFuZ2VTdGFydCcsIGhhbmRsZVJvdXRlQ2hhbmdlKVxuICAgICAgcm91dGVyLmV2ZW50cy5vZmYoJ3JvdXRlQ2hhbmdlQ29tcGxldGUnLCBoYW5kbGVSb3V0ZUNoYW5nZUNvbXBsZXRlKVxuICAgICAgcm91dGVyLmV2ZW50cy5vZmYoJ3JvdXRlQ2hhbmdlRXJyb3InLCBoYW5kbGVSb3V0ZUNoYW5nZUVycm9yKVxuICAgIH1cbiAgfSwgW3JvdXRlcl0pXG5cbiAgcmV0dXJuIChcbiAgICA8Q2hha3JhUHJvdmlkZXIgdGhlbWU9e3RoZW1lfT5cbiAgICAgIDxRdWVyeUNsaWVudFByb3ZpZGVyIGNsaWVudD17cXVlcnlDbGllbnR9PlxuICAgICAgICA8V2FnbWlQcm92aWRlciBjb25maWc9e2NvbmZpZ30+XG4gICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgICAgICA8L1dhZ21pUHJvdmlkZXI+XG4gICAgICA8L1F1ZXJ5Q2xpZW50UHJvdmlkZXI+XG4gICAgPC9DaGFrcmFQcm92aWRlcj5cbiAgKVxufSAiXSwibmFtZXMiOlsiUmVhY3QiLCJDaGFrcmFQcm92aWRlciIsImV4dGVuZFRoZW1lIiwiaHR0cCIsImNyZWF0ZUNvbmZpZyIsIm1haW5uZXQiLCJzZXBvbGlhIiwiUXVlcnlDbGllbnQiLCJRdWVyeUNsaWVudFByb3ZpZGVyIiwiV2FnbWlQcm92aWRlciIsInVzZVJvdXRlciIsInVzZUVmZmVjdCIsImNvbmZpZyIsImNoYWlucyIsInRyYW5zcG9ydHMiLCJpZCIsInF1ZXJ5Q2xpZW50IiwiZGVmYXVsdE9wdGlvbnMiLCJxdWVyaWVzIiwicmVmZXRjaE9uV2luZG93Rm9jdXMiLCJyZXRyeSIsInRoZW1lIiwiaW5pdGlhbENvbG9yTW9kZSIsInVzZVN5c3RlbUNvbG9yTW9kZSIsInN0eWxlcyIsImdsb2JhbCIsImJvZHkiLCJiZyIsImNvbXBvbmVudHMiLCJCdXR0b24iLCJkZWZhdWx0UHJvcHMiLCJjb2xvclNjaGVtZSIsIlRvYXN0IiwicG9zaXRpb24iLCJpc0Nsb3NhYmxlIiwiZHVyYXRpb24iLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJyb3V0ZXIiLCJoYW5kbGVSb3V0ZUNoYW5nZSIsInVybCIsImNvbnNvbGUiLCJsb2ciLCJoYW5kbGVSb3V0ZUNoYW5nZUNvbXBsZXRlIiwiaGFuZGxlUm91dGVDaGFuZ2VFcnJvciIsImVyciIsImVycm9yIiwiZXZlbnRzIiwib24iLCJvZmYiLCJjbGllbnQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();