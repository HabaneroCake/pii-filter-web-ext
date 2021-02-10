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
        constructor(severity_mapping, pii) {
            this.severity_mapping = severity_mapping;
            this.pii = pii;
            this.type = ICommonMessage.Type.NOTIFY_PII;
        }
    }
    ICommonMessage.NotifyPII = NotifyPII;
    ;
})(ICommonMessage = exports.ICommonMessage || (exports.ICommonMessage = {}));
;

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
    static from_rect(rect) {
        let new_rect = new Rect();
        for (let key in rect)
            Reflect.set(new_rect, key, Reflect.get(rect, key));
        return new_rect;
    }
}
exports.Rect = Rect;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
const dom_element_info_overlay_1 = require("./content/dom-element-info-overlay");
const common_messages_1 = require("./common/common-messages");
const dom_focus_manager_1 = require("./content/dom-focus-manager");
const utils_1 = require("./content/utils");
const input_extender_1 = require("./content/html-input-mirror/input-extender");
const input_extender = new input_extender_1.PIIFilterInputExtender(document);
var PII_Filter;
(function (PII_Filter) {
    class Frame {
        constructor() {
            this.input_focus_manager = new dom_focus_manager_1.DOMFocusManager(document);
            // Listen to focus changes in other frames
            webextension_polyfill_ts_1.browser.runtime.onMessage.addListener((message, sender) => {
                switch (message.type) {
                    case common_messages_1.ICommonMessage.Type.FOCUS: {
                        let f_event = message;
                        if (!f_event.valid && this.active_element != null) {
                            this.active_element.removeEventListener('input', this.text_input_listener.bind(this));
                            this.active_element = null;
                            this.input_focus_manager.unfocus();
                        }
                        else if (f_event.valid && this.active_element == null && this.last_active_element != null) { // restore focus
                            this.last_active_element.focus();
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
            // Register input management
            this.input_focus_manager.active_focus.observe((element) => {
                let is_text_input = element != null && utils_1.Utils.DOM.is_text_input(element);
                if (this.active_element != null)
                    this.active_element.removeEventListener('input', this.text_input_listener.bind(this));
                if (is_text_input) {
                    this.active_element = element;
                    // send initial focus
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.TextEntered(this.active_element.value));
                    this.active_element.addEventListener('input', this.text_input_listener.bind(this));
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
        /**
         * callback for text input
         * @param event not used
         */
        text_input_listener(event) {
            if (this.active_element != null)
                webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.TextEntered(this.active_element.value));
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
            // provides an overlay to get user's attention
            // private highlighted_element:    DOMRectHighlight = null; // (removed rect sum before dev e0f18b0, clarity)
            // tags an element with an overlay to provide info to the user
            this.info_overlay = null;
            webextension_polyfill_ts_1.browser.runtime.onMessage.addListener((message, sender) => {
                switch (message.type) {
                    case common_messages_1.ICommonMessage.Type.NOTIFY_PII: {
                        let n_message = message;
                        this.update_overlay(n_message.severity_mapping, n_message.pii);
                        break;
                    }
                    case common_messages_1.ICommonMessage.Type.NOTIFY_PII_PARSING: {
                        this.info_overlay.restart_fade_out_timer();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
        }
        update_overlay(severity = this.info_overlay.severity, pii) {
            if (this.info_overlay == null) {
                this.info_overlay = new dom_element_info_overlay_1.DOMElementInfoOverlay(document);
                this.info_overlay.on_focus_required.observe((req) => {
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.Refocus());
                });
            }
            this.info_overlay.severity = severity;
            if (pii != null)
                this.info_overlay.pii = pii;
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

},{"./common/common-messages":3,"./content/dom-element-info-overlay":9,"./content/dom-focus-manager":10,"./content/html-input-mirror/input-extender":14,"./content/utils":16,"webextension-polyfill-ts":1}],8:[function(require,module,exports){
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
    delete() {
        for (let unbind_call of this.unbind_calls)
            unbind_call();
        this.unbind_calls = new Array();
    }
}
exports.Bindings = Bindings;
;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMElementInfoOverlay = void 0;
const webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
const shadow_dom_1 = require("./shadow-dom");
const dom_modal_1 = require("./dom-modal");
const font_css_1 = require("./font_css");
const observable_1 = require("../common/observable");
// TODO: in order to toggle the modal to stay open and update as well some stuff will need to change in focus handling.
/**
 * Provides an overlay with info/slider
 */
class DOMElementInfoOverlay extends shadow_dom_1.ShadowDomDiv {
    constructor(document) {
        super(document);
        this.severity_ = 0;
        this.keep_open = false;
        this.mouse_inside = false;
        this.hide_after_ms = 10000;
        this.on_focus_required_ = new observable_1.Observable.Variable(false);
        this.on_focus_required = new observable_1.Observable(this.on_focus_required_);
        this.modal_window = new dom_modal_1.DOMModal(document);
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
exports.DOMElementInfoOverlay = DOMElementInfoOverlay;
;

},{"../common/observable":5,"./dom-modal":11,"./font_css":12,"./shadow-dom":15,"webextension-polyfill-ts":1}],10:[function(require,module,exports){
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

},{"../common/observable":5}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMModal = void 0;
const webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
const shadow_dom_1 = require("./shadow-dom");
const font_css_1 = require("./font_css");
class DOMModal extends shadow_dom_1.ShadowDomDiv {
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
        for (let header of all_pii[0][0]) {
            let col = this.shadow.ownerDocument.createElement('th');
            col.innerText = header;
            header_row.appendChild(col);
        }
        table.appendChild(header_row);
        for (let i = 1; i < all_pii.length; ++i) {
            let row_raw = all_pii[i][0];
            let [score, severity] = [all_pii[i][1], all_pii[i][2]];
            let inv_severity = (1.0 - severity) * 255;
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
        this.modal_wrap.style.top = '55%';
        this.div.style.opacity = '0.0';
        this.div.style.visibility = 'hidden';
        this.div.style.pointerEvents = 'none';
    }
}
exports.DOMModal = DOMModal;
;

},{"./font_css":12,"./shadow-dom":15,"webextension-polyfill-ts":1}],12:[function(require,module,exports){
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
exports.ElementObserver = void 0;
const rect_1 = require("../../common/rect");
const bindings_1 = require("../bindings");
const shadow_dom_1 = require("../shadow-dom");
class StyleCalculator {
    constructor(document, element) {
        this.shadow_dom = new shadow_dom_1.ShadowDom(document, document.body.firstElementChild);
        this.shadow_dom.root_div.style.display = 'none';
        const element_base = document.createElement(element.tagName);
        this.shadow_dom.shadow.appendChild(element_base);
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
    delete() {
        this.shadow_dom.delete();
    }
}
;
class ElementObserver {
    constructor(document, input_element, polling_interval, // for uncaught changes
    on_rect_changed, on_style_changed) {
        this.bindings = new bindings_1.Bindings();
        this.active = true;
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
        this.style_calculator = new StyleCalculator(document, input_element);
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
                // TODO: style?
                setTimeout(rect_polling_update, polling_interval);
            }
        };
        rect_polling_update();
        // push initial changes
        on_style_changed(old_css, old_css);
    }
    delete() {
        this.active = false;
        this.style_calculator.delete();
        this.bindings.delete();
    }
}
exports.ElementObserver = ElementObserver;
;

},{"../../common/rect":6,"../bindings":8,"../shadow-dom":15}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIIFilterInputExtender = exports.TextAreaInputInterface = exports.copy_event = exports.AbstractInputInterface = void 0;
const shadow_dom_1 = require("../shadow-dom");
const bindings_1 = require("../bindings");
const element_observer_1 = require("./element_observer");
;
class AbstractInputInterface extends shadow_dom_1.ShadowDomDiv {
    // add range display stuff here as well
    constructor(settings) {
        super(settings.document);
        this.settings = settings;
        this.bindings = new bindings_1.Bindings();
        this.div.style.position = 'absolute';
    }
    init() {
        this.element_observer = new element_observer_1.ElementObserver(document, this.settings.element, this.settings.polling_interval, (rect) => { this.on_rect_changed(rect); }, (changes, all) => { this.on_style_changed(changes, all); });
    }
    delete() {
        this.bindings.delete();
        this.element_observer.delete();
        super.delete();
    }
}
exports.AbstractInputInterface = AbstractInputInterface;
;
function copy_event(event, new_target) {
    let event_dict = {};
    for (let key in event)
        Reflect.set(event_dict, key, Reflect.get(event, key));
    if (new_target != null && Reflect.has(event, 'target'))
        Reflect.set(event_dict, 'target', new_target);
    return new Event(event.type, event_dict);
}
exports.copy_event = copy_event;
/**
 * this class exists as an overlay hack since mirroring a textarea doesn't *always* give the right result
 */
class TextAreaInputInterface extends AbstractInputInterface {
    constructor(settings) {
        super(settings);
        this.overlay_str = '';
        this.ignore_resize_callbacks = false;
        this.input_overlay = settings.document.createElement('div');
        this.div.appendChild(this.input_overlay);
        const text_area_element = this.settings.element;
        // watch outside changes
        const element_input_callback = (event) => {
            const new_text = text_area_element.value;
            if (new_text != this.overlay_str) {
                this.input_overlay.textContent = new_text;
                if (this.settings.on_input_changed != null)
                    this.settings.on_input_changed(new_text);
            }
        };
        // bind check if form or javascript changes textarea contents
        for (let event_name of ['input', 'change'])
            this.bindings.bind_event(this.settings.element, event_name, element_input_callback);
        // mutation observer as well?
        const sync_contents = () => {
            this.overlay_str = this.input_overlay.innerHTML.replace(/(\<\/div\>)|(^\<div\>)/g, '')
                .replace(/(\<div\>\<\/?br\>)|(\<div\>|<\/?br\>)/g, '\n')
                .replace(/&amp;/g, '&')
                .replace(/&gt;/g, '>')
                .replace(/&lt;/g, '<');
            text_area_element.value = this.overlay_str;
        };
        const forward_event = (event) => {
            const copied_event = copy_event(event, this.settings.element);
            this.settings.element.dispatchEvent(copied_event);
        };
        // follow text changes
        for (let event_name of ['input', 'change']) {
            this.bindings.bind_event(this.input_overlay, event_name, (event) => {
                sync_contents();
                forward_event(event);
                if (this.settings.on_input_changed != null)
                    this.settings.on_input_changed(this.overlay_str);
            });
        }
        // events which should sync the contents before forwarding the event
        for (let event_name of [
            'focus', 'submit', 'cut', 'copy', 'paste', 'keydown', 'keyup', 'contextmenu', 'select', 'selectstart',
            'selectionchange'
        ])
            this.bindings.bind_event(this.input_overlay, event_name, (event) => {
                sync_contents();
                forward_event(event);
            });
        // forward a list of events (mouse click events are not forwarded since coords could be wrong)
        for (let event_name of [
            'reset', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'drag', 'dragend', 'dragenter', 'dragstart',
            'dragleave', 'dragover', 'drop', 'storage', 'message', 'open', 'orientationchange', 'deviceorientation',
            'devicemotion', 'pointerover', 'pointerenter', 'pointerout', 'pointerleave', 'show', 'success'
        ]) {
            this.bindings.bind_event(this.input_overlay, event_name, (event) => {
                const copied_event = copy_event(event, this.settings.element);
                this.settings.element.dispatchEvent(copied_event);
            });
        }
        this.bindings.bind_event(this.input_overlay, 'scroll', (event) => {
            this.settings.element.scrollTop = this.input_overlay.scrollTop;
            this.settings.element.scrollLeft = this.input_overlay.scrollLeft;
            const copied_event = copy_event(event, this.settings.element);
            this.settings.element.dispatchEvent(copied_event);
        });
        this.bindings.bind_event(this.input_overlay, 'blur', (event) => {
            if (this.settings.on_blur != null)
                this.settings.on_blur(event);
            const copied_event = copy_event(event, this.settings.element);
            this.settings.element.dispatchEvent(copied_event);
        });
        // keep at end
        super.init();
        // TODO: resize observer here (needs to account for padding etc.) for forwarding resize to input
        // sync initial contents
        this.input_overlay.textContent = text_area_element.value;
        this.input_overlay.contentEditable = 'true';
        this.input_overlay.focus();
        // sync caret
        if (text_area_element.value.length > 0) {
            const range = document.createRange();
            range.setStart(this.input_overlay.childNodes[0], text_area_element.selectionStart);
            range.setEnd(this.input_overlay.childNodes[0], text_area_element.selectionEnd);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        this.input_overlay.scrollTop = this.settings.element.scrollTop;
        this.input_overlay.scrollLeft = this.settings.element.scrollLeft;
        // hide input element
        this.el_old_transition = this.settings.element.style.transition;
        this.settings.element.style.transition = 'none';
        this.settings.element.style.visibility = 'hidden';
    }
    ;
    delete() {
        super.delete();
        // show input element
        this.settings.element.style.visibility = 'visible';
        this.settings.element.style.transition = this.el_old_transition;
    }
    on_rect_changed(rect) {
        rect.apply_position_to_element(this.div, true);
        // rect.apply_width_and_height_to_element(this.input_overlay);
        this.input_overlay.style.width = `${this.settings.element.clientWidth}px`;
        this.input_overlay.style.height = `${this.settings.element.clientHeight}px`;
    }
    on_style_changed(changes, all) {
        for (let [key, value] of changes) {
            if ([
                // 'border',
                // 'border-top',
                // 'border-bottom',
                // 'border-left',
                // 'border-right',
                'margin',
                'margin-top',
                'margin-bottom',
                'margin-left',
                'margin-right',
                'margin-block-start',
                'margin-block-end',
                'margin-inline-start',
                'margin-inline-end',
                'user-modify',
                '-webkit-user-modify',
                'visibility',
                'perspective-origin',
                'transform-origin'
            ].indexOf(key) == -1)
                Reflect.set(this.input_overlay.style, key, value);
            // console.log(key, value);
        }
        // overrides
        this.input_overlay.style.position = 'relative';
        this.input_overlay.style.boxSizing = 'content-box';
        this.input_overlay.style.display = 'block';
        this.input_overlay.style.margin = '0px';
        this.input_overlay.style.zIndex = '99999';
        this.input_overlay.style.transition = 'none';
        this.input_overlay.style.animation = 'none';
        // set defaults
        for (let key of ['overflow-x', 'overflow-y'])
            if (!all.has(key))
                this.input_overlay.style.setProperty(key, 'auto');
        if (!all.has('white-space'))
            this.input_overlay.style.whiteSpace = 'pre-wrap';
        if (!all.has('word-wrap'))
            this.input_overlay.style.wordWrap = 'break-word';
        if (!all.has('resize'))
            this.input_overlay.style.resize = 'both';
        if (!all.has('line-height'))
            this.input_overlay.style.lineHeight = 'normal';
        this.input_overlay.style.cssText += 'appearance: textarea;';
    }
    contains(element) {
        return (element == this.input_overlay);
    }
}
exports.TextAreaInputInterface = TextAreaInputInterface;
;
class PIIFilterInputExtender {
    constructor(main_document) {
        this.bindings = new bindings_1.Bindings();
        // catch focus
        this.bindings.bind_event(document, 'focusin', (event) => {
            const target_element = event.target;
            // TODO: keep old interface if it is of same type
            const on_blur = (event) => {
                // todo other stuff (check if this is because of other overlay)
                this.delete_interface();
            };
            // delete old interface
            if (this.input_interface != null)
                this.input_interface.delete();
            const settings = {
                document: document,
                element: target_element,
                polling_interval: 5000,
                on_blur: on_blur
            };
            const add_interface = () => {
                target_element.removeEventListener('mouseup', add_interface);
                target_element.removeEventListener('keyup', add_interface);
                // ignore if target is part of input interface
                if (this.input_interface != null && this.input_interface.contains(target_element))
                    return;
                if (target_element.nodeName == 'INPUT')
                    return; // TODO
                else if (target_element.nodeName == 'TEXTAREA')
                    this.input_interface = new TextAreaInputInterface(settings);
                else if (target_element.isContentEditable)
                    return;
                else
                    return;
                console.log('bound');
            };
            target_element.addEventListener('mouseup', add_interface);
            target_element.addEventListener('keyup', add_interface);
        });
        // catch input / clicking / polling
    }
    delete_interface() {
        if (this.input_interface != null) {
            console.log('released');
            this.input_interface.delete();
            this.input_interface = null;
        }
    }
    delete() {
        this.bindings.delete();
    }
}
exports.PIIFilterInputExtender = PIIFilterInputExtender;
;
// TODO:
// have resize observer on overlay for size forwarding
// resizing could affect other element only after release?
// show last line if only newline / whitespace
// sync range highlighting
// TODO: eventually:
// resize forwarding 
// poll for uncaught css changes
// redo firefox support so that ctr/cmd keycomb work. or try different approach
// have scroll work other way around if not triggered by own el.

},{"../bindings":8,"../shadow-dom":15,"./element_observer":13}],15:[function(require,module,exports){
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
    delete() {
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
    delete() {
        this.root_div.remove();
        super.delete();
    }
}
exports.ShadowDomDiv = ShadowDomDiv;
;

},{}],16:[function(require,module,exports){
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

},{"../common/margin":4,"../common/rect":6}]},{},[7]);
