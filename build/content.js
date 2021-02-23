(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// if not in a browser, assume we're in a test, return a dummy
if (typeof window === "undefined") exports.browser = {};
else exports.browser = require("webextension-polyfill");

},{"webextension-polyfill":2}],2:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("webextension-polyfill", ["module"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.browser = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.7.0 - Tue Nov 10 2020 20:24:04 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
    const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)"; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */


      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }

      }
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */


      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.rejection
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function}
       *        The generated callback function.
       */


      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(extensionAPIs.runtime.lastError);
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */


      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({
                  resolve,
                  reject
                }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({
                resolve,
                reject
              }, metadata));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */


      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }

        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,

                get() {
                  return target[prop];
                },

                set(value) {
                  target[prop] = value;
                }

              });
              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }

            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }

        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */


      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }

      }); // Keep track if the deprecation warning has been logged at least once.


      let loggedSendResponseDeprecationWarning = false;
      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */


        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;
          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              if (!loggedSendResponseDeprecationWarning) {
                console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                loggedSendResponseDeprecationWarning = true;
              }

              didCallSendResponse = true;
              resolve(response);
            };
          });
          let result;

          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).


          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;

              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.


          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.


          return true;
        };
      });

      const wrappedSendMessageCallback = ({
        reject,
        resolve
      }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(extensionAPIs.runtime.lastError);
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve,
            reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      const settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    };

    if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
      throw new Error("This script should only be loaded in a browser extension.");
    } // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.


    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = browser;
  }
});


},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calc_array_diff = void 0;
function calc_array_diff(arr_new, arr_old, equal) {
    return {
        added: arr_new.filter((new_element) => !arr_old.some((old_element) => equal(new_element, old_element))),
        removed: arr_old.filter((old_element) => !arr_new.some((new_element) => equal(new_element, old_element))),
        overlap: arr_new.filter((new_element) => arr_old.some((old_element) => equal(new_element, old_element)))
    };
}
exports.calc_array_diff = calc_array_diff;
;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICommonMessage = void 0;
;
var ICommonMessage;
(function (ICommonMessage) {
    let Type;
    (function (Type) {
        Type[Type["FOCUS"] = 0] = "FOCUS";
        Type[Type["REFOCUS"] = 1] = "REFOCUS";
        Type[Type["TEXT_ENTERED"] = 2] = "TEXT_ENTERED";
        Type[Type["NOTIFY_PII"] = 3] = "NOTIFY_PII";
        Type[Type["NOTIFY_PII_PARSING"] = 4] = "NOTIFY_PII_PARSING";
    })(Type = ICommonMessage.Type || (ICommonMessage.Type = {}));
    ;
    class Focus {
        constructor(valid) {
            this.valid = valid;
            this.type = ICommonMessage.Type.FOCUS;
        }
    }
    ICommonMessage.Focus = Focus;
    ;
    class Refocus {
        constructor() {
            this.type = ICommonMessage.Type.REFOCUS;
        }
    }
    ICommonMessage.Refocus = Refocus;
    ;
    class TextEntered {
        constructor(text) {
            this.text = text;
            this.type = ICommonMessage.Type.TEXT_ENTERED;
        }
    }
    ICommonMessage.TextEntered = TextEntered;
    ;
    class NotifyPIIParsing {
        constructor() {
            this.type = ICommonMessage.Type.NOTIFY_PII_PARSING;
        }
    }
    ICommonMessage.NotifyPIIParsing = NotifyPIIParsing;
    ;
    class NotifyPII {
        constructor(severity_mapping, pii, ignore_highlight) {
            this.severity_mapping = severity_mapping;
            this.pii = pii;
            this.ignore_highlight = ignore_highlight;
            this.type = ICommonMessage.Type.NOTIFY_PII;
        }
    }
    ICommonMessage.NotifyPII = NotifyPII;
    ;
})(ICommonMessage = exports.ICommonMessage || (exports.ICommonMessage = {}));
;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Margin = void 0;
/**
 * simple margin type
 */
class Margin {
    constructor(left = 0, top = 0, right = 0, bottom = 0) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
    ;
}
exports.Margin = Margin;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = void 0;
/**
 * Thin wrapper to separate private and public interfaces of Observable
 */
class Observable {
    constructor(variable) {
        this.observe = variable.observe.bind(variable);
        this.disregard = variable.disregard.bind(variable);
        this.get = variable.get.bind(variable);
    }
}
exports.Observable = Observable;
(function (Observable) {
    class Variable {
        constructor(notify_on_diff_only = true) {
            this.notify_on_diff_only = notify_on_diff_only;
            this._observers = new Array();
            this._value = null;
        }
        get value() {
            return this._value;
        }
        /**
         * setter for value (notifies observers)
         */
        set value(new_value) {
            if (!this.notify_on_diff_only || this.value !== new_value) {
                this._value = new_value;
                this.notify();
            }
        }
        notify() {
            this._observers.forEach((callback) => {
                callback(this.value);
            });
        }
        get() {
            return this.value;
        }
        /**
         * start observing
         * @param callback the callback which will be called with the new value
         */
        observe(callback) {
            if (this._observers.indexOf(callback) > -1)
                throw new Error(`Observer already exists on Variable.`);
            this._observers.push(callback);
        }
        /**
         * stop observing
         * @param callback the callback which was added earlier (When omitted removes all listeners)
         */
        disregard(callback) {
            if (callback == null)
                this._observers = new Array();
            let index_of_callback = this._observers.indexOf(callback, 0);
            if (index_of_callback > -1)
                this._observers.splice(index_of_callback, 1);
            else
                throw new Error(`Observer does not exist on Variable.`);
        }
    }
    Observable.Variable = Variable;
})(Observable = exports.Observable || (exports.Observable = {}));

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rect = void 0;
/**
 * simple rect type
 */
class Rect {
    constructor(left = 0, top = 0, width = 0, height = 0, scroll_width = width, scroll_height = height, absolute_offs_x = 0, absolute_offs_y = 0) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.scroll_width = scroll_width;
        this.scroll_height = scroll_height;
        this.absolute_offs_x = absolute_offs_x;
        this.absolute_offs_y = absolute_offs_y;
    }
    ;
    get right() {
        return this.left + this.width;
    }
    get bottom() {
        return this.top + this.height;
    }
    get left_absolute() {
        return this.left + this.absolute_offs_x;
    }
    get top_absolute() {
        return this.top + this.absolute_offs_y;
    }
    get right_absolute() {
        return this.right + this.absolute_offs_x;
    }
    get bottom_absolute() {
        return this.bottom + this.absolute_offs_y;
    }
    apply_position_to_element(element, absolute = false, inner_element) {
        if (absolute) {
            element.style.left = `${this.left_absolute + (inner_element ? inner_element.clientLeft : 0)}px`;
            element.style.top = `${this.top_absolute + (inner_element ? inner_element.clientTop : 0)}px`;
        }
        else {
            element.style.left = `${this.left + (inner_element ? inner_element.clientLeft : 0)}px`;
            element.style.top = `${this.top + (inner_element ? inner_element.clientTop : 0)}px`;
        }
    }
    apply_width_and_height_to_element(element, inner_element) {
        if (inner_element) {
            element.style.width = `${inner_element.clientWidth}px`;
            element.style.height = `${inner_element.clientHeight}px`;
        }
        else {
            element.style.width = `${this.width}px`;
            element.style.height = `${this.height}px`;
        }
    }
    apply_to_element(element, position = true, absolute = false, inner_element) {
        if (position)
            this.apply_position_to_element(element, absolute, inner_element);
        this.apply_width_and_height_to_element(element, inner_element);
    }
    static from_element(element) {
        const bounding_rect = element.getBoundingClientRect();
        return new Rect(bounding_rect.left, bounding_rect.top, bounding_rect.width, bounding_rect.height, element.scrollWidth, element.scrollHeight);
    }
    static copy(rect) {
        let new_rect = new Rect();
        for (let key in rect)
            Reflect.set(new_rect, key, Reflect.get(rect, key));
        return new_rect;
    }
}
exports.Rect = Rect;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
const pii_filter_info_overlay_1 = require("./content/pii-filter-info-overlay");
const common_messages_1 = require("./common/common-messages");
const dom_focus_manager_1 = require("./content/dom-focus-manager");
const utils_1 = require("./content/utils");
const range_highlighter_1 = require("./content/text-entry-highlighter/range-highlighter");
const box_highlight_content_parser_1 = require("./content/text-entry-highlighter/box-highlight-content-parser");
const text_entry_highlighter_1 = require("./content/text-entry-highlighter/text-entry-highlighter");
var PII_Filter;
(function (PII_Filter) {
    class Frame {
        constructor() {
            this.input_focus_manager = new dom_focus_manager_1.DOMFocusManager(document);
            this.initialized = false;
            // Listen to focus changes in other frames
            webextension_polyfill_ts_1.browser.runtime.onMessage.addListener((message, sender) => {
                switch (message.type) {
                    case common_messages_1.ICommonMessage.Type.FOCUS:
                        {
                            let f_event = message;
                            if (!f_event.valid && this.active_element != null) {
                                this.active_element = null;
                                this.input_focus_manager.unfocus();
                            }
                            else if (f_event.valid && this.active_element == null && this.last_active_element != null) { // restore focus
                                this.last_active_element.focus();
                            }
                            break;
                        }
                    case common_messages_1.ICommonMessage.Type.NOTIFY_PII:
                        {
                            let n_message = message;
                            this.handle_pii(n_message);
                            break;
                        }
                    default: {
                        break;
                    }
                }
            });
            // highlighting and input
            this.highlighter = new range_highlighter_1.RangeHighlighter();
            this.content_parser = new box_highlight_content_parser_1.BoxHighlightContentParser((text, resolver) => {
                if (this.resolver == null) {
                    this.resolver = resolver;
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.TextEntered(text));
                }
                else
                    console.warn('resolver is not null');
            });
            this.text_entry_highlighter = new text_entry_highlighter_1.TextEntryHighlighter(document, this.highlighter, this.content_parser);
            // TODO: make part of text_entry_highlighter
            // Register input management
            this.input_focus_manager.active_focus.observe((element) => {
                let is_text_input = element != null && utils_1.Utils.DOM.is_text_input(element);
                if (is_text_input) {
                    this.active_element = element;
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.Focus(true));
                }
                else {
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.Focus(false));
                    this.active_element = null;
                }
            });
        }
        set active_element(element) {
            this.last_active_element = this.active_element_;
            this.active_element_ = element;
        }
        get active_element() {
            return this.active_element_;
        }
        async handle_pii(message) {
            if (!message.ignore_highlight) {
                let ranges = new Array();
                for (const pii of message.pii) {
                    ranges.push({
                        start: pii.start_pos,
                        end: pii.end_pos,
                        intensity: pii.severity
                    });
                }
                // resolve request
                if (this.resolver != null) {
                    this.resolver(ranges);
                    this.resolver = null;
                }
                else
                    console.warn('resolver null');
            }
        }
    }
    PII_Filter.Frame = Frame;
    ;
    /**
     * Top level frame (for drawing overlays)
     */
    class Top extends Frame {
        constructor() {
            super();
            this.info_overlay = null;
            webextension_polyfill_ts_1.browser.runtime.onMessage.addListener((message, sender) => {
                switch (message.type) {
                    case common_messages_1.ICommonMessage.Type.NOTIFY_PII_PARSING: {
                        this.info_overlay.restart_fade_out_timer();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
            // info overlay
            this.info_overlay = new pii_filter_info_overlay_1.PIIFilterInfoOverlay(document);
            this.info_overlay.on_focus_required.observe((req) => {
                webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.Refocus());
            });
        }
        async handle_pii(message) {
            super.handle_pii(message);
            this.info_overlay.severity = message.severity_mapping;
            if (message.pii != null)
                this.info_overlay.pii = message.pii;
        }
    }
    PII_Filter.Top = Top;
    ;
    class Content {
        constructor() {
            this.frame = (window.self !== window.top) ? new Frame() : new Top();
        }
    }
    PII_Filter.Content = Content;
    ;
})(PII_Filter || (PII_Filter = {}));
;
new PII_Filter.Content();

},{"./common/common-messages":4,"./content/dom-focus-manager":10,"./content/pii-filter-info-overlay":13,"./content/text-entry-highlighter/box-highlight-content-parser":17,"./content/text-entry-highlighter/range-highlighter":20,"./content/text-entry-highlighter/text-entry-highlighter":21,"./content/utils":25,"webextension-polyfill-ts":1}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bindings = void 0;
class Bindings {
    constructor() {
        /**
         * @protected
         * holds unbinding calls
         */
        this.unbind_calls = new Array();
    }
    /**
     * bind to an event and adds a clean-up function for delete()
     * @param element the element to listen to
     * @param event_name the event to listen for
     * @param event_cb the callback which will be called
     */
    bind_event(element, event_name, event_cb) {
        element.addEventListener(event_name, event_cb);
        this.unbind_calls.push(() => {
            element.removeEventListener(event_name, event_cb);
        });
    }
    /**
     * add raw unbind call
     * @param unbind_call the call
     */
    add_unbinding(unbind_call) {
        this.unbind_calls.push(unbind_call);
    }
    /**
     * removes all listeners and cleans up
     */
    remove() {
        for (let unbind_call of this.unbind_calls)
            unbind_call();
        this.unbind_calls = new Array();
    }
}
exports.Bindings = Bindings;
;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMFocusManager = void 0;
const observable_1 = require("../common/observable");
class DOMFocusManager {
    /**
     * creates and binds the focus manager
     * @param element the DOM element to bind to
     */
    constructor(element) {
        this._active_focus = new observable_1.Observable.Variable();
        this.active_focus = new observable_1.Observable(this._active_focus);
        element.addEventListener('focusin', this.focus_in.bind(this), false);
        element.addEventListener('focusout', this.focus_out.bind(this), false);
    }
    /**
     * callback for focusin event
     * @param event the event
     */
    focus_in(event) {
        if (event != null) {
            let target = event.target;
            // traverse possible shadow roots
            while (target.shadowRoot && target.shadowRoot.activeElement)
                target = target.shadowRoot.activeElement;
            this._active_focus.value = target;
        }
        else
            this.focus_out(null);
    }
    /**
     * callback for focusout event
     * @param event the event
     */
    focus_out(event) {
        if (this._active_focus.value != null)
            this._active_focus.value = null;
    }
    /**
     * unfocus the input manager
     */
    unfocus() {
        this._active_focus.value = null;
    }
}
exports.DOMFocusManager = DOMFocusManager;
;

},{"../common/observable":6}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementObserver = void 0;
const bindings_1 = require("./bindings");
const rect_1 = require("../common/rect");
class StyleCalculator {
    constructor(document, shadow, element) {
        this.el_div = document.createElement('div');
        this.el_div.setAttribute('style', 'display: none');
        const element_base = document.createElement(element.tagName);
        this.el_div.appendChild(element_base);
        shadow.appendChild(this.el_div);
        this.default_style = window.getComputedStyle(element_base);
        this.comp_style = window.getComputedStyle(element);
    }
    filter_defaults() {
        let results = new Map();
        for (let key of this.comp_style) {
            const comped_val = this.comp_style.getPropertyValue(key);
            if (this.default_style.getPropertyValue(key) !== comped_val)
                results.set(key, comped_val);
        }
        return results;
    }
    remove() {
        this.el_div.remove();
    }
}
;
class ElementObserver {
    constructor(document, shadow, input_element, polling_interval, // for uncaught changes
    on_rect_changed, on_style_changed) {
        this.bindings = new bindings_1.Bindings();
        this.active = true;
        this.style_calculator = new StyleCalculator(document, shadow, input_element);
        // watch for style change
        const resize_attrs = ['width', 'height', 'inline-size', 'block-size'];
        let old_css = new Map();
        for (let [key, value] of this.style_calculator.filter_defaults()) {
            if (resize_attrs.indexOf(key) == -1) {
                old_css.set(key, value);
            }
        }
        const style_observer = new MutationObserver((mutations, observer) => {
            let new_values = new Map();
            for (let [key, value] of this.style_calculator.filter_defaults()) {
                // if (resize_attrs.indexOf(key) == -1)
                // {
                if (!old_css.has(key) || value != old_css.get(key)) {
                    new_values.set(key, value);
                    old_css.set(key, value);
                }
                // }
            }
            if (new_values.keys.length > 0) {
                on_style_changed(new_values, old_css);
                update_rect_from_bounding_client();
            }
        });
        style_observer.observe(input_element, { attributes: true, attributeFilter: ['style', 'class'] });
        this.bindings.add_unbinding(() => { style_observer.disconnect(); });
        let last_rect = new rect_1.Rect();
        const update_rect = (left, top, width, height, scroll_width = input_element.scrollWidth, scroll_height = input_element.scrollHeight, scroll_x = window.scrollX, scroll_y = window.scrollY) => {
            if (left != last_rect.left ||
                top != last_rect.top ||
                width != last_rect.width ||
                height != last_rect.height ||
                scroll_width != last_rect.scroll_width ||
                scroll_height != last_rect.scroll_height ||
                scroll_x != last_rect.absolute_offs_x ||
                scroll_y != last_rect.absolute_offs_y) {
                const new_rect = new rect_1.Rect(left, top, width, height, scroll_width, scroll_height, scroll_x, scroll_y);
                on_rect_changed(new_rect);
                last_rect = new_rect;
            }
        };
        const update_rect_from_bounding_client = () => {
            const bounding_rect = input_element.getBoundingClientRect();
            update_rect(bounding_rect.left, bounding_rect.top, bounding_rect.width, bounding_rect.height);
        };
        // intersection observer
        const intersect_observer = new IntersectionObserver((entries, observer) => {
            const bounding_rect = entries[0].boundingClientRect;
            update_rect(bounding_rect.left, bounding_rect.top, bounding_rect.width, bounding_rect.height);
        }, {
            root: document.querySelector('#scrollArea'),
            rootMargin: '0px',
            threshold: (() => {
                let arr = new Array();
                const n_steps = 100;
                // TODO: generate this somewhere and keep it around
                for (let i = 0; i < n_steps + 1; ++i)
                    arr.push(i / n_steps);
                return arr;
            })()
        });
        intersect_observer.observe(input_element);
        this.bindings.add_unbinding(() => { intersect_observer.disconnect(); });
        // watch for element resize
        const resize_observer = new ResizeObserver((entries, observer) => {
            update_rect_from_bounding_client();
        });
        resize_observer.observe(input_element);
        this.bindings.add_unbinding(() => { resize_observer.disconnect(); });
        // watch for window resize
        const win_resize_observer = new ResizeObserver((entries, observer) => {
            update_rect_from_bounding_client();
        });
        win_resize_observer.observe(window.document.body);
        this.bindings.add_unbinding(() => { win_resize_observer.disconnect(); });
        // polling for uncaught changes
        const rect_polling_update = () => {
            if (this.active) {
                update_rect_from_bounding_client();
                setTimeout(rect_polling_update, polling_interval);
            }
        };
        // notify of initial changes
        on_style_changed(old_css, old_css);
        rect_polling_update();
    }
    remove() {
        this.active = false;
        this.style_calculator.remove();
        this.bindings.remove();
    }
}
exports.ElementObserver = ElementObserver;
;

},{"../common/rect":7,"./bindings":9}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_fonts = void 0;
const webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
function get_fonts() {
    let url = (u) => {
        return webextension_polyfill_ts_1.browser.runtime.getURL(`assets/fonts/webfonts/${u}`);
    };
    return `
    @font-face {
        font-family: "Montserrat";
        font-weight: 100;
        font-style: normal;
        src: url("${url('Montserrat-Thin.woff2')}") format("woff2"),
             url("${url('Montserrat-Thin.woff')}") format("woff");
    }
    
    /** Montserrat Thin-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 100;
        font-style: italic;
        src: url("${url('Montserrat-ThinItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-ThinItalic.woff')}") format("woff");
    }
    
    /** Montserrat ExtraLight **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 200;
        font-style: normal;
        src: url("${url('Montserrat-ExtraLight.woff2')}") format("woff2"),
             url("${url('Montserrat-ExtraLight.woff')}") format("woff");
    }
    
    /** Montserrat ExtraLight-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 200;
        font-style: italic;
        src: url("${url('Montserrat-ExtraLightItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-ExtraLightItalic.woff')}") format("woff");
    }
    
    /** Montserrat Light **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 300;
        font-style: normal;
        src: url("${url('Montserrat-Light.woff2')}") format("woff2"),
             url("${url('Montserrat-Light.woff')}") format("woff");
    }
    
    /** Montserrat Light-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 300;
        font-style: italic;
        src: url("${url('Montserrat-LightItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-LightItalic.woff')}") format("woff");
    }
    
    /** Montserrat Regular **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 400;
        font-style: normal;
        src: url("${url('Montserrat-Regular.woff2')}") format("woff2"),
             url("${url('Montserrat-Regular.woff')}") format("woff");
    }
    
    /** Montserrat Regular-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 400;
        font-style: italic;
        src: url("${url('Montserrat-Italic.woff2')}") format("woff2"),
             url("${url('Montserrat-Italic.woff')}") format("woff");
    }
    
    /** Montserrat Medium **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 500;
        font-style: normal;
        src: url("${url('Montserrat-Medium.woff2')}") format("woff2"),
             url("${url('Montserrat-Medium.woff')}") format("woff");
    }
    
    /** Montserrat Medium-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 500;
        font-style: italic;
        src: url("${url('Montserrat-MediumItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-MediumItalic.woff')}") format("woff");
    }
    
    /** Montserrat SemiBold **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 600;
        font-style: normal;
        src: url("${url('Montserrat-SemiBold.woff2')}") format("woff2"),
             url("${url('Montserrat-SemiBold.woff')}") format("woff");
    }
    
    /** Montserrat SemiBold-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 600;
        font-style: italic;
        src: url("${url('Montserrat-SemiBoldItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-SemiBoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Bold **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 700;
        font-style: normal;
        src: url("${url('Montserrat-Bold.woff2')}") format("woff2"),
             url("${url('Montserrat-Bold.woff')}") format("woff");
    }
    
    /** Montserrat Bold-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 700;
        font-style: italic;
        src: url("${url('Montserrat-BoldItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-BoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat ExtraBold **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 800;
        font-style: normal;
        src: url("${url('Montserrat-ExtraBold.woff2')}") format("woff2"),
             url("${url('Montserrat-ExtraBold.woff')}") format("woff");
    }
    
    /** Montserrat ExtraBold-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 800;
        font-style: italic;
        src: url("${url('Montserrat-ExtraBoldItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-ExtraBoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Black **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 900;
        font-style: normal;
        src: url("${url('Montserrat-Black.woff2')}") format("woff2"),
             url("${url('Montserrat-Black.woff')}") format("woff");
    }
    
    /** Montserrat Black-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 900;
        font-style: italic;
        src: url("${url('Montserrat-BlackItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-BlackItalic.woff')}") format("woff");
    }
    
    /** =================== MONTSERRAT ALTERNATES =================== **/
    
    /** Montserrat Alternates Thin **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 100;
        font-style: normal;
        src: url("${url('MontserratAlternates-Thin.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Thin.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Thin-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 100;
        font-style: italic;
        src: url("${url('MontserratAlternates-ThinItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ThinItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates ExtraLight **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 200;
        font-style: normal;
        src: url("${url('MontserratAlternates-ExtraLight.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ExtraLight.woff')}") format("woff");
    }
    
    /** Montserrat Alternates ExtraLight-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 200;
        font-style: italic;
        src: url("${url('MontserratAlternates-ExtraLightItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ExtraLightItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Light **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 300;
        font-style: normal;
        src: url("${url('MontserratAlternates-Light.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Light.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Light-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 300;
        font-style: italic;
        src: url("${url('MontserratAlternates-LightItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-LightItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Regular **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 400;
        font-style: normal;
        src: url("${url('MontserratAlternates-Regular.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Regular.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Regular-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 400;
        font-style: italic;
        src: url("${url('MontserratAlternates-Italic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Italic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Medium **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 500;
        font-style: normal;
        src: url("${url('MontserratAlternates-Medium.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Medium.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Medium-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 500;
        font-style: italic;
        src: url("${url('MontserratAlternates-MediumItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-MediumItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates SemiBold **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 600;
        font-style: normal;
        src: url("${url('MontserratAlternates-SemiBold.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-SemiBold.woff')}") format("woff");
    }
    
    /** Montserrat Alternates SemiBold-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 600;
        font-style: italic;
        src: url("${url('MontserratAlternates-SemiBoldItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-SemiBoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Bold **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 700;
        font-style: normal;
        src: url("${url('MontserratAlternates-Bold.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Bold.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Bold-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 700;
        font-style: italic;
        src: url("${url('MontserratAlternates-BoldItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-BoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates ExtraBold **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 800;
        font-style: normal;
        src: url("${url('MontserratAlternates-ExtraBold.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ExtraBold.woff')}") format("woff");
    }
    
    /** Montserrat Alternates ExtraBold-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 800;
        font-style: italic;
        src: url("${url('MontserratAlternates-ExtraBoldItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ExtraBoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Black **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 900;
        font-style: normal;
        src: url("${url('MontserratAlternates-Black.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Black.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Black-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 900;
        font-style: italic;
        src: url("${url('MontserratAlternates-BlackItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-BlackItalic.woff')}") format("woff");
    }`;
}
exports.get_fonts = get_fonts;
;

},{"webextension-polyfill-ts":1}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIIFilterInfoOverlay = void 0;
const webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
const shadow_dom_1 = require("./shadow-dom");
const pii_filter_modal_window_1 = require("./pii-filter-modal-window");
const font_css_1 = require("./font_css");
const observable_1 = require("../common/observable");
// TODO: in order to toggle the modal to stay open and update as well some stuff will need to change in focus handling.
/**
 * Provides an overlay with info/slider
 */
class PIIFilterInfoOverlay extends shadow_dom_1.ShadowDomDiv {
    constructor(document) {
        super(document);
        this.severity_ = 0;
        this.keep_open = false;
        this.mouse_inside = false;
        this.hide_after_ms = 10000;
        this.on_focus_required_ = new observable_1.Observable.Variable(false);
        this.on_focus_required = new observable_1.Observable(this.on_focus_required_);
        this.modal_window = new pii_filter_modal_window_1.PIIFilterModalWindow(document);
        this.modal_window.title_div.innerText = 'Informatie in het huidige tekstveld:';
        let style = this.shadow.ownerDocument.createElement('style');
        style.innerText = `    
            ${font_css_1.get_fonts()}

            body {
                padding:            0px;
                margin:             0px;
            }
            .severity-bar-outer {
                transition:         0.25s ease-in;
                display:            block;
                visibility:         visible;
                position:           fixed;
                height:             0px;
                bottom:             0%;
                width:              100%;
                padding:            0px;
                border-top-style:   solid;
                border-top-width:   1.5px;
                border-top-color:   rgba(50, 50, 50, 0.75);
                background-color:   rgba(255, 255, 255, 0.9);
                z-index:            9999;
                opacity:            0.0;
            }
            .severity-bar-container {
                display:            block;
                background-image:   linear-gradient(to right, yellow, orange, red, purple);
                width:              100%;
                height:             25px;
            }
            .severity-bar-indicator {
                transition:         0.75s ease-in;
                visibility:         visible;
                background-color:   rgba(255, 255, 255, 0.95);
                position:           fixed;
                right:              0%;
                width:              100%;
                height:             100%;
            }
            .severity-bar-text {
                display:            flex;
                justify-content:    center;
                flex-wrap:          nowrap;
                width:              100%;
                height:             100%;
            }
            .severity-display-item {
                display:            inline-block;
                align-self:         center;
                z-index:            99999;
            }
            .severity-text-span {
                margin-right:       10px;
                font-family:        'Montserrat', sans-serif;
                font-weight:        400;
                font-size:          12pt;
                color:              black;
                align-self:         center;
            }
            .info-icon {
                margin-top:         3px;
                width:              15px;
                align-self:         center;
            }
        `;
        this.shadow.appendChild(style);
        this.div.classList.add('severity-bar-outer');
        this.severity_bar_container = this.shadow.ownerDocument.createElement('div');
        this.severity_bar_container.classList.add('severity-bar-container');
        this.div.appendChild(this.severity_bar_container);
        this.severity_bar_indicator = this.shadow.ownerDocument.createElement('div');
        this.severity_bar_indicator.classList.add('severity-bar-indicator');
        this.severity_bar_container.appendChild(this.severity_bar_indicator);
        this.severity_bar_text_div = this.shadow.ownerDocument.createElement('div');
        this.severity_bar_text_div.classList.add('severity-bar-text');
        let img_div = this.shadow.ownerDocument.createElement('div');
        img_div.classList.add('severity-display-item');
        let img = this.shadow.ownerDocument.createElement('img');
        img.classList.add('info-icon');
        img.src = webextension_polyfill_ts_1.browser.runtime.getURL('assets/info.png');
        img_div.appendChild(img);
        this.div.addEventListener('mousedown', ((x, event) => {
            this.keep_open = true;
            this.modal_window.show(true, ((x, event) => {
                this.modal_window.hide();
                this.keep_open = false;
                this.show(this.mouse_inside);
                this.on_focus_required_.value = true;
            }).bind(this));
            this.on_focus_required_.value = true;
        }).bind(this));
        this.div.addEventListener('mouseover', ((x, event) => {
            this.mouse_inside = true;
            if (!this.keep_open) {
                this.modal_window.show();
                this.show(this.mouse_inside);
            }
        }).bind(this));
        this.div.addEventListener('mouseout', ((x, event) => {
            if (!this.keep_open) {
                this.modal_window.hide();
                this.restart_fade_out_timer();
            }
            this.mouse_inside = false;
        }).bind(this));
        let span_div = this.shadow.ownerDocument.createElement('div');
        span_div.classList.add('severity-display-item');
        let span = this.shadow.ownerDocument.createElement('span');
        span.classList.add('severity-text-span');
        span.innerText = 'Persoonlijke Informatie Aanwezig';
        span_div.appendChild(span);
        this.severity_bar_text_div.appendChild(span_div);
        this.severity_bar_text_div.appendChild(img_div);
        this.severity_bar_container.appendChild(this.severity_bar_text_div);
        this.hide();
    }
    clear_fade_out_timer() {
        if (this.fade_out_timer)
            window.clearTimeout(this.fade_out_timer);
    }
    restart_fade_out_timer() {
        this.clear_fade_out_timer();
        this.fade_out_timer = window.setTimeout(() => {
            this.hide();
        }, this.hide_after_ms);
    }
    show(keep_open = false) {
        this.div.style.opacity = '1.0';
        this.div.style.height = '25px';
        this.div.style.visibility = 'visible';
        this.div.style.pointerEvents = 'auto';
        this.clear_fade_out_timer();
        if (!keep_open)
            this.restart_fade_out_timer();
    }
    hide() {
        this.div.style.opacity = '0.0';
        this.div.style.height = '0px';
        this.div.style.visibility = 'hidden';
        this.div.style.pointerEvents = 'none';
        this.keep_open = false;
        this.modal_window.hide();
    }
    get severity() {
        return this.severity_;
    }
    set severity(severity) {
        this.severity_ = severity;
        if (!this.keep_open) {
            this.severity_bar_indicator.style.width = `${(1 - severity) * 100}%`;
            if (severity == 0.0)
                this.hide();
            else
                this.show(this.mouse_inside);
        }
    }
    set pii(all_pii) {
        if (!this.keep_open)
            this.modal_window.pii = all_pii;
    }
}
exports.PIIFilterInfoOverlay = PIIFilterInfoOverlay;
;

},{"../common/observable":6,"./font_css":12,"./pii-filter-modal-window":14,"./shadow-dom":15,"webextension-polyfill-ts":1}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIIFilterModalWindow = void 0;
const webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
const shadow_dom_1 = require("./shadow-dom");
const font_css_1 = require("./font_css");
function get_dutch_name(classifier_name) {
    switch (classifier_name) {
        case 'first_name':
            return 'Voornaam';
        case 'family_name':
            return 'Achternaam';
        case 'phone_number':
            return 'Telefoonnummer';
        case 'medicine_name':
            return 'Medicijnnaam';
        case 'pet_name':
            return 'Huisdiernaam';
        case 'email_address':
            return 'E-mail adres';
        case 'date':
            return 'Datum';
        default:
            return 'Niet Herkend';
    }
}
class PIIFilterModalWindow extends shadow_dom_1.ShadowDomDiv {
    constructor(document) {
        super(document);
        let style = this.shadow.ownerDocument.createElement('style');
        style.innerText = `
            ${font_css_1.get_fonts()}

            body {
                padding:            0px;
                margin:             0px;
            }
            .modal {
                transition:         0.15s ease-in-out;
                visibility:         hidden;
                position:           fixed; 
                left:               0; 
                top:                0;
                transform:          translate(0, -25px);
                width:              100%;
                height:             100%;
                background-color:   rgba(0, 0, 0, 0.5);
                z-index:            99999;
            }
            .modal-wrap {
                transition:         0.15s ease-in-out;
                position:           fixed;
                min-width:          10cm;
                max-width:          20cm;
                width:              50%;
                left:               50%;
                top:                50%;
                transform:          translate(-50%, -50%);
                filter:             drop-shadow(0px 2px 4px #222233);
            }
            .top-styling {
                display:            flex;
                min-height:         20px;
                background-color:   rgba(15, 15, 50, 0.75);
                border:             3px solid rgba(25, 25, 60, 0.75);
                color:              white;
                vertical-align:     middle;
            }
            .center-styling {
                font-family:        'Montserrat', sans-serif;
                font-weight:        300;
                font-size:          12pt;
                background-color:   rgba(255, 255, 255, 0.975);
                min-height:         40px;
                max-height:         75vh;
                overflow:           auto;
            }
            .bottom-styling {
                font-family:        'Montserrat', sans-serif;
                font-weight:        300;
                font-size:          12pt;
                background-color:   rgba(245, 245, 245, 0.975);
                min-height:         40px;
                padding:            10px;
                padding-left:       30px;
                padding-right:      30px;
                text-align:         center;
            }
            .min-padding {
                padding:            10px;
            }
            .max-padding {
                padding:            20px;
            }
            .pii-icon {
                height:             40px;
            }
            .logo {
                display:            inline-block;
                user-select:        none;
                align-self:         center;
                margin:             0 auto;
            }
            .title {
                flex:               1;
                display:            inline-block;
                font-family:        'Montserrat', sans-serif;
                font-size:          15pt;
                font-weight:        900;
                color:              white;
                text-align:         center;
                align-self:         center;
                margin:             0 auto;
            }
            .modal-content {
                height:             100%;
            }
            .content {
                width:              100%;
                height:             100%;
            }
            .close-btn {
                display:            inline-block;
                align-self:         center;
                margin:             0 auto;
                color:              rgb(150, 150, 150);
                font-size:          24px; 
                font-weight:        bold;
                user-select:        none;
            }
            .close-btn:hover {
                color:              rgb(255, 255, 255);
            }
            table {
                table-layout:       fixed;
                color:              black;
                width:              100%;
                border:             2px solid rgba(225, 225, 225, 0.35);
            }
            table, td, th {
                border-collapse: collapse;
            }
            td, th {
                text-align:         left;
            }
            tr {
            }
            th {
                font-family:        'Montserrat', sans-serif;
                font-size:          12pt;
                font-weight:        500;
                background-color:   rgba(245, 245, 245, 0.75);
                color:              black;
                margin-bottom:      5px;
                padding-left:       7px;
                padding-right:      7px;
            }
            table th {
                border-bottom:      2.0px solid rgba(0, 0, 0, 0.4); 
                border-left:        1.5px solid rgba(100, 100, 100, 0.5);
                border-right:       1.5px solid rgba(100, 100, 100, 0.5);
            }
            table tr th:first-child {
                border-left: 0;
            }
            table tr th:last-child {
                border-right: 0;
            }

            td {
                font-family:        'Montserrat', sans-serif;
                font-weight:        250;
                font-size:          12pt;
                padding-left:       5px;
                word-wrap:          anywhere;
            }
            table td {
                border:             1.5px solid rgba(225, 225, 225, 0.6);
            }
            table tr:first-child td {
                border-top:         0;
            }
            table tr td:first-child {
                border-left:        0;
            }
            table tr:last-child td {
                border-bottom:      0;
            }
            table tr td:last-child {
                border-right:       0;
            }
        `;
        this.shadow.appendChild(style);
        this.div.classList.add('modal');
        this.modal_wrap = this.shadow.ownerDocument.createElement('div');
        this.modal_wrap.classList.add('modal-wrap');
        this.div.appendChild(this.modal_wrap);
        let modal_content_top = this.shadow.ownerDocument.createElement('div');
        modal_content_top.classList.add('modal-content', 'top-styling', 'min-padding');
        let img_div = this.shadow.ownerDocument.createElement('div');
        img_div.classList.add('logo');
        let img = this.shadow.ownerDocument.createElement('img');
        img.classList.add('pii-icon');
        img.src = webextension_polyfill_ts_1.browser.runtime.getURL('assets/logos/a/PIIlogo.png');
        img_div.appendChild(img);
        modal_content_top.appendChild(img_div);
        this.title_div = this.shadow.ownerDocument.createElement('div');
        this.title_div.classList.add('title');
        modal_content_top.appendChild(this.title_div);
        this.close_btn = this.shadow.ownerDocument.createElement('div');
        this.close_btn.classList.add('close-btn');
        this.close_btn.innerHTML = '&times;';
        this.close_btn.style.visibility = 'none';
        this.close_btn.addEventListener('mousedown', ((x, event) => {
            if (this.on_closed != null)
                this.on_closed(x, event);
        }).bind(this));
        modal_content_top.appendChild(this.close_btn);
        this.modal_wrap.appendChild(modal_content_top);
        let modal_content_center = this.shadow.ownerDocument.createElement('div');
        modal_content_center.classList.add('modal-content', 'center-styling', 'max-padding');
        this.content_div = this.shadow.ownerDocument.createElement('div');
        this.content_div.classList.add('content');
        modal_content_center.appendChild(this.content_div);
        this.modal_wrap.appendChild(modal_content_center);
        let modal_content_bottom = this.shadow.ownerDocument.createElement('div');
        modal_content_bottom.classList.add('modal-content', 'bottom-styling');
        modal_content_bottom.innerText = 'Wees waakzaam met het delen van persoonlijke informatie op sociale media,' +
            ' webshops, blogposts en in comments en reviews.';
        this.modal_wrap.appendChild(modal_content_bottom);
        this.hide();
    }
    set pii(all_pii) {
        // create table of personally identifiable information
        this.content_div.innerHTML = '';
        if (all_pii.length == 0) {
            return;
        }
        let table = this.shadow.ownerDocument.createElement('table');
        let header_row = this.shadow.ownerDocument.createElement('tr');
        for (let header of ['Informatietype', 'Waarde']) {
            let col = this.shadow.ownerDocument.createElement('th');
            col.innerText = header;
            header_row.appendChild(col);
        }
        table.appendChild(header_row);
        for (const pii of all_pii) {
            let row_raw = [
                get_dutch_name(pii.type),
                pii.value
            ];
            let inv_severity = (1.0 - pii.severity) * 255;
            let row = this.shadow.ownerDocument.createElement('tr');
            row.style.background = `rgb(255, ${inv_severity}, ${inv_severity})`;
            for (let col_raw of row_raw) {
                let col = this.shadow.ownerDocument.createElement('td');
                col.innerText = col_raw;
                row.appendChild(col);
            }
            table.appendChild(row);
        }
        this.content_div.appendChild(table);
    }
    show(with_close_button = false, fn = null) {
        if (with_close_button) {
            this.close_btn.style.visibility = 'visible';
            this.on_closed = fn;
        }
        else {
            this.close_btn.style.visibility = 'hidden';
        }
        this.modal_wrap.style.top = '50%';
        this.div.style.opacity = '1.0';
        this.div.style.visibility = 'visible';
        this.div.style.pointerEvents = 'auto';
    }
    hide() {
        // this.modal_wrap.style.top =     '55%';
        this.div.style.opacity = '0.0';
        this.div.style.visibility = 'hidden';
        this.div.style.pointerEvents = 'none';
    }
}
exports.PIIFilterModalWindow = PIIFilterModalWindow;
;

},{"./font_css":12,"./shadow-dom":15,"webextension-polyfill-ts":1}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowDomDiv = exports.ShadowDom = void 0;
class ShadowDom {
    /**
    * creates a shadow div and adds it to the front of the document
    * @param document the document
    */
    constructor(document, insert_at = document.body.children[0], // TODO: what if this is empty?
    insert_after = false) {
        this.document = document;
        this.root_div = this.document.createElement("div");
        this.shadow = this.root_div.attachShadow({ mode: 'open' });
        if (insert_after)
            insert_at.insertAdjacentElement('afterend', this.root_div);
        else
            insert_at.insertAdjacentElement('beforebegin', this.root_div);
    }
    /**
     * removes previous DOM modifications and returns null
     */
    remove() {
        this.root_div.remove();
    }
}
exports.ShadowDom = ShadowDom;
;
class ShadowDomDiv extends ShadowDom {
    /**
    * creates a shadow div and adds it to the front of the document
    * @param document the document
    */
    constructor(document, insert_at = document.body.children[0], // TODO: what if this is empty?
    insert_after = false) {
        super(document, insert_at, insert_after);
        this.document = document;
        this.div = this.document.createElement("div");
        this.shadow.appendChild(this.div);
    }
    /**
     * set the visibility
     */
    set visibility(visible) {
        this.div.style.visibility = visible ? 'visible' : 'hidden';
    }
    /**
     * removes previous DOM modifications and returns null
     */
    remove() {
        this.root_div.remove();
        super.remove();
    }
}
exports.ShadowDomDiv = ShadowDomDiv;
;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractHighlightTextEntrySource = void 0;
const rect_1 = require("../../common/rect");
const bindings_1 = require("../bindings");
const element_observer_1 = require("../element_observer");
class AbstractHighlightTextEntrySource {
    constructor(element, polling_interval) {
        this.element = element;
        this.polling_interval = polling_interval;
        this.value = '';
        this.scroll = [0, 0];
        this.rect = new rect_1.Rect();
        this.viewport_o = new rect_1.Rect();
        this.viewport_i = new rect_1.Rect();
        this.bindings = new bindings_1.Bindings();
    }
    //! only allow init once
    init(document, shadow, highlighter) {
        this.document = document;
        this.shadow = shadow;
        this.highlighter = highlighter;
        this.on_init();
        let last_rect = new rect_1.Rect();
        this.element_observer = new element_observer_1.ElementObserver(document, shadow, this.element, this.polling_interval, (rect) => {
            const pos_changed = (rect.left_absolute != last_rect.left_absolute ||
                rect.top_absolute != last_rect.top_absolute);
            const size_changed = (rect.width != last_rect.width ||
                rect.height != last_rect.height ||
                rect.scroll_width != last_rect.scroll_width ||
                rect.scroll_height != last_rect.scroll_height);
            this.on_rect_changed(rect, pos_changed, size_changed);
            last_rect = rect;
        }, (changes, all) => { this.on_style_changed(changes, all); });
        this.highlighter.set_text_entry_source(this);
    }
    remove() {
        this.element_observer.remove();
        this.bindings.remove();
        this.highlighter.set_text_entry_source(null);
    }
}
exports.AbstractHighlightTextEntrySource = AbstractHighlightTextEntrySource;
;

},{"../../common/rect":7,"../bindings":9,"../element_observer":11}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxHighlightContentParser = void 0;
const box_highlight_range_1 = require("./box-highlight-range");
class BoxHighlightContentParser {
    constructor(parse_content) {
        this.parse_content = parse_content;
    }
    set_highlighter(highlighter) {
        this.highlighter = highlighter;
    }
    resolve_content(content, resolver) {
        this.parse_content(content, (ranges) => {
            resolver({
                ranges: ranges,
                make_highlight: (highlight_range, doc_range) => {
                    return new box_highlight_range_1.BoxHighlightRange(highlight_range, doc_range);
                }
            });
        });
    }
}
exports.BoxHighlightContentParser = BoxHighlightContentParser;
;

},{"./box-highlight-range":18}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxHighlightRange = void 0;
;
class BoxHighlightRange {
    constructor(range, _document_range) {
        this._document_range = _document_range;
        this.divs = new Array();
        this.range_adjusted = false;
        this.update_range(range);
    }
    get document_range() {
        if (this.range_adjusted) {
            this._document_range.setStart(this.containers[0] || this._document_range.startContainer, this.current_range.start);
            this._document_range.setEnd(this.containers[1] || this._document_range.endContainer, this.current_range.end);
            this.range_adjusted = false;
        }
        return this._document_range;
    }
    update_range(range) {
        this.current_range = range;
        this.color = [255, 0, 0, 0.1 + this.current_range.intensity * 0.65];
    }
    adjust_range(start = this.current_range.start, end = this.current_range.end, start_container = this.document_range.endContainer, end_container = this.document_range.endContainer) {
        this.current_range.start = start;
        this.current_range.end = end;
        this.containers = [start_container, end_container];
        this.range_adjusted = true;
    }
    render(highlighter, document, range_rect) {
        console.log(range_rect, this.document_range);
        if (this.divs_container == null) {
            this.divs_container = document.createElement('div');
            this.divs_container.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: visible;
                visibility: hidden;
                background-color: rgba(255, 255, 255, 0.0);
                transition: background-color 0.25s ease-in-out;
                z-index: 999999;
            `);
            highlighter.highlights.appendChild(this.divs_container);
            const t = window.setTimeout(() => {
                const [r, g, b, a] = this._color;
                const c_string = `rgba(${r},${g},${b},${a})`;
                this.divs_container.style.backgroundColor = c_string;
                window.clearTimeout(t);
            }, 0);
        }
        this.divs_container.style.left = `${(range_rect.left + window.scrollX) - highlighter.highlights_rect_rel.left}px`;
        this.divs_container.style.top = `${(range_rect.top + window.scrollY) - highlighter.highlights_rect_rel.top}px`;
        const dom_rects = this.document_range.getClientRects();
        while (dom_rects.length > this.divs.length) {
            const element = document.createElement('div');
            element.setAttribute('style', `
                display: block;
                position: absolute;
                display: block;
                visibility: visible;
                background-color: inherit;
            `);
            this.divs_container.appendChild(element);
            this.divs.push(element);
        }
        while (dom_rects.length < this.divs.length)
            this.divs.pop().remove();
        for (let i = 0; i < this.divs.length; ++i) {
            const new_rect = dom_rects.item(i);
            const div = this.divs[i];
            div.style.left = `${new_rect.left - range_rect.left}px`;
            div.style.top = `${new_rect.top - range_rect.top}px`;
            div.style.width = `${new_rect.width}px`;
            div.style.height = `${new_rect.height}px`;
        }
    }
    set color(c) {
        this._color = c;
        if (this.divs_container != null) {
            const [r, g, b, a] = this._color;
            const c_string = `rgba(${r},${g},${b},${a})`;
            this.divs_container.style.backgroundColor = c_string;
        }
    }
    remove() {
        if (this.divs_container != null) {
            this.divs_container.remove();
            this.divs_container = null;
        }
        if (this.divs.length > 0) {
            for (const div of this.divs)
                div.remove();
            this.divs = new Array();
        }
    }
}
exports.BoxHighlightRange = BoxHighlightRange;
;

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightTextEntryMutationType = void 0;
var HighlightTextEntryMutationType;
(function (HighlightTextEntryMutationType) {
    HighlightTextEntryMutationType[HighlightTextEntryMutationType["change"] = 0] = "change";
    HighlightTextEntryMutationType[HighlightTextEntryMutationType["insert"] = 1] = "insert";
    HighlightTextEntryMutationType[HighlightTextEntryMutationType["remove"] = 2] = "remove";
})(HighlightTextEntryMutationType = exports.HighlightTextEntryMutationType || (exports.HighlightTextEntryMutationType = {}));
;
;
;
;
;
;
;
;

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeHighlighter = void 0;
const highlighter_1 = require("./highlighter");
const array_diff_1 = require("../../common/array-diff");
const rect_1 = require("../../common/rect");
class RangeHighlighter {
    constructor() {
        this.ranges = new Array();
        this.highlights_rect_rel = new rect_1.Rect();
    }
    set_content_parser(content_parser) {
        this.content_parser = content_parser;
    }
    remove() {
        this.remove_ranges(this.ranges);
        this.ranges = new Array();
        if (this.viewport != null) {
            this.viewport.remove();
            this.viewport = null;
        }
        if (this.highlights_viewport != null) {
            this.highlights_viewport.remove();
            this.highlights_viewport = null;
        }
        if (this.highlights != null) {
            this.highlights.remove();
            this.highlights = null;
        }
        this.active_promise = null;
    }
    update_ranges(ranges, render = true) {
        for (const range of ranges) {
            const index = this.ranges.findIndex((value) => {
                return value.start == range.start && value.end == range.end;
            });
            if (index > -1)
                this.ranges[index].highlight.update_range(range);
        }
        if (render)
            this.render();
    }
    set_ranges(ranges_constructor, adjust_overlapping_ranges = false) {
        // add / remove only what is necessary
        const result = array_diff_1.calc_array_diff(ranges_constructor.ranges, this.ranges, (lhs, rhs) => {
            return lhs.start == rhs.start &&
                lhs.end == rhs.end;
        });
        this.remove_ranges(result.removed, false);
        this.add_ranges({
            ranges: result.added,
            make_highlight: ranges_constructor.make_highlight
        }, false);
        if (adjust_overlapping_ranges) {
            for (let range of result.overlap) {
                const index = this.ranges.findIndex((value) => {
                    return value.start == range.start && value.end == range.end;
                });
                if (index > -1) {
                    range.start = this.ranges[index].highlight.current_range.start;
                    range.end = this.ranges[index].highlight.current_range.end;
                }
            }
        }
        this.update_ranges(result.overlap, false);
        this.render();
    }
    remove_ranges(ranges, render = true) {
        for (const removed of ranges) {
            const index = this.ranges.indexOf(removed);
            if (index > -1) {
                // remove range
                this.ranges[index].highlight.remove();
                this.ranges.splice(index, 1);
            }
        }
        if (render)
            this.render();
    }
    add_ranges(ranges_constructor, render = true) {
        if (this.text_entry_source != null) {
            const text_len = this.text_entry_source.value.length;
            let last_insert_index;
            let last_element;
            if (ranges_constructor.ranges.length > 0) {
                // insert in sorted order
                for (const added of ranges_constructor.ranges) {
                    // skip invalid ranges
                    if (added.start < 0 ||
                        added.end < 0 ||
                        added.end < added.start ||
                        added.start >= text_len ||
                        added.end > text_len)
                        continue;
                    let i = (last_element != null && last_element.start <= added.start) ? last_insert_index : 0;
                    let insert_index;
                    for (i; i < this.ranges.length; ++i) {
                        const element = this.ranges[i];
                        if (element.start > added.start) {
                            insert_index = i;
                            break;
                        }
                    }
                    const highlighted_range = {
                        start: added.start,
                        end: added.end,
                        highlight: ranges_constructor.make_highlight(added, this.text_entry_source.get_range(added.start, added.end))
                    };
                    if (insert_index != null)
                        this.ranges.splice(insert_index, 0, highlighted_range);
                    else
                        this.ranges.push(highlighted_range);
                }
                if (render)
                    this.render();
            }
        }
    }
    set_text_entry_source(text_entry_source) {
        this.remove();
        this.content_id = 0;
        this.text_entry_source = text_entry_source;
        if (this.text_entry_source != null) {
            this.viewport = this.text_entry_source.document.createElement('div');
            this.highlights_viewport = this.text_entry_source.document.createElement('div');
            this.highlights = this.text_entry_source.document.createElement('div');
            this.viewport.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: hidden;
                visibility: hidden;
                pointer-events: none;
            `);
            this.highlights_viewport.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: hidden;
                visibility: hidden;
                pointer-events: none;
                z-index: 99999;
            `);
            this.highlights.setAttribute('style', `
                display: block;
                position: absolute;
                overflow: visible;
                visibility: visible;
                pointer-events: none;
                z-index: 99999;
            `);
            this.highlights_viewport.appendChild(this.highlights);
            this.viewport.appendChild(this.highlights_viewport);
            this.text_entry_source.shadow.appendChild(this.viewport);
            this.update_scroll();
            this.update_layout();
            this.stage_new_content();
        }
    }
    update_content(mutations) {
        if (this.text_entry_source != null) {
            for (const mutation of mutations) {
                switch (mutation.type) {
                    case highlighter_1.HighlightTextEntryMutationType.change:
                        {
                            // TODO: diff, for now just update all elements
                            // another cheap solution would be to compare start strings and rm everything after first diff
                            // also undo/redo etc.
                            for (const range of this.ranges)
                                range.highlight.adjust_range();
                            break;
                        }
                    case highlighter_1.HighlightTextEntryMutationType.insert:
                        {
                            const mutation_start = mutation.index;
                            for (const range of this.ranges) {
                                const range_start = range.highlight.current_range.start;
                                const range_end = range.highlight.current_range.end;
                                const range_within = mutation_start > range_start && mutation_start < range_end;
                                if (range_within) { //? should highlight grow like this?
                                    range.highlight.adjust_range(range_start, range_end + mutation.length);
                                }
                                else if (range_start >= mutation_start) {
                                    range.highlight.adjust_range(range_start + mutation.length, range_end + mutation.length);
                                }
                                else //! on replacing of selection this is called twice for some elements... fix?
                                    range.highlight.adjust_range();
                            }
                            break;
                        }
                    case highlighter_1.HighlightTextEntryMutationType.remove:
                        {
                            const mutation_start = mutation.index;
                            const mutation_end = mutation.index + mutation.length;
                            this.ranges = this.ranges.filter((range, index) => {
                                const range_start = range.highlight.current_range.start;
                                const range_end = range.highlight.current_range.end;
                                const start_contained = range_start >= mutation_start && range_start < mutation_end;
                                const end_contained = range_end > mutation_start && range_end <= mutation_end;
                                const range_within = mutation_start > range_start && mutation_end < range_end;
                                // TODO: insert?
                                if (start_contained && end_contained) { // range needs to be removed
                                    range.highlight.remove();
                                    return false;
                                }
                                else if (start_contained) { // range needs to be shortened
                                    range.highlight.adjust_range(mutation_start, range_end - mutation.length);
                                }
                                else if (end_contained) { // range needs to be shortened
                                    range.highlight.adjust_range(range_start, mutation_start);
                                }
                                else if (range_within) { // range needs to be shortened
                                    range.highlight.adjust_range(range_start, range_end - mutation.length);
                                }
                                else if (range_start >= mutation_end) { // offset range
                                    range.highlight.adjust_range(range_start - mutation.length, range_end - mutation.length);
                                }
                                else
                                    range.highlight.adjust_range();
                                return true;
                            });
                            break;
                        }
                    default: break;
                }
            }
            this.render();
            this.stage_new_content();
        }
    }
    stage_new_content() {
        this.content_id++;
        if (this.text_entry_source != null && this.active_promise == null) {
            const stage_id = this.content_id;
            const source = this.text_entry_source;
            // sync adjusted range values for comparison on return
            for (let range of this.ranges) {
                range.start = range.highlight.current_range.start;
                range.end = range.highlight.current_range.end;
            }
            this.active_promise = new Promise((resolve) => {
                this.content_parser.resolve_content(this.text_entry_source.value, (ranges_constructor) => {
                    resolve(ranges_constructor);
                });
            });
            this.active_promise.then((ranges_constructor) => {
                (async () => {
                    this.active_promise = null;
                    if (this.text_entry_source === source) {
                        this.set_ranges(ranges_constructor, true);
                        if (stage_id != this.content_id) { // recurse
                            this.stage_new_content();
                        }
                        return ranges_constructor;
                    }
                })();
            }, (reason) => {
            });
        }
    }
    update_rect() {
        if (this.text_entry_source != null) {
            this.text_entry_source.viewport_o.apply_to_element(this.viewport, true, true);
            const pd_left = this.text_entry_source.viewport_i.left - this.text_entry_source.viewport_o.left;
            const pd_top = this.text_entry_source.viewport_i.top - this.text_entry_source.viewport_o.top;
            const width_i = this.text_entry_source.viewport_i.width;
            const height_i = this.text_entry_source.viewport_i.height;
            this.highlights_rect_rel.left = pd_left;
            this.highlights_rect_rel.top = pd_top;
            this.highlights_rect_rel.width = width_i;
            this.highlights_rect_rel.height = height_i;
            this.highlights_viewport.style.left = `${pd_left}px`;
            this.highlights_viewport.style.top = `${pd_top}px`;
            this.highlights_viewport.style.width = `${width_i}px`;
            this.highlights_viewport.style.height = `${height_i}px`;
            // this.text_entry_source.viewport_i.apply_to_element(this.highlights_viewport, true, true);
            // this.highlights_viewport.style.backgroundColor = 'rgba(0, 255, 0, 0.4)';
            // this.text_entry_source.viewport_o.apply_position_to_element(this.highlights, true);
            this.update_scroll();
        }
    }
    async update_position() {
        this.update_rect();
    }
    async update_scroll() {
        const render_scroll = () => {
            const [scroll_x, scroll_y] = this.text_entry_source.scroll;
            return this.render().then(() => {
                this.rendering_scroll = null;
                if (this.text_entry_source != null) {
                    const [new_scroll_x, new_scroll_y] = this.text_entry_source.scroll;
                    if (new_scroll_x != scroll_x || new_scroll_y != scroll_y) { // recurse
                        this.update_scroll();
                    }
                }
            });
        };
        if (this.text_entry_source != null) {
            if (this.scroll_update_timeout != null)
                window.clearTimeout(this.scroll_update_timeout);
            this.scroll_update_timeout = window.setTimeout(() => {
                if (this.rendering_scroll == null)
                    this.rendering_scroll = render_scroll();
            }, 500);
            const [scroll_x, scroll_y] = this.text_entry_source.scroll;
            this.highlights.style.left = `${-scroll_x}px`;
            this.highlights.style.top = `${-scroll_y}px`;
        }
    }
    async update_layout() {
        if (this.text_entry_source != null) {
            this.update_rect();
            this.render();
        }
    }
    // protected last_visible_range: [number, number] = [0, 0];
    async render() {
        // const rect_intersects_vp = (rect: DOMRect) =>
        // {
        //     const [scroll_x, scroll_y] = this.text_entry_source.scroll;
        //     return (!(rect.bottom - scroll_y < this.highlights_rect_rel.top ||
        //         rect.top - scroll_y >  this.highlights_rect_rel.bottom ||
        //         rect.left - scroll_x > this.highlights_rect_rel.right ||
        //         rect.right - scroll_x < this.highlights_rect_rel.left));
        // }
        // if (this.text_entry_source != null)
        // {
        //     const ranges_len: number = this.ranges.length;
        //     let range_extent: [number, number] = [
        //         Math.min(this.last_visible_range[0], ranges_len-1),
        //         Math.min(this.last_visible_range[1], ranges_len-1)
        //     ]
        //     // scroll direction?
        //     const new_ranges: [number, number] = [null, null];
        //     const middle_index: number = range_extent[0] + Math.round((range_extent[1]-range_extent[0]) / 2)
        //     for (let i: number = 0; i < ranges_len; ++i)
        //     {
        //         const left_index: number = middle_index - i;
        //         const right_index: number = middle_index + i;
        //         let left_range: HighlightedRange, right_range: HighlightedRange;
        //         if (left_index >= 0)
        //         {
        //             left_range = this.ranges[left_index];
        //             const range_rect: DOMRect = left_range.highlight.document_range.getBoundingClientRect();
        //             if (rect_intersects_vp(range_rect))
        //             {
        //                 new_ranges[0] = new_ranges[0] == null ? left_index : Math.min(new_ranges[0], left_index);
        //                 new_ranges[1] = new_ranges[1] == null ? left_index : Math.max(new_ranges[1], left_index);
        //                 left_range.highlight.render(this, this.text_entry_source.document, range_rect);
        //             }
        //         }
        //         if (right_index < ranges_len)
        //         {
        //             right_range = this.ranges[right_index];
        //             const range_rect: DOMRect = right_range.highlight.document_range.getBoundingClientRect();
        //             if (rect_intersects_vp(range_rect))
        //             {
        //                 new_ranges[0] = new_ranges[0] == null ? right_index : Math.min(new_ranges[0], right_index);
        //                 new_ranges[1] = new_ranges[1] == null ? right_index : Math.max(new_ranges[1], right_index);
        //                 right_range.highlight.render(this, this.text_entry_source.document, range_rect);
        //             }
        //         }
        //         if (new_ranges[0] != null && new_ranges[1] != null &&
        //             left_range == null && right_range == null)
        //             break;
        //     }
        //     if (new_ranges[0] != null && new_ranges[1] != null)
        //     {
        //         // todo optimize this
        //         for (let i: number = this.last_visible_range[0];
        //              i < Math.min(this.last_visible_range[1] + 1, ranges_len); ++i)
        //         {
        //             if (i < new_ranges[0] || i > new_ranges[1])
        //                 this.ranges[i].highlight.remove();
        //         }
        //         this.last_visible_range = new_ranges;
        //     }
        // remove last visible range
        // console.log(this.last_visible_range)
        // update before range and set limit
        // update range and check if there is limit
        // update after range and set limit
        if (this.text_entry_source != null) {
            for (const range of this.ranges) {
                const [scroll_x, scroll_y] = this.text_entry_source.scroll;
                const range_rect = range.highlight.document_range.getBoundingClientRect();
                // if (!(range_rect.bottom - scroll_y < this.highlights_rect_rel.top ||
                //     range_rect.top - scroll_y >  this.highlights_rect_rel.bottom ||
                //     range_rect.left - scroll_x > this.highlights_rect_rel.right ||
                //     range_rect.right - scroll_x < this.highlights_rect_rel.left))
                {
                    range.highlight.render(this, this.text_entry_source.document, range_rect);
                }
                // else
                // {
                //     range.highlight.remove();
                // }
            }
        }
    }
}
exports.RangeHighlighter = RangeHighlighter;
;

},{"../../common/array-diff":3,"../../common/rect":7,"./highlighter":19}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextEntryHighlighter = void 0;
const bindings_1 = require("../bindings");
const text_area_1 = require("./text-entry-sources/text-area");
const input_1 = require("./text-entry-sources/input");
const contenteditable_1 = require("./text-entry-sources/contenteditable");
class TextEntryHighlighter {
    constructor(document, highlighter, content_parser) {
        this.document = document;
        this.highlighter = highlighter;
        this.content_parser = content_parser;
        this.bindings = new bindings_1.Bindings();
        // bind highlighter and content parser
        this.content_parser.set_highlighter(highlighter);
        this.highlighter.set_content_parser(this.content_parser);
        // create shadow
        this.root_div = this.document.createElement("div");
        this.shadow = this.root_div.attachShadow({ mode: 'open' });
        document.body.lastElementChild.insertAdjacentElement('afterend', this.root_div);
        // catch focus
        this.bindings.bind_event(document, 'focusin', (event) => {
            const target_element = event.target;
            // delete old interface
            if (this.source != null)
                this.source.remove();
            const polling_interval = 1500;
            const add_interface = (event) => {
                target_element.removeEventListener('mouseup', add_interface);
                target_element.removeEventListener('keyup', add_interface);
                if (target_element.nodeName == 'INPUT')
                    this.source = new input_1.HighlightInputSource(target_element, polling_interval);
                else if (target_element.nodeName == 'TEXTAREA')
                    this.source = new text_area_1.HighlightTextAreaSource(target_element, polling_interval);
                else if (target_element.isContentEditable)
                    this.source = new contenteditable_1.HighlightContentEditableSource(target_element, polling_interval);
                else
                    return;
                // bind interface removal
                for (let event_name of ['blur', 'focusout']) {
                    const on_blur = (event) => {
                        this.remove_source();
                        target_element.removeEventListener(event_name, on_blur);
                    };
                    target_element.addEventListener(event_name, on_blur);
                }
                // initialize
                this.source.init(this.document, this.shadow, this.highlighter);
                console.log('bound');
            };
            target_element.addEventListener('mouseup', add_interface);
            target_element.addEventListener('keyup', add_interface);
        });
    }
    remove_source() {
        if (this.source != null) {
            this.source.remove();
            this.source = null;
            console.log('released');
        }
    }
    remove() {
        this.bindings.remove();
    }
}
exports.TextEntryHighlighter = TextEntryHighlighter;
;

},{"../bindings":9,"./text-entry-sources/contenteditable":22,"./text-entry-sources/input":23,"./text-entry-sources/text-area":24}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightContentEditableSource = void 0;
const abstract_highlight_text_entry_source_1 = require("../abstract-highlight-text-entry-source");
const rect_1 = require("../../../common/rect");
const highlighter_1 = require("../highlighter");
function get_scrollbar_width(document) {
    // invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    //? should this be on a shadow?
    document.body.appendChild(outer);
    //inner element
    const inner = document.createElement('div');
    outer.appendChild(inner);
    // calc width
    const width = (outer.getBoundingClientRect().width - inner.getBoundingClientRect().width);
    // remove element
    outer.remove();
    return width;
}
const re_ignore_css_props = new RegExp('(' + [
    'animation',
    'transition',
    'margin',
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'margin-block-start',
    'margin-block-end',
    'margin-inline-start',
    'margin-inline-end',
    'visibility',
    'position',
    'top',
    'left',
    'bottom',
    'right',
    'max-width',
    'max-height',
    'transform',
    'max-inline-size',
    'max-block-size',
    'width',
    'height'
].join('|') + ')', 'i');
class HighlightContentEditableSource extends abstract_highlight_text_entry_source_1.AbstractHighlightTextEntrySource {
    constructor(element, polling_interval) {
        super(element, polling_interval);
        this.selection = [0, 0];
    }
    on_init() {
        const get_str = () => {
            const range = this.document.createRange();
            range.selectNode(this.element);
            return range.toString();
        };
        this.value = get_str();
        this.computed_style = window.getComputedStyle(this.element);
        this.bindings.bind_event(this.element, 'change', (event) => {
            this.value = get_str();
            const mutations = [{
                    type: highlighter_1.HighlightTextEntryMutationType.change,
                }];
            this.update_content(mutations);
        });
        this.bindings.bind_event(this.element, 'input', (event) => {
            const input_event = event;
            const old_text = this.value;
            const new_text = get_str();
            this.value = new_text;
            const length_diff = new_text.length - old_text.length;
            const length_diff_abs = Math.abs(length_diff);
            const type = input_event.inputType.toLocaleLowerCase();
            let mutations = [];
            const replacing_selection = this.selection[0] !=
                this.selection[1];
            // very basic input handling
            if (replacing_selection) {
                mutations.push({
                    type: highlighter_1.HighlightTextEntryMutationType.remove,
                    index: this.selection[0],
                    length: this.selection[1] - this.selection[0]
                });
            }
            if (type.includes('insert') && length_diff > 0) {
                // TODO check for all types and add correct logic here
                mutations.push({
                    type: highlighter_1.HighlightTextEntryMutationType.insert,
                    index: this.selection[0],
                    length: length_diff_abs
                });
            }
            else if (type.includes('delete') && length_diff < 0) {
                if (!replacing_selection) {
                    if (type.includes('backward')) {
                        mutations.push({
                            type: highlighter_1.HighlightTextEntryMutationType.remove,
                            index: this.selection[0] - length_diff_abs,
                            length: length_diff_abs
                        });
                    }
                    else { // all other is considered forwards for now
                        mutations.push({
                            type: highlighter_1.HighlightTextEntryMutationType.remove,
                            index: this.selection[0],
                            length: length_diff_abs
                        });
                    }
                }
            }
            else {
                // TODO:
                // https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes and undo stack
                // or diff
                mutations.push({
                    type: highlighter_1.HighlightTextEntryMutationType.change,
                });
            }
            this.update_content(mutations);
        });
        // sync scroll 
        const sync_scroll = () => {
            this.scroll = [
                this.element.scrollLeft,
                this.element.scrollTop
            ];
            this.highlighter.update_scroll();
        };
        this.bindings.bind_event(this.element, 'scroll', (event) => {
            sync_scroll();
        });
        sync_scroll();
    }
    ;
    update_content(mutations) {
        this.highlighter.update_content(mutations);
        // slows things down considerably
        // if (this.rect.scroll_width != this.element.scrollWidth ||
        //     this.rect.scroll_height != this.element.scrollHeight)
        // {
        //     let rect_copy = Rect.copy(this.rect);
        //     rect_copy.scroll_width = this.element.scrollWidth;
        //     rect_copy.scroll_height = this.element.scrollHeight;
        //     this.on_rect_changed(
        //         rect_copy,
        //         false,
        //         true
        //     );
        // }
    }
    remove() {
        super.remove();
    }
    on_rect_changed(rect, position_changed, size_changed) {
        this.rect = rect;
        this.viewport_o = rect_1.Rect.copy(this.rect);
        this.viewport_o.left += this.element.clientLeft;
        this.viewport_o.top += this.element.clientTop;
        const overflowing_y = this.element.scrollHeight != this.element.clientHeight;
        this.viewport_o.width = this.rect.width - ((overflowing_y ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderLeftWidth) +
            parseFloat(this.computed_style.borderRightWidth));
        const overflowing_x = this.element.scrollWidth != this.element.clientWidth;
        this.viewport_o.height = this.rect.height - ((overflowing_x ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderTopWidth) +
            parseFloat(this.computed_style.borderBottomWidth));
        // this.mirror.style.width =          `${this.viewport_o.width}px`;
        // this.mirror.style.height =         `${this.viewport_o.height}px`;
        // //?
        // this.mirror.style.paddingLeft =     this.computed_style.paddingLeft;
        // this.mirror.style.paddingTop =      this.computed_style.paddingTop;
        // this.mirror.style.paddingRight =    this.computed_style.paddingRight;
        // this.mirror.style.paddingBottom =   this.computed_style.paddingBottom;
        this.viewport_i = rect_1.Rect.copy(this.viewport_o);
        if (true) //! TODO: check if firefox
         {
            const pd_l = parseFloat(this.computed_style.paddingLeft);
            const pd_t = parseFloat(this.computed_style.paddingTop);
            const pd_r = parseFloat(this.computed_style.paddingRight);
            const pd_b = parseFloat(this.computed_style.paddingBottom);
            this.viewport_i.top += pd_t;
            this.viewport_i.left += pd_l;
            this.viewport_i.width -= pd_l + pd_r;
            this.viewport_i.height -= pd_t + pd_b;
        }
        if (position_changed)
            this.highlighter.update_position();
        if (size_changed)
            this.highlighter.update_layout();
    }
    on_style_changed(changes, all) {
        // for (let [key, value] of changes)
        // {
        //     if (!re_ignore_css_props.test(key))
        //         Reflect.set(this.mirror.style, key, value);
        // }
        // this.mirror.style.boxSizing =      'border-box';
        // this.mirror.style.overflow =       'visible';
        // this.mirror.style.textRendering =  'geometricPrecision';
        // this.mirror.style.border =         'none';
        // set defaults
        // if (!all.has('white-space')) //!? TODO
        //     this.mirror.style.whiteSpace =   'pre-wrap';
        // if (!all.has('word-wrap'))
        //     this.mirror.style.wordWrap =     'break-word';
        // if (!all.has('line-height'))
        //     this.mirror.style.lineHeight =   'normal';
        // this.mirror.style.cssText +=         'appearance: textarea;'; //?
        // this.mirror.style.pointerEvents =    'none';
        this.highlighter.update_layout();
    }
    get_range(start_index, end_index) {
        let range = this.document.createRange();
        // let t_range: Range = this.document.createRange();
        // let node: Node = this.element.firstChild;
        // let index_offset: number = 0;
        // const parse_nodes = (node: Node) =>
        // {
        //     if (node.firstChild != null)
        //         parse_nodes(node.firstChild);
        //     else
        //     {
        //         t_range.selectNode(node);
        //         const len: number = t_range.toString().length;
        //         if (index_offset <= start_index && index_offset + len > start_index)
        //         {
        //             range.setStart(node, start_index - index_offset);
        //             console.log('set start', node);
        //         }
        //         if (index_offset <= end_index && index_offset + len >= start_index)
        //         {
        //             range.setEnd(node, end_index - index_offset);
        //             console.log('set end', node);
        //             return;
        //         }
        //         index_offset += len;
        //     }
        //     if (node.nextSibling != null)
        //         parse_nodes(node.nextSibling);
        // }
        // parse_nodes(node);
        // console.log(range);
        return range;
    }
}
exports.HighlightContentEditableSource = HighlightContentEditableSource;
;

},{"../../../common/rect":7,"../abstract-highlight-text-entry-source":16,"../highlighter":19}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightInputSource = void 0;
const abstract_highlight_text_entry_source_1 = require("../abstract-highlight-text-entry-source");
const rect_1 = require("../../../common/rect");
const highlighter_1 = require("../highlighter");
function get_scrollbar_width(document) {
    // invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    //? should this be on a shadow?
    document.body.appendChild(outer);
    //inner element
    const inner = document.createElement('div');
    outer.appendChild(inner);
    // calc width
    const width = (outer.getBoundingClientRect().width - inner.getBoundingClientRect().width);
    // remove element
    outer.remove();
    return width;
}
const re_ignore_css_props = new RegExp('(' + [
    'animation',
    'transition',
    'margin',
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'margin-block-start',
    'margin-block-end',
    'margin-inline-start',
    'margin-inline-end',
    'visibility',
    'position',
    'top',
    'left',
    'bottom',
    'right',
    'max-width',
    'max-height',
    'transform',
    'max-inline-size',
    'max-block-size',
    'width',
    'height'
].join('|') + ')', 'i');
class HighlightInputSource extends abstract_highlight_text_entry_source_1.AbstractHighlightTextEntrySource {
    constructor(element, polling_interval) {
        super(element, polling_interval);
        this.selection = [0, 0];
    }
    on_init() {
        this.mirror = this.document.createElement('div');
        this.shadow.appendChild(this.mirror);
        const input_element = this.element;
        this.value = input_element.value;
        this.selection = [
            Math.min(input_element.selectionStart, input_element.selectionEnd),
            Math.max(input_element.selectionStart, input_element.selectionEnd),
        ];
        // Get the scrollbar width
        this.scrollbar_width = get_scrollbar_width(this.document);
        this.text_node = this.document.createTextNode(input_element.value);
        this.computed_style = window.getComputedStyle(this.element);
        this.mirror.appendChild(this.text_node);
        // initial styling
        this.mirror.setAttribute('aria-hidden', 'true');
        this.mirror.setAttribute('style', `
            display: block;
            position: absolute;
            height: 0;
            width: 0;
            top: 0;
            height: 0;
            overflow: hidden;
            mouse-events: none;
            visibility: hidden;
        `);
        // bind selection
        for (const event_name of ['mouseup', 'keyup', 'selectionchange', 'select']) {
            this.bindings.bind_event(this.element, event_name, (event) => {
                this.selection = [
                    Math.min(input_element.selectionStart, input_element.selectionEnd),
                    Math.max(input_element.selectionStart, input_element.selectionEnd),
                ];
            });
        }
        this.bindings.bind_event(this.element, 'change', (event) => {
            const new_text = input_element.value;
            this.text_node.nodeValue = new_text;
            this.value = new_text;
            const mutations = [{
                    type: highlighter_1.HighlightTextEntryMutationType.change,
                }];
            this.update_content(mutations);
        });
        this.bindings.bind_event(this.element, 'input', (event) => {
            const input_event = event;
            const old_text = this.value;
            const new_text = input_element.value;
            this.text_node.nodeValue = new_text;
            this.value = new_text;
            const length_diff = new_text.length - old_text.length;
            const length_diff_abs = Math.abs(length_diff);
            const type = input_event.inputType.toLocaleLowerCase();
            let mutations = [];
            const replacing_selection = this.selection[0] !=
                this.selection[1];
            // very basic input handling
            if (replacing_selection) {
                mutations.push({
                    type: highlighter_1.HighlightTextEntryMutationType.remove,
                    index: this.selection[0],
                    length: this.selection[1] - this.selection[0]
                });
            }
            if (type.includes('insert') && length_diff > 0) {
                // TODO check for all types and add correct logic here
                mutations.push({
                    type: highlighter_1.HighlightTextEntryMutationType.insert,
                    index: this.selection[0],
                    length: length_diff_abs
                });
            }
            else if (type.includes('delete') && length_diff < 0) {
                if (!replacing_selection) {
                    if (type.includes('backward')) {
                        mutations.push({
                            type: highlighter_1.HighlightTextEntryMutationType.remove,
                            index: this.selection[0] - length_diff_abs,
                            length: length_diff_abs
                        });
                    }
                    else { // all other is considered forwards for now
                        mutations.push({
                            type: highlighter_1.HighlightTextEntryMutationType.remove,
                            index: this.selection[0],
                            length: length_diff_abs
                        });
                    }
                }
            }
            else {
                // TODO:
                // https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes and undo stack
                // or diff
                mutations.push({
                    type: highlighter_1.HighlightTextEntryMutationType.change,
                });
            }
            this.update_content(mutations);
        });
        // sync scroll
        const sync_scroll = () => {
            this.scroll = [
                this.element.scrollLeft,
                this.element.scrollTop
            ];
            this.highlighter.update_scroll();
        };
        this.bindings.bind_event(this.element, 'scroll', (event) => {
            sync_scroll();
        });
        sync_scroll();
    }
    ;
    update_content(mutations) {
        this.highlighter.update_content(mutations);
    }
    remove() {
        if (this.mirror != null)
            this.mirror.remove();
        if (this.text_node != null)
            this.text_node.remove();
        super.remove();
    }
    on_rect_changed(rect, position_changed, size_changed) {
        this.rect = rect;
        this.viewport_o = rect_1.Rect.copy(this.rect);
        this.viewport_o.left += this.element.clientLeft;
        this.viewport_o.top += this.element.clientTop;
        const overflowing_y = false; //this.element.scrollHeight != this.element.clientHeight;
        this.viewport_o.width = this.rect.width - ((overflowing_y ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderLeftWidth) +
            parseFloat(this.computed_style.borderRightWidth));
        const overflowing_x = false; //this.element.scrollWidth != this.element.clientWidth;
        this.viewport_o.height = this.rect.height - ((overflowing_x ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderTopWidth) +
            parseFloat(this.computed_style.borderBottomWidth));
        this.mirror.style.width = `${this.viewport_o.width}px`;
        this.mirror.style.height = `${this.viewport_o.height}px`;
        //?
        this.mirror.style.paddingLeft = this.computed_style.paddingLeft;
        this.mirror.style.paddingTop = this.computed_style.paddingTop;
        this.mirror.style.paddingRight = this.computed_style.paddingRight;
        this.mirror.style.paddingBottom = this.computed_style.paddingBottom;
        this.viewport_i = rect_1.Rect.copy(this.viewport_o);
        if (true) //! TODO: check if firefox
         {
            const pd_l = parseFloat(this.computed_style.paddingLeft);
            const pd_t = parseFloat(this.computed_style.paddingTop);
            const pd_r = parseFloat(this.computed_style.paddingRight);
            const pd_b = parseFloat(this.computed_style.paddingBottom);
            this.viewport_i.top += pd_t;
            this.viewport_i.left += pd_l;
            this.viewport_i.width -= pd_l + pd_r;
            this.viewport_i.height -= pd_t + pd_b;
        }
        this.mirror.style.lineHeight = this.computed_style.height;
        if (position_changed)
            this.highlighter.update_position();
        if (size_changed)
            this.highlighter.update_layout();
    }
    on_style_changed(changes, all) {
        for (let [key, value] of changes) {
            if (!re_ignore_css_props.test(key))
                Reflect.set(this.mirror.style, key, value);
        }
        // TODO vert center?
        this.mirror.style.boxSizing = 'border-box';
        this.mirror.style.overflow = 'visible';
        this.mirror.style.textRendering = 'geometricPrecision';
        this.mirror.style.border = 'none';
        // set defaults
        if (!all.has('word-wrap'))
            this.mirror.style.wordWrap = 'break-word';
        this.mirror.style.cssText += 'appearance: textarea;'; //?
        this.mirror.style.pointerEvents = 'none';
        this.mirror.style.whiteSpace = 'nowrap';
        this.highlighter.update_layout();
    }
    get_range(start_index, end_index) {
        let range = this.document.createRange();
        range.setStart(this.text_node, start_index);
        range.setEnd(this.text_node, end_index);
        return range;
    }
}
exports.HighlightInputSource = HighlightInputSource;
;

},{"../../../common/rect":7,"../abstract-highlight-text-entry-source":16,"../highlighter":19}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightTextAreaSource = void 0;
const abstract_highlight_text_entry_source_1 = require("../abstract-highlight-text-entry-source");
const rect_1 = require("../../../common/rect");
const highlighter_1 = require("../highlighter");
function get_scrollbar_width(document) {
    // invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    //? should this be on a shadow?
    document.body.appendChild(outer);
    //inner element
    const inner = document.createElement('div');
    outer.appendChild(inner);
    // calc width
    const width = (outer.getBoundingClientRect().width - inner.getBoundingClientRect().width);
    // remove element
    outer.remove();
    return width;
}
const re_ignore_css_props = new RegExp('(' + [
    'animation',
    'transition',
    'margin',
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'margin-block-start',
    'margin-block-end',
    'margin-inline-start',
    'margin-inline-end',
    'visibility',
    'position',
    'top',
    'left',
    'bottom',
    'right',
    'max-width',
    'max-height',
    'transform',
    'max-inline-size',
    'max-block-size',
    'width',
    'height'
].join('|') + ')', 'i');
class HighlightTextAreaSource extends abstract_highlight_text_entry_source_1.AbstractHighlightTextEntrySource {
    constructor(element, polling_interval) {
        super(element, polling_interval);
        this.selection = [0, 0];
    }
    on_init() {
        this.mirror = this.document.createElement('div');
        this.shadow.appendChild(this.mirror);
        const text_area_element = this.element;
        this.value = text_area_element.value;
        this.selection = [
            Math.min(text_area_element.selectionStart, text_area_element.selectionEnd),
            Math.max(text_area_element.selectionStart, text_area_element.selectionEnd),
        ];
        // Get the scrollbar width
        this.scrollbar_width = get_scrollbar_width(this.document);
        this.text_node = this.document.createTextNode(text_area_element.value);
        this.computed_style = window.getComputedStyle(this.element);
        this.mirror.appendChild(this.text_node);
        // initial styling
        this.mirror.setAttribute('aria-hidden', 'true');
        this.mirror.setAttribute('style', `
            display: block;
            position: absolute;
            height: 0;
            width: 0;
            top: 0;
            height: 0;
            overflow: hidden;
            mouse-events: none;
            visibility: hidden;
        `);
        // bind selection
        for (const event_name of ['mouseup', 'keyup', 'selectionchange', 'select']) {
            this.bindings.bind_event(this.element, event_name, (event) => {
                this.selection = [
                    Math.min(text_area_element.selectionStart, text_area_element.selectionEnd),
                    Math.max(text_area_element.selectionStart, text_area_element.selectionEnd),
                ];
            });
        }
        this.bindings.bind_event(this.element, 'change', (event) => {
            const new_text = text_area_element.value;
            this.text_node.nodeValue = new_text;
            this.value = new_text;
            const mutations = [{
                    type: highlighter_1.HighlightTextEntryMutationType.change,
                }];
            this.update_content(mutations);
        });
        this.bindings.bind_event(this.element, 'input', (event) => {
            const input_event = event;
            const old_text = this.value;
            const new_text = text_area_element.value;
            this.text_node.nodeValue = new_text;
            this.value = new_text;
            const length_diff = new_text.length - old_text.length;
            const length_diff_abs = Math.abs(length_diff);
            const type = input_event.inputType.toLocaleLowerCase();
            let mutations = [];
            const replacing_selection = this.selection[0] !=
                this.selection[1];
            // very basic input handling
            if (replacing_selection) {
                mutations.push({
                    type: highlighter_1.HighlightTextEntryMutationType.remove,
                    index: this.selection[0],
                    length: this.selection[1] - this.selection[0]
                });
            }
            if (type.includes('insert') && length_diff > 0) {
                // TODO check for all types and add correct logic here
                mutations.push({
                    type: highlighter_1.HighlightTextEntryMutationType.insert,
                    index: this.selection[0],
                    length: length_diff_abs
                });
            }
            else if (type.includes('delete') && length_diff < 0) {
                if (!replacing_selection) {
                    if (type.includes('backward')) {
                        mutations.push({
                            type: highlighter_1.HighlightTextEntryMutationType.remove,
                            index: this.selection[0] - length_diff_abs,
                            length: length_diff_abs
                        });
                    }
                    else { // all other is considered forwards for now
                        mutations.push({
                            type: highlighter_1.HighlightTextEntryMutationType.remove,
                            index: this.selection[0],
                            length: length_diff_abs
                        });
                    }
                }
            }
            else {
                // TODO:
                // https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes and undo stack
                // or diff
                mutations.push({
                    type: highlighter_1.HighlightTextEntryMutationType.change,
                });
            }
            this.update_content(mutations);
        });
        // sync scroll
        const sync_scroll = () => {
            this.scroll = [
                this.element.scrollLeft,
                this.element.scrollTop
            ];
            this.highlighter.update_scroll();
        };
        this.bindings.bind_event(this.element, 'scroll', (event) => {
            sync_scroll();
        });
        sync_scroll();
    }
    ;
    update_content(mutations) {
        this.highlighter.update_content(mutations);
        // slows things down considerably
        // if (this.rect.scroll_width != this.element.scrollWidth ||
        //     this.rect.scroll_height != this.element.scrollHeight)
        // {
        //     let rect_copy = Rect.copy(this.rect);
        //     rect_copy.scroll_width = this.element.scrollWidth;
        //     rect_copy.scroll_height = this.element.scrollHeight;
        //     this.on_rect_changed(
        //         rect_copy,
        //         false,
        //         true
        //     );
        // }
    }
    remove() {
        // if (this.t_highlight != null)
        //     this.t_highlight.remove();
        if (this.mirror != null)
            this.mirror.remove();
        if (this.text_node != null)
            this.text_node.remove();
        super.remove();
    }
    on_rect_changed(rect, position_changed, size_changed) {
        this.rect = rect;
        this.viewport_o = rect_1.Rect.copy(this.rect);
        this.viewport_o.left += this.element.clientLeft;
        this.viewport_o.top += this.element.clientTop;
        const overflowing_y = this.element.scrollHeight != this.element.clientHeight;
        this.viewport_o.width = this.rect.width - ((overflowing_y ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderLeftWidth) +
            parseFloat(this.computed_style.borderRightWidth));
        const overflowing_x = this.element.scrollWidth != this.element.clientWidth;
        this.viewport_o.height = this.rect.height - ((overflowing_x ? this.scrollbar_width : 0) +
            parseFloat(this.computed_style.borderTopWidth) +
            parseFloat(this.computed_style.borderBottomWidth));
        this.mirror.style.width = `${this.viewport_o.width}px`;
        this.mirror.style.height = `${this.viewport_o.height}px`;
        //?
        this.mirror.style.paddingLeft = this.computed_style.paddingLeft;
        this.mirror.style.paddingTop = this.computed_style.paddingTop;
        this.mirror.style.paddingRight = this.computed_style.paddingRight;
        this.mirror.style.paddingBottom = this.computed_style.paddingBottom;
        this.viewport_i = rect_1.Rect.copy(this.viewport_o);
        if (true) //! TODO: check if firefox
         {
            const pd_l = parseFloat(this.computed_style.paddingLeft);
            const pd_t = parseFloat(this.computed_style.paddingTop);
            const pd_r = parseFloat(this.computed_style.paddingRight);
            const pd_b = parseFloat(this.computed_style.paddingBottom);
            this.viewport_i.top += pd_t;
            this.viewport_i.left += pd_l;
            this.viewport_i.width -= pd_l + pd_r;
            this.viewport_i.height -= pd_t + pd_b;
        }
        if (position_changed)
            this.highlighter.update_position();
        if (size_changed)
            this.highlighter.update_layout();
    }
    on_style_changed(changes, all) {
        for (let [key, value] of changes) {
            if (!re_ignore_css_props.test(key))
                Reflect.set(this.mirror.style, key, value);
        }
        this.mirror.style.boxSizing = 'border-box';
        this.mirror.style.overflow = 'visible';
        this.mirror.style.textRendering = 'geometricPrecision';
        this.mirror.style.border = 'none';
        // set defaults
        if (!all.has('white-space')) //!? TODO
            this.mirror.style.whiteSpace = 'pre-wrap';
        if (!all.has('word-wrap'))
            this.mirror.style.wordWrap = 'break-word';
        if (!all.has('line-height'))
            this.mirror.style.lineHeight = 'normal';
        this.mirror.style.cssText += 'appearance: textarea;'; //?
        this.mirror.style.pointerEvents = 'none';
        this.highlighter.update_layout();
    }
    get_range(start_index, end_index) {
        let range = this.document.createRange();
        range.setStart(this.text_node, start_index);
        range.setEnd(this.text_node, end_index);
        return range;
    }
}
exports.HighlightTextAreaSource = HighlightTextAreaSource;
;

},{"../../../common/rect":7,"../abstract-highlight-text-entry-source":16,"../highlighter":19}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const rect_1 = require("../common/rect");
const margin_1 = require("../common/margin");
var Utils;
(function (Utils) {
    let DOM;
    (function (DOM) {
        /**
         * Returns true if a HTMLElement supports text entry
         * @param element the element to check
         */
        function is_text_input(element) {
            /*element.isContentEditable ||*/ // TODO
            return (element.nodeName == 'TEXTAREA' ||
                (element.nodeName == 'INPUT' &&
                    ['text', 'search', 'email', 'url'].includes(element.type)));
        }
        DOM.is_text_input = is_text_input;
        // export function get_shadow_root(element: Node): ShadowRoot
        // {
        //     if (element instanceof ShadowRoot) 
        //         return element;
        //     if (!element.parentNode) 
        //         return null;
        //     return get_shadow_root(element.parentNode);
        // }
        /**
         * returns the absolute coordinates of the provided element
         * @param element the element to get absolute coordinates of
         */
        function absolute_rect(element) {
            let rect = new rect_1.Rect(0, 0, 0, 0);
            let bounding_rect = element.getBoundingClientRect();
            rect.left = bounding_rect.left;
            rect.top = bounding_rect.top;
            rect.width = bounding_rect.width;
            rect.height = bounding_rect.height;
            return rect;
        }
        DOM.absolute_rect = absolute_rect;
        ;
        // TODO: get_text_input_value? (for distinguishing from element.isContentEditable)
        class StylingMargins {
            /**
             * calculate all space styling takes up until enclosing element
             */
            static calculate_all(element) {
                // document.body.appendChild(StylingMargins.parent_div);
                let computed_style = window.getComputedStyle(element);
                this.outer_div.style.border = computed_style.border;
                this.outer_div.style.padding = computed_style.padding;
                this.outer_div.style.margin = computed_style.margin;
                let inner_rect = this.inner_div.getBoundingClientRect();
                let outer_rect = this.outer_div.getBoundingClientRect();
                let bounds = new margin_1.Margin(inner_rect.left - outer_rect.left, inner_rect.top - outer_rect.top, inner_rect.right - outer_rect.right, inner_rect.bottom - outer_rect.bottom);
                // document.body.removeChild(StylingMargins.parent_div);
                return bounds;
            }
        }
        /**
         * initializes the calc objects
         */
        StylingMargins._initialize = (() => {
            StylingMargins.parent_div = document.createElement("div");
            StylingMargins.shadow_root = StylingMargins.parent_div.attachShadow({ mode: 'closed' });
            StylingMargins.outer_div = document.createElement("div");
            StylingMargins.inner_div = document.createElement("div");
            StylingMargins.shadow_root.appendChild(StylingMargins.outer_div);
            StylingMargins.outer_div.appendChild(StylingMargins.inner_div);
            return true;
        })();
        DOM.StylingMargins = StylingMargins;
        ;
    })(DOM = Utils.DOM || (Utils.DOM = {}));
})(Utils = exports.Utils || (exports.Utils = {}));

},{"../common/margin":5,"../common/rect":7}]},{},[8]);
