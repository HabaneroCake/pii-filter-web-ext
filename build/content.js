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
    var Type;
    (function (Type) {
        Type[Type["FOCUS"] = 0] = "FOCUS";
        Type[Type["REFOCUS"] = 1] = "REFOCUS";
        Type[Type["TEXT_ENTERED"] = 2] = "TEXT_ENTERED";
        Type[Type["NOTIFY_PII"] = 3] = "NOTIFY_PII";
        Type[Type["NOTIFY_PII_PARSING"] = 4] = "NOTIFY_PII_PARSING";
    })(Type = ICommonMessage.Type || (ICommonMessage.Type = {}));
    ;
    var Focus = /** @class */ (function () {
        function Focus(valid) {
            this.valid = valid;
            this.type = ICommonMessage.Type.FOCUS;
        }
        return Focus;
    }());
    ICommonMessage.Focus = Focus;
    ;
    var Refocus = /** @class */ (function () {
        function Refocus() {
            this.type = ICommonMessage.Type.REFOCUS;
        }
        return Refocus;
    }());
    ICommonMessage.Refocus = Refocus;
    ;
    var TextEntered = /** @class */ (function () {
        function TextEntered(text) {
            this.text = text;
            this.type = ICommonMessage.Type.TEXT_ENTERED;
        }
        return TextEntered;
    }());
    ICommonMessage.TextEntered = TextEntered;
    ;
    var NotifyPIIParsing = /** @class */ (function () {
        function NotifyPIIParsing() {
            this.type = ICommonMessage.Type.NOTIFY_PII_PARSING;
        }
        return NotifyPIIParsing;
    }());
    ICommonMessage.NotifyPIIParsing = NotifyPIIParsing;
    ;
    var NotifyPII = /** @class */ (function () {
        function NotifyPII(severity_mapping, pii) {
            this.severity_mapping = severity_mapping;
            this.pii = pii;
            this.type = ICommonMessage.Type.NOTIFY_PII;
        }
        return NotifyPII;
    }());
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
var Margin = /** @class */ (function () {
    function Margin(left, top, right, bottom) {
        if (left === void 0) { left = 0; }
        if (top === void 0) { top = 0; }
        if (right === void 0) { right = 0; }
        if (bottom === void 0) { bottom = 0; }
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
    ;
    return Margin;
}());
exports.Margin = Margin;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = void 0;
/**
 * Thin wrapper to separate private and public interfaces of Observable
 */
var Observable = /** @class */ (function () {
    function Observable(variable) {
        this.observe = variable.observe.bind(variable);
        this.disregard = variable.disregard.bind(variable);
        this.get = variable.get.bind(variable);
    }
    return Observable;
}());
exports.Observable = Observable;
(function (Observable) {
    var Variable = /** @class */ (function () {
        function Variable(notify_on_diff_only) {
            if (notify_on_diff_only === void 0) { notify_on_diff_only = true; }
            this.notify_on_diff_only = notify_on_diff_only;
            this._observers = new Array();
            this._value = null;
        }
        Object.defineProperty(Variable.prototype, "value", {
            get: function () {
                return this._value;
            },
            /**
             * setter for value (notifies observers)
             */
            set: function (new_value) {
                if (!this.notify_on_diff_only || this.value !== new_value) {
                    this._value = new_value;
                    this.notify();
                }
            },
            enumerable: false,
            configurable: true
        });
        Variable.prototype.notify = function () {
            var _this = this;
            this._observers.forEach(function (callback) {
                callback(_this.value);
            });
        };
        Variable.prototype.get = function () {
            return this.value;
        };
        /**
         * start observing
         * @param callback the callback which will be called with the new value
         */
        Variable.prototype.observe = function (callback) {
            if (this._observers.indexOf(callback) > -1)
                throw new Error("Observer already exists on Variable.");
            this._observers.push(callback);
        };
        /**
         * stop observing
         * @param callback the callback which was added earlier (When omitted removes all listeners)
         */
        Variable.prototype.disregard = function (callback) {
            if (callback == null)
                this._observers = new Array();
            var index_of_callback = this._observers.indexOf(callback, 0);
            if (index_of_callback > -1)
                this._observers.splice(index_of_callback, 1);
            else
                throw new Error("Observer does not exist on Variable.");
        };
        return Variable;
    }());
    Observable.Variable = Variable;
})(Observable = exports.Observable || (exports.Observable = {}));
exports.Observable = Observable;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rect = void 0;
/**
 * simple rect type
 */
var Rect = /** @class */ (function () {
    function Rect(left, top, width, height) {
        if (left === void 0) { left = 0; }
        if (top === void 0) { top = 0; }
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    ;
    return Rect;
}());
exports.Rect = Rect;

},{}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
var dom_element_info_overlay_1 = require("./content/dom-element-info-overlay");
var common_messages_1 = require("./common/common-messages");
var dom_focus_manager_1 = require("./content/dom-focus-manager");
var utils_1 = require("./content/utils");
var PII_Filter;
(function (PII_Filter) {
    var Frame = /** @class */ (function () {
        function Frame() {
            var _this = this;
            this.input_focus_manager = new dom_focus_manager_1.DOMFocusManager(document);
            // Listen to focus changes in other frames
            webextension_polyfill_ts_1.browser.runtime.onMessage.addListener(function (message, sender) {
                switch (message.type) {
                    case common_messages_1.ICommonMessage.Type.FOCUS: {
                        var f_event = message;
                        if (!f_event.valid && _this.active_element != null) {
                            _this.active_element.removeEventListener('input', _this.text_input_listener.bind(_this));
                            _this.active_element = null;
                            _this.input_focus_manager.unfocus();
                        }
                        else if (f_event.valid && _this.active_element == null && _this.last_active_element != null) { // restore focus
                            _this.last_active_element.focus();
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
            // Register input management
            this.input_focus_manager.active_focus.observe(function (element) {
                var is_text_input = element != null && utils_1.Utils.DOM.is_text_input(element);
                if (_this.active_element != null)
                    _this.active_element.removeEventListener('input', _this.text_input_listener.bind(_this));
                if (is_text_input) {
                    _this.active_element = element;
                    // send initial focus
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.TextEntered(_this.active_element.value));
                    _this.active_element.addEventListener('input', _this.text_input_listener.bind(_this));
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.Focus(true));
                }
                else {
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.Focus(false));
                    _this.active_element = null;
                }
            });
        }
        Object.defineProperty(Frame.prototype, "active_element", {
            get: function () {
                return this.active_element_;
            },
            set: function (element) {
                this.last_active_element = this.active_element_;
                this.active_element_ = element;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * callback for text input
         * @param event not used
         */
        Frame.prototype.text_input_listener = function (event) {
            if (this.active_element != null)
                webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.TextEntered(this.active_element.value));
        };
        return Frame;
    }());
    PII_Filter.Frame = Frame;
    ;
    /**
     * Top level frame (for drawing overlays)
     */
    var Top = /** @class */ (function (_super) {
        __extends(Top, _super);
        function Top() {
            var _this = _super.call(this) || this;
            // provides an overlay to get user's attention
            // private highlighted_element:    DOMRectHighlight = null; // (removed rect sum before dev e0f18b0, clarity)
            // tags an element with an overlay to provide info to the user
            _this.info_overlay = null;
            webextension_polyfill_ts_1.browser.runtime.onMessage.addListener(function (message, sender) {
                switch (message.type) {
                    case common_messages_1.ICommonMessage.Type.NOTIFY_PII: {
                        var n_message = message;
                        _this.update_overlay(n_message.severity_mapping, n_message.pii);
                        break;
                    }
                    case common_messages_1.ICommonMessage.Type.NOTIFY_PII_PARSING: {
                        _this.info_overlay.restart_fade_out_timer();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
            return _this;
        }
        Top.prototype.update_overlay = function (severity, pii) {
            if (severity === void 0) { severity = this.info_overlay.severity; }
            if (this.info_overlay == null) {
                this.info_overlay = new dom_element_info_overlay_1.DOMElementInfoOverlay(document);
                this.info_overlay.on_focus_required.observe(function (req) {
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(null, new common_messages_1.ICommonMessage.Refocus());
                });
            }
            this.info_overlay.severity = severity;
            if (pii != null)
                this.info_overlay.pii = pii;
        };
        return Top;
    }(Frame));
    PII_Filter.Top = Top;
    ;
    var Content = /** @class */ (function () {
        function Content() {
            this.frame = (window.self !== window.top) ? new Frame() : new Top();
        }
        return Content;
    }());
    PII_Filter.Content = Content;
    ;
})(PII_Filter || (PII_Filter = {}));
;
new PII_Filter.Content();

},{"./common/common-messages":3,"./content/dom-element-info-overlay":8,"./content/dom-focus-manager":9,"./content/utils":13,"webextension-polyfill-ts":1}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMElementInfoOverlay = void 0;
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
var shadow_dom_div_1 = require("./shadow-dom-div");
var dom_modal_1 = require("./dom-modal");
var font_css_1 = require("./font_css");
var observable_1 = require("../common/observable");
// TODO: in order to toggle the modal to stay open and update as well some stuff will need to change in focus handling.
/**
 * Provides an overlay with info/slider
 */
var DOMElementInfoOverlay = /** @class */ (function (_super) {
    __extends(DOMElementInfoOverlay, _super);
    function DOMElementInfoOverlay(document) {
        var _this = _super.call(this, document) || this;
        _this.severity_ = 0;
        _this.keep_open = false;
        _this.mouse_inside = false;
        _this.hide_after_ms = 10000;
        _this.on_focus_required_ = new observable_1.Observable.Variable(false);
        _this.on_focus_required = new observable_1.Observable(_this.on_focus_required_);
        _this.modal_window = new dom_modal_1.DOMModal(document);
        _this.modal_window.title_div.innerText = 'Informatie in het huidige tekstveld:';
        var style = _this.shadow.ownerDocument.createElement('style');
        style.innerText = "    \n            " + font_css_1.get_fonts() + "\n\n            body {\n                padding:            0px;\n                margin:             0px;\n            }\n            .severity-bar-outer {\n                transition:         0.25s ease-in;\n                display:            block;\n                visibility:         visible;\n                position:           fixed;\n                height:             0px;\n                bottom:             0%;\n                width:              100%;\n                padding:            0px;\n                border-top-style:   solid;\n                border-top-width:   1.5px;\n                border-top-color:   rgba(50, 50, 50, 0.75);\n                background-color:   rgba(255, 255, 255, 0.9);\n                z-index:            9999;\n                opacity:            0.0;\n            }\n            .severity-bar-container {\n                display:            block;\n                background-image:   linear-gradient(to right, yellow, orange, red, purple);\n                width:              100%;\n                height:             25px;\n            }\n            .severity-bar-indicator {\n                transition:         0.75s ease-in;\n                visibility:         visible;\n                background-color:   rgba(255, 255, 255, 0.95);\n                position:           fixed;\n                right:              0%;\n                width:              100%;\n                height:             100%;\n            }\n            .severity-bar-text {\n                display:            flex;\n                justify-content:    center;\n                flex-wrap:          nowrap;\n                width:              100%;\n                height:             100%;\n            }\n            .severity-display-item {\n                display:            inline-block;\n                align-self:         center;\n                z-index:            99999;\n            }\n            .severity-text-span {\n                margin-right:       10px;\n                font-family:        'Montserrat', sans-serif;\n                font-weight:        400;\n                font-size:          12pt;\n                color:              black;\n                align-self:         center;\n            }\n            .info-icon {\n                margin-top:         3px;\n                width:              15px;\n                align-self:         center;\n            }\n        ";
        _this.shadow.appendChild(style);
        _this.div.classList.add('severity-bar-outer');
        _this.severity_bar_container = _this.shadow.ownerDocument.createElement('div');
        _this.severity_bar_container.classList.add('severity-bar-container');
        _this.div.appendChild(_this.severity_bar_container);
        _this.severity_bar_indicator = _this.shadow.ownerDocument.createElement('div');
        _this.severity_bar_indicator.classList.add('severity-bar-indicator');
        _this.severity_bar_container.appendChild(_this.severity_bar_indicator);
        _this.severity_bar_text_div = _this.shadow.ownerDocument.createElement('div');
        _this.severity_bar_text_div.classList.add('severity-bar-text');
        var img_div = _this.shadow.ownerDocument.createElement('div');
        img_div.classList.add('severity-display-item');
        var img = _this.shadow.ownerDocument.createElement('img');
        img.classList.add('info-icon');
        img.src = webextension_polyfill_ts_1.browser.runtime.getURL('assets/info.png');
        img_div.appendChild(img);
        _this.div.addEventListener('mousedown', (function (x, event) {
            _this.keep_open = true;
            _this.modal_window.show(true, (function (x, event) {
                _this.modal_window.hide();
                _this.keep_open = false;
                _this.show(_this.mouse_inside);
                _this.on_focus_required_.value = true;
            }).bind(_this));
            _this.on_focus_required_.value = true;
        }).bind(_this));
        _this.div.addEventListener('mouseover', (function (x, event) {
            _this.mouse_inside = true;
            if (!_this.keep_open) {
                _this.modal_window.show();
                _this.show(_this.mouse_inside);
            }
        }).bind(_this));
        _this.div.addEventListener('mouseout', (function (x, event) {
            if (!_this.keep_open) {
                _this.modal_window.hide();
                _this.restart_fade_out_timer();
            }
            _this.mouse_inside = false;
        }).bind(_this));
        var span_div = _this.shadow.ownerDocument.createElement('div');
        span_div.classList.add('severity-display-item');
        var span = _this.shadow.ownerDocument.createElement('span');
        span.classList.add('severity-text-span');
        span.innerText = 'Persoonlijke Informatie Aanwezig';
        span_div.appendChild(span);
        _this.severity_bar_text_div.appendChild(span_div);
        _this.severity_bar_text_div.appendChild(img_div);
        _this.severity_bar_container.appendChild(_this.severity_bar_text_div);
        _this.hide();
        return _this;
    }
    DOMElementInfoOverlay.prototype.clear_fade_out_timer = function () {
        if (this.fade_out_timer)
            window.clearTimeout(this.fade_out_timer);
    };
    DOMElementInfoOverlay.prototype.restart_fade_out_timer = function () {
        var _this = this;
        this.clear_fade_out_timer();
        this.fade_out_timer = window.setTimeout(function () {
            _this.hide();
        }, this.hide_after_ms);
    };
    DOMElementInfoOverlay.prototype.show = function (keep_open) {
        if (keep_open === void 0) { keep_open = false; }
        this.div.style.opacity = '1.0';
        this.div.style.height = '25px';
        this.div.style.visibility = 'visible';
        this.div.style.pointerEvents = 'auto';
        this.clear_fade_out_timer();
        if (!keep_open)
            this.restart_fade_out_timer();
    };
    DOMElementInfoOverlay.prototype.hide = function () {
        this.div.style.opacity = '0.0';
        this.div.style.height = '0px';
        this.div.style.visibility = 'hidden';
        this.div.style.pointerEvents = 'none';
        this.keep_open = false;
        this.modal_window.hide();
    };
    Object.defineProperty(DOMElementInfoOverlay.prototype, "severity", {
        get: function () {
            return this.severity_;
        },
        set: function (severity) {
            this.severity_ = severity;
            if (!this.keep_open) {
                this.severity_bar_indicator.style.width = (1 - severity) * 100 + "%";
                if (severity == 0.0)
                    this.hide();
                else
                    this.show(this.mouse_inside);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DOMElementInfoOverlay.prototype, "pii", {
        set: function (all_pii) {
            if (!this.keep_open)
                this.modal_window.pii = all_pii;
        },
        enumerable: false,
        configurable: true
    });
    return DOMElementInfoOverlay;
}(shadow_dom_div_1.ShadowDomDiv));
exports.DOMElementInfoOverlay = DOMElementInfoOverlay;
;

},{"../common/observable":5,"./dom-modal":10,"./font_css":11,"./shadow-dom-div":12,"webextension-polyfill-ts":1}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMFocusManager = void 0;
var observable_1 = require("../common/observable");
var DOMFocusManager = /** @class */ (function () {
    /**
     * creates and binds the focus manager
     * @param element the DOM element to bind to
     */
    function DOMFocusManager(element) {
        this._active_focus = new observable_1.Observable.Variable();
        this.active_focus = new observable_1.Observable(this._active_focus);
        element.addEventListener('focusin', this.focus_in.bind(this), false);
        element.addEventListener('focusout', this.focus_out.bind(this), false);
    }
    /**
     * callback for focusin event
     * @param event the event
     */
    DOMFocusManager.prototype.focus_in = function (event) {
        if (event != null) {
            var target = event.target;
            // traverse possible shadow roots
            while (target.shadowRoot && target.shadowRoot.activeElement)
                target = target.shadowRoot.activeElement;
            this._active_focus.value = target;
        }
        else
            this.focus_out(null);
    };
    /**
     * callback for focusout event
     * @param event the event
     */
    DOMFocusManager.prototype.focus_out = function (event) {
        if (this._active_focus.value != null)
            this._active_focus.value = null;
    };
    /**
     * unfocus the input manager
     */
    DOMFocusManager.prototype.unfocus = function () {
        this._active_focus.value = null;
    };
    return DOMFocusManager;
}());
exports.DOMFocusManager = DOMFocusManager;
;

},{"../common/observable":5}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMModal = void 0;
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
var shadow_dom_div_1 = require("./shadow-dom-div");
var font_css_1 = require("./font_css");
var DOMModal = /** @class */ (function (_super) {
    __extends(DOMModal, _super);
    function DOMModal(document) {
        var _this = _super.call(this, document) || this;
        var style = _this.shadow.ownerDocument.createElement('style');
        style.innerText = "\n            " + font_css_1.get_fonts() + "\n\n            body {\n                padding:            0px;\n                margin:             0px;\n            }\n            .modal {\n                transition:         0.15s ease-in-out;\n                visibility:         hidden;\n                position:           fixed; \n                left:               0; \n                top:                0;\n                transform:          translate(0, -25px);\n                width:              100%;\n                height:             100%;\n                background-color:   rgba(0, 0, 0, 0.5);\n                z-index:            99999;\n            }\n            .modal-wrap {\n                transition:         0.15s ease-in-out;\n                position:           fixed;\n                min-width:          10cm;\n                max-width:          20cm;\n                width:              50%;\n                left:               50%;\n                top:                50%;\n                transform:          translate(-50%, -50%);\n                filter:             drop-shadow(0px 2px 4px #222233);\n            }\n            .top-styling {\n                display:            flex;\n                min-height:         20px;\n                background-color:   rgba(15, 15, 50, 0.75);\n                border:             3px solid rgba(25, 25, 60, 0.75);\n                color:              white;\n                vertical-align:     middle;\n            }\n            .center-styling {\n                font-family:        'Montserrat', sans-serif;\n                font-weight:        300;\n                font-size:          12pt;\n                background-color:   rgba(255, 255, 255, 0.975);\n                min-height:         40px;\n                max-height:         75vh;\n                overflow:           auto;\n            }\n            .bottom-styling {\n                font-family:        'Montserrat', sans-serif;\n                font-weight:        300;\n                font-size:          12pt;\n                background-color:   rgba(245, 245, 245, 0.975);\n                min-height:         40px;\n                padding:            10px;\n                padding-left:       30px;\n                padding-right:      30px;\n                text-align:         center;\n            }\n            .min-padding {\n                padding:            10px;\n            }\n            .max-padding {\n                padding:            20px;\n            }\n            .pii-icon {\n                height:             40px;\n            }\n            .logo {\n                display:            inline-block;\n                user-select:        none;\n                align-self:         center;\n                margin:             0 auto;\n            }\n            .title {\n                flex:               1;\n                display:            inline-block;\n                font-family:        'Montserrat', sans-serif;\n                font-size:          15pt;\n                font-weight:        900;\n                color:              white;\n                text-align:         center;\n                align-self:         center;\n                margin:             0 auto;\n            }\n            .modal-content {\n                height:             100%;\n            }\n            .content {\n                width:              100%;\n                height:             100%;\n            }\n            .close-btn {\n                display:            inline-block;\n                align-self:         center;\n                margin:             0 auto;\n                color:              rgb(150, 150, 150);\n                font-size:          24px; \n                font-weight:        bold;\n                user-select:        none;\n            }\n            .close-btn:hover {\n                color:              rgb(255, 255, 255);\n            }\n            table {\n                table-layout:       fixed;\n                color:              black;\n                width:              100%;\n                border:             2px solid rgba(225, 225, 225, 0.35);\n            }\n            table, td, th {\n                border-collapse: collapse;\n            }\n            td, th {\n                text-align:         left;\n            }\n            tr {\n            }\n            th {\n                font-family:        'Montserrat', sans-serif;\n                font-size:          12pt;\n                font-weight:        500;\n                background-color:   rgba(245, 245, 245, 0.75);\n                color:              black;\n                margin-bottom:      5px;\n                padding-left:       7px;\n                padding-right:      7px;\n            }\n            table th {\n                border-bottom:      2.0px solid rgba(0, 0, 0, 0.4); \n                border-left:        1.5px solid rgba(100, 100, 100, 0.5);\n                border-right:       1.5px solid rgba(100, 100, 100, 0.5);\n            }\n            table tr th:first-child {\n                border-left: 0;\n            }\n            table tr th:last-child {\n                border-right: 0;\n            }\n\n            td {\n                font-family:        'Montserrat', sans-serif;\n                font-weight:        250;\n                font-size:          12pt;\n                padding-left:       5px;\n                word-wrap:          anywhere;\n            }\n            table td {\n                border:             1.5px solid rgba(225, 225, 225, 0.6);\n            }\n            table tr:first-child td {\n                border-top:         0;\n            }\n            table tr td:first-child {\n                border-left:        0;\n            }\n            table tr:last-child td {\n                border-bottom:      0;\n            }\n            table tr td:last-child {\n                border-right:       0;\n            }\n        ";
        _this.shadow.appendChild(style);
        _this.div.classList.add('modal');
        _this.modal_wrap = _this.shadow.ownerDocument.createElement('div');
        _this.modal_wrap.classList.add('modal-wrap');
        _this.div.appendChild(_this.modal_wrap);
        var modal_content_top = _this.shadow.ownerDocument.createElement('div');
        modal_content_top.classList.add('modal-content', 'top-styling', 'min-padding');
        var img_div = _this.shadow.ownerDocument.createElement('div');
        img_div.classList.add('logo');
        var img = _this.shadow.ownerDocument.createElement('img');
        img.classList.add('pii-icon');
        img.src = webextension_polyfill_ts_1.browser.runtime.getURL('assets/logos/a/PIIlogo.png');
        img_div.appendChild(img);
        modal_content_top.appendChild(img_div);
        _this.title_div = _this.shadow.ownerDocument.createElement('div');
        _this.title_div.classList.add('title');
        modal_content_top.appendChild(_this.title_div);
        _this.close_btn = _this.shadow.ownerDocument.createElement('div');
        _this.close_btn.classList.add('close-btn');
        _this.close_btn.innerHTML = '&times;';
        _this.close_btn.style.visibility = 'none';
        _this.close_btn.addEventListener('mousedown', (function (x, event) {
            if (_this.on_closed != null)
                _this.on_closed(x, event);
        }).bind(_this));
        modal_content_top.appendChild(_this.close_btn);
        _this.modal_wrap.appendChild(modal_content_top);
        var modal_content_center = _this.shadow.ownerDocument.createElement('div');
        modal_content_center.classList.add('modal-content', 'center-styling', 'max-padding');
        _this.content_div = _this.shadow.ownerDocument.createElement('div');
        _this.content_div.classList.add('content');
        modal_content_center.appendChild(_this.content_div);
        _this.modal_wrap.appendChild(modal_content_center);
        var modal_content_bottom = _this.shadow.ownerDocument.createElement('div');
        modal_content_bottom.classList.add('modal-content', 'bottom-styling');
        modal_content_bottom.innerText = 'Wees waakzaam met het delen van persoonlijke informatie op sociale media,' +
            ' webshops, blogposts en in comments en reviews.';
        _this.modal_wrap.appendChild(modal_content_bottom);
        _this.hide();
        return _this;
    }
    Object.defineProperty(DOMModal.prototype, "pii", {
        set: function (all_pii) {
            // create table of personally identifiable information
            this.content_div.innerHTML = '';
            if (all_pii.length == 0) {
                return;
            }
            var table = this.shadow.ownerDocument.createElement('table');
            var header_row = this.shadow.ownerDocument.createElement('tr');
            for (var _i = 0, _a = all_pii[0][0]; _i < _a.length; _i++) {
                var header = _a[_i];
                var col = this.shadow.ownerDocument.createElement('th');
                col.innerText = header;
                header_row.appendChild(col);
            }
            table.appendChild(header_row);
            for (var i = 1; i < all_pii.length; ++i) {
                var row_raw = all_pii[i][0];
                var _b = [all_pii[i][1], all_pii[i][2]], score = _b[0], severity = _b[1];
                var inv_severity = (1.0 - severity) * 255;
                var row = this.shadow.ownerDocument.createElement('tr');
                row.style.background = "rgb(255, " + inv_severity + ", " + inv_severity + ")";
                for (var _c = 0, row_raw_1 = row_raw; _c < row_raw_1.length; _c++) {
                    var col_raw = row_raw_1[_c];
                    var col = this.shadow.ownerDocument.createElement('td');
                    col.innerText = col_raw;
                    row.appendChild(col);
                }
                table.appendChild(row);
            }
            this.content_div.appendChild(table);
        },
        enumerable: false,
        configurable: true
    });
    DOMModal.prototype.show = function (with_close_button, fn) {
        if (with_close_button === void 0) { with_close_button = false; }
        if (fn === void 0) { fn = null; }
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
    };
    DOMModal.prototype.hide = function () {
        this.modal_wrap.style.top = '55%';
        this.div.style.opacity = '0.0';
        this.div.style.visibility = 'hidden';
        this.div.style.pointerEvents = 'none';
    };
    return DOMModal;
}(shadow_dom_div_1.ShadowDomDiv));
exports.DOMModal = DOMModal;
;

},{"./font_css":11,"./shadow-dom-div":12,"webextension-polyfill-ts":1}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_fonts = void 0;
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
function get_fonts() {
    var url = function (u) {
        return webextension_polyfill_ts_1.browser.runtime.getURL("assets/fonts/webfonts/" + u);
    };
    return "\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 100;\n        font-style: normal;\n        src: url(\"" + url('Montserrat-Thin.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-Thin.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Thin-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 100;\n        font-style: italic;\n        src: url(\"" + url('Montserrat-ThinItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-ThinItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat ExtraLight **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 200;\n        font-style: normal;\n        src: url(\"" + url('Montserrat-ExtraLight.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-ExtraLight.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat ExtraLight-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 200;\n        font-style: italic;\n        src: url(\"" + url('Montserrat-ExtraLightItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-ExtraLightItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Light **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 300;\n        font-style: normal;\n        src: url(\"" + url('Montserrat-Light.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-Light.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Light-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 300;\n        font-style: italic;\n        src: url(\"" + url('Montserrat-LightItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-LightItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Regular **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 400;\n        font-style: normal;\n        src: url(\"" + url('Montserrat-Regular.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-Regular.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Regular-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 400;\n        font-style: italic;\n        src: url(\"" + url('Montserrat-Italic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-Italic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Medium **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 500;\n        font-style: normal;\n        src: url(\"" + url('Montserrat-Medium.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-Medium.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Medium-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 500;\n        font-style: italic;\n        src: url(\"" + url('Montserrat-MediumItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-MediumItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat SemiBold **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 600;\n        font-style: normal;\n        src: url(\"" + url('Montserrat-SemiBold.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-SemiBold.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat SemiBold-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 600;\n        font-style: italic;\n        src: url(\"" + url('Montserrat-SemiBoldItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-SemiBoldItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Bold **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 700;\n        font-style: normal;\n        src: url(\"" + url('Montserrat-Bold.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-Bold.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Bold-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 700;\n        font-style: italic;\n        src: url(\"" + url('Montserrat-BoldItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-BoldItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat ExtraBold **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 800;\n        font-style: normal;\n        src: url(\"" + url('Montserrat-ExtraBold.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-ExtraBold.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat ExtraBold-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 800;\n        font-style: italic;\n        src: url(\"" + url('Montserrat-ExtraBoldItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-ExtraBoldItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Black **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 900;\n        font-style: normal;\n        src: url(\"" + url('Montserrat-Black.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-Black.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Black-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 900;\n        font-style: italic;\n        src: url(\"" + url('Montserrat-BlackItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('Montserrat-BlackItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** =================== MONTSERRAT ALTERNATES =================== **/\n    \n    /** Montserrat Alternates Thin **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 100;\n        font-style: normal;\n        src: url(\"" + url('MontserratAlternates-Thin.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-Thin.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Thin-Italic **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 100;\n        font-style: italic;\n        src: url(\"" + url('MontserratAlternates-ThinItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-ThinItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates ExtraLight **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 200;\n        font-style: normal;\n        src: url(\"" + url('MontserratAlternates-ExtraLight.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-ExtraLight.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates ExtraLight-Italic **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 200;\n        font-style: italic;\n        src: url(\"" + url('MontserratAlternates-ExtraLightItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-ExtraLightItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Light **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 300;\n        font-style: normal;\n        src: url(\"" + url('MontserratAlternates-Light.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-Light.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Light-Italic **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 300;\n        font-style: italic;\n        src: url(\"" + url('MontserratAlternates-LightItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-LightItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Regular **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 400;\n        font-style: normal;\n        src: url(\"" + url('MontserratAlternates-Regular.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-Regular.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Regular-Italic **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 400;\n        font-style: italic;\n        src: url(\"" + url('MontserratAlternates-Italic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-Italic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Medium **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 500;\n        font-style: normal;\n        src: url(\"" + url('MontserratAlternates-Medium.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-Medium.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Medium-Italic **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 500;\n        font-style: italic;\n        src: url(\"" + url('MontserratAlternates-MediumItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-MediumItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates SemiBold **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 600;\n        font-style: normal;\n        src: url(\"" + url('MontserratAlternates-SemiBold.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-SemiBold.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates SemiBold-Italic **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 600;\n        font-style: italic;\n        src: url(\"" + url('MontserratAlternates-SemiBoldItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-SemiBoldItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Bold **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 700;\n        font-style: normal;\n        src: url(\"" + url('MontserratAlternates-Bold.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-Bold.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Bold-Italic **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 700;\n        font-style: italic;\n        src: url(\"" + url('MontserratAlternates-BoldItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-BoldItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates ExtraBold **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 800;\n        font-style: normal;\n        src: url(\"" + url('MontserratAlternates-ExtraBold.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-ExtraBold.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates ExtraBold-Italic **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 800;\n        font-style: italic;\n        src: url(\"" + url('MontserratAlternates-ExtraBoldItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-ExtraBoldItalic.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Black **/\n    @font-face {\n        font-family: \"Montserrat Alternates\";\n        font-weight: 900;\n        font-style: normal;\n        src: url(\"" + url('MontserratAlternates-Black.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-Black.woff') + "\") format(\"woff\");\n    }\n    \n    /** Montserrat Alternates Black-Italic **/\n    @font-face {\n        font-family: \"Montserrat\";\n        font-weight: 900;\n        font-style: italic;\n        src: url(\"" + url('MontserratAlternates-BlackItalic.woff2') + "\") format(\"woff2\"),\n             url(\"" + url('MontserratAlternates-BlackItalic.woff') + "\") format(\"woff\");\n    }";
}
exports.get_fonts = get_fonts;
;

},{"webextension-polyfill-ts":1}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowDomDiv = void 0;
var ShadowDomDiv = /** @class */ (function () {
    /**
    * creates a shadow div and adds it to the front of the document
    * @param document the document
    */
    function ShadowDomDiv(document) {
        this.document = document;
        this.root_div = this.document.createElement("div");
        this.shadow = this.root_div.attachShadow({ mode: 'open' });
        this.div = this.document.createElement("div");
        this.shadow.appendChild(this.div);
        document.body.insertBefore(this.root_div, this.document.body.childNodes[0]);
    }
    Object.defineProperty(ShadowDomDiv.prototype, "visibility", {
        /**
         * set the visibility
         */
        set: function (visible) {
            this.div.style.visibility = visible ? 'visible' : 'hidden';
        },
        enumerable: false,
        configurable: true
    });
    /**
     * removes previous DOM modifications and returns null
     */
    ShadowDomDiv.prototype.delete = function () {
        this.root_div.remove();
    };
    return ShadowDomDiv;
}());
exports.ShadowDomDiv = ShadowDomDiv;
;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
var rect_1 = require("../common/rect");
var margin_1 = require("../common/margin");
var Utils;
(function (Utils) {
    var DOM;
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
            var rect = new rect_1.Rect(0, 0, 0, 0);
            var bounding_rect = element.getBoundingClientRect();
            rect.left = bounding_rect.left;
            rect.top = bounding_rect.top;
            rect.width = bounding_rect.width;
            rect.height = bounding_rect.height;
            return rect;
        }
        DOM.absolute_rect = absolute_rect;
        ;
        // TODO: get_text_input_value? (for distinguishing from element.isContentEditable)
        var StylingMargins = /** @class */ (function () {
            function StylingMargins() {
            }
            /**
             * calculate all space styling takes up until enclosing element
             */
            StylingMargins.calculate_all = function (element) {
                // document.body.appendChild(StylingMargins.parent_div);
                var computed_style = window.getComputedStyle(element);
                this.outer_div.style.border = computed_style.border;
                this.outer_div.style.padding = computed_style.padding;
                this.outer_div.style.margin = computed_style.margin;
                var inner_rect = this.inner_div.getBoundingClientRect();
                var outer_rect = this.outer_div.getBoundingClientRect();
                var bounds = new margin_1.Margin(inner_rect.left - outer_rect.left, inner_rect.top - outer_rect.top, inner_rect.right - outer_rect.right, inner_rect.bottom - outer_rect.bottom);
                // document.body.removeChild(StylingMargins.parent_div);
                return bounds;
            };
            /**
             * initializes the calc objects
             */
            StylingMargins._initialize = (function () {
                StylingMargins.parent_div = document.createElement("div");
                StylingMargins.shadow_root = StylingMargins.parent_div.attachShadow({ mode: 'closed' });
                StylingMargins.outer_div = document.createElement("div");
                StylingMargins.inner_div = document.createElement("div");
                StylingMargins.shadow_root.appendChild(StylingMargins.outer_div);
                StylingMargins.outer_div.appendChild(StylingMargins.inner_div);
                return true;
            })();
            return StylingMargins;
        }());
        DOM.StylingMargins = StylingMargins;
        ;
    })(DOM = Utils.DOM || (Utils.DOM = {}));
})(Utils = exports.Utils || (exports.Utils = {}));

},{"../common/margin":4,"../common/rect":6}]},{},[7]);
