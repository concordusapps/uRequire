var version = '0.2.9-3';var Dependency, NodeRequirer, debugLevel, l, ldebug, pathRelative, upath, _, _fs,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

_fs = require('fs');

upath = require('./paths/upath');

pathRelative = require('./paths/pathRelative');

Dependency = require('./Dependency');

l = require('./utils/logger');

debugLevel = 0;

ldebug = l.debug;

l.debug = function(level, msg) {
  if (_.isString(level)) {
    msg = level;
    level = 99999;
  }
  if (level <= debugLevel) {
    return ldebug(("" + level + ": *NodeRequirer " + version + "*: ") + msg);
  }
};

/*
The `nodejs`'s require facility.

An instance of `NodeRequirer` is created for each UMD module, when running on node. Its purpose is to resolve and load modules, synchronoysly or asynchronoysly, depending on how it was called:

  * sync (blocking): when call was made the nodejs way `require('dependency')` in which case the module is simply loaded & returned.

  * async (immediatelly returning): when called the AMD/requirejs way `require(['dep1', 'dep2'], function(dep1, dep2) {})` in which case the callback function is called, when all modules/dependencies have been loaded asynchronously.

@note: it used to mimic the inconsistent RequireJS 2.0.x behaviour on the `require([..],->`, where if all deps are loaded before, then the call is SYNCHRONOUS :-(. It is now reverted to the [always asynch 2.1.x behaviour](https://github.com/jrburke/requirejs/wiki/Upgrading-to-RequireJS-2.1#wiki-breaking-async)

@author Agelos Pikoulas
*/


NodeRequirer = (function() {
  var _this = this;

  Function.prototype.property = function(props) {
    var descr, name, _results;
    _results = [];
    for (name in props) {
      descr = props[name];
      _results.push(Object.defineProperty(this.prototype, name, descr));
    }
    return _results;
  };

  Function.prototype.staticProperty = function(props) {
    var descr, name, _results;
    _results = [];
    for (name in props) {
      descr = props[name];
      _results.push(Object.defineProperty(NodeRequirer.prototype, name, descr));
    }
    return _results;
  };

  /*
    functionSniffer wants constructor being dummy that calls the real one;-)
  */


  function NodeRequirer() {
    this.require = __bind(this.require, this);

    this.loadModule = __bind(this.loadModule, this);
    this._constructor.apply(this, arguments);
  }

  /*
    Create a NodeRequirer instance, passing paths resolution information.
  
    @param {String} modyle `module` name of current UMD module (that calls 'require'). Relative to bundle, eg 'models/Person', as hardcoded in generated uRequire UMD.
    @param {String} dirname `__dirname` passed at runtime from the UMD module, poiniting to its self (i.e filename of the .js file).
    @param {String} webRootMap where '/' is mapped when running on nodejs, as hardcoded in uRequire UMD (relative to bundleRoot).
  */


  NodeRequirer.prototype._constructor = function(modyle, dirname, webRootMap) {
    var baseUrl, oldBundleRoot;
    this.modyle = modyle;
    this.dirname = dirname;
    this.webRootMap = webRootMap;
    this.bundleRoot = upath.normalize(this.dirname + '/' + (pathRelative("$/" + (upath.dirname(this.modyle)), "$/")) + '/');
    l.debug(6, "new NodeRequirer(\n  @modyle='" + this.modyle + "'\n  @dirname='" + this.dirname + "'\n  @webRootMap='" + this.webRootMap + "')\n\n  - calculated @bundleRoot (from @modyle & @dirname) = " + this.bundleRoot);
    if (this.getRequireJSConfig().baseUrl) {
      oldBundleRoot = this.bundleRoot;
      baseUrl = this.getRequireJSConfig().baseUrl;
      l.debug(7, "  - `baseUrl` (from requireJsConfig ) = " + baseUrl);
      this.bundleRoot = upath.normalize((baseUrl[0] === '/' ? this.webRoot : this.bundleRoot) + '/' + baseUrl + '/');
      return l.debug(5, "    - final `@bundleRoot` (from requireJsConfig.baseUrl & @bundleRoot) = " + this.bundleRoot);
    }
  };

  NodeRequirer.property({
    webRoot: {
      get: function() {
        return upath.normalize("" + (this.webRootMap[0] === '.' ? this.bundleRoot + '/' + this.webRootMap : this.webRootMap));
      }
    }
  });

  /*
    @property {Function}
    A @staticProperty (class variable) that defaults to node's `require`.
    It can be swaped with another/mock version (eg by spec tests).
  */


  NodeRequirer.prototype.nodeRequire = void 0;

  NodeRequirer.staticProperty({
    nodeRequire: {
      get: function() {
        return NodeRequirer._nodeRequire || require;
      },
      set: function(_nodeRequire) {
        NodeRequirer._nodeRequire = _nodeRequire;
      }
    }
  });

  NodeRequirer.property({
    debugInfo: {
      get: function() {
        var bundleRootsRjs, bundleRootsRjsConfig, config, di, rjs, rjsConfig, rjsConfigs, rjsLoaded, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
        di = {
          bundleRoot: this.bundleRoot,
          webRoot: this.webRoot
        };
        rjsLoaded = di["requirejsLoaded[@bundleRoot]"] = {};
        _ref = NodeRequirer.prototype.requirejsLoaded;
        for (bundleRootsRjs in _ref) {
          rjs = _ref[bundleRootsRjs];
          rjsConfig = rjsLoaded[bundleRootsRjs] = {};
          rjsConfig["requirejs._.config.baseUrl"] = (_ref1 = rjs.s) != null ? (_ref2 = _ref1.contexts) != null ? (_ref3 = _ref2._) != null ? _ref3.config.baseUrl : void 0 : void 0 : void 0;
          rjsConfig["requirejs._.config.paths"] = (_ref4 = rjs.s) != null ? (_ref5 = _ref4.contexts) != null ? (_ref6 = _ref5._) != null ? _ref6.config.paths : void 0 : void 0 : void 0;
        }
        rjsConfigs = di["requireJSConfigs[@bundleRoot]"] = {};
        _ref7 = NodeRequirer.prototype.requireJSConfigs;
        for (bundleRootsRjsConfig in _ref7) {
          config = _ref7[bundleRootsRjsConfig];
          rjsConfigs[bundleRootsRjsConfig] = config;
        }
        return JSON.stringify(di, null, ' ');
      }
    }
  });

  /*
    @property {Set<module>}
    Stores all modules loaded so far. Its `static` i.e a class variable, shared among all instances.
  */


  NodeRequirer.prototype.cachedModules = {};

  /*
    Load 'requirejs.config.json' for @bundleRoot & cache it with @bundleRoot as key.
    @return {RequireJSConfig object} the requireJSConfig for @bundleRoot (or {} if 'requirejs.config.json' not found/not valid json)
  */


  NodeRequirer.prototype.getRequireJSConfig = function() {
    var rjsc, _base, _base1, _name, _ref, _ref1;
    if ((_ref = (_base = NodeRequirer.prototype).requireJSConfigs) == null) {
      _base.requireJSConfigs = {};
    }
    if (NodeRequirer.prototype.requireJSConfigs[this.bundleRoot] === void 0) {
      try {
        rjsc = require('fs').readFileSync(this.bundleRoot + 'requirejs.config.json', 'utf-8');
      } catch (error) {

      }
      if (rjsc) {
        try {
          NodeRequirer.prototype.requireJSConfigs[this.bundleRoot] = JSON.parse(rjsc);
        } catch (error) {
          l.err("urequire: error parsing requirejs.config.json from " + (this.bundleRoot + 'requirejs.config.json'));
        }
      }
      if ((_ref1 = (_base1 = NodeRequirer.prototype.requireJSConfigs)[_name = this.bundleRoot]) == null) {
        _base1[_name] = {};
      }
    }
    return NodeRequirer.prototype.requireJSConfigs[this.bundleRoot];
  };

  /*
    Load the [Requirejs](http://requirejs.org/) system module (as npm installed), & cache for @bundleRoot as key.
  
    Then cache it in static NodeRequirer::requirejsLoaded[@bundleRoot], so only one instance
    is shared among all `NodeRequirer`s for a given @bundleRoot. Hence, its created only once,
    first time it's needed (for each distinct @bundleRoot).
  
    It is configuring rjs with resolved paths, for each of the paths entry in `requirejs.config.json`.
    Resolved paths are relative to `@bundleRoot` (instead of `@dirname`).
  
    @return {requirejs} The module `RequireJS` for node, configured for this @bundleRoot.
  */


  NodeRequirer.prototype.getRequirejs = function() {
    var pathEntries, pathEntry, pathName, requireJsConf, requirejs, resolvedPath, _base, _base1, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    if ((_ref = (_base = NodeRequirer.prototype).requirejsLoaded) == null) {
      _base.requirejsLoaded = {};
    }
    if (!NodeRequirer.prototype.requirejsLoaded[this.bundleRoot]) {
      requirejs = this.nodeRequire('requirejs');
      requireJsConf = {
        nodeRequire: this.nodeRequire,
        baseUrl: this.bundleRoot
      };
      if (this.getRequireJSConfig().paths) {
        requireJsConf.paths = {};
        _ref1 = this.getRequireJSConfig().paths;
        for (pathName in _ref1) {
          pathEntries = _ref1[pathName];
          if (!_(pathEntries).isArray()) {
            pathEntries = [pathEntries];
          }
          (_base1 = requireJsConf.paths)[pathName] || (_base1[pathName] = []);
          for (_i = 0, _len = pathEntries.length; _i < _len; _i++) {
            pathEntry = pathEntries[_i];
            _ref2 = this.resolvePaths(new Dependency(pathEntry), this.bundleRoot);
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              resolvedPath = _ref2[_j];
              if (!(__indexOf.call(requireJsConf.paths[pathName], resolvedPath) >= 0)) {
                requireJsConf.paths[pathName].push(resolvedPath);
              }
            }
          }
        }
      }
      requirejs.config(requireJsConf);
      NodeRequirer.prototype.requirejsLoaded[this.bundleRoot] = requirejs;
    }
    return NodeRequirer.prototype.requirejsLoaded[this.bundleRoot];
  };

  /*
    For a given `Dependency`, resolve *all possible* paths to the file.
  
    `resolvePaths` is respecting:
         - The `Dependency`'s own semantics, eg `webRoot` if `dep` is relative to web root (i.e starts with `\`) and similarly for isRelative etc. See <code>Dependency</code>
         - `@relativeTo` param, which defaults to the module file calling `require` (ie. @dirname), but can be anything eg. @bundleRoot.
         - `requirejs` config, if it exists in this instance of NodeRequirer
  
    @param {Dependency} dep The Dependency instance whose paths we are resolving.
    @param {String} relativeTo Resolve relative to this path. Default is `@dirname`, i.e the module/file that called `require`
  
    @return {Array<String>} The resolved paths of the Dependency
  */


  NodeRequirer.prototype.resolvePaths = function(dep, relativeTo) {
    var addit, depName, path, pathStart, paths, resPaths, _i, _len, _ref;
    if (relativeTo == null) {
      relativeTo = this.dirname;
    }
    depName = dep.name({
      plugin: false,
      ext: true
    });
    resPaths = [];
    addit = function(path) {
      return resPaths.push(upath.normalize(path));
    };
    if (dep.isFileRelative()) {
      addit(relativeTo + '/' + depName);
    } else {
      if (dep.isWebRoot()) {
        addit(this.webRoot + depName);
      } else {
        pathStart = depName.split('/')[0];
        if ((_ref = this.getRequireJSConfig().paths) != null ? _ref[pathStart] : void 0) {
          paths = this.getRequireJSConfig().paths[pathStart];
          if (!_(paths).isArray()) {
            paths = [paths];
          }
          for (_i = 0, _len = paths.length; _i < _len; _i++) {
            path = paths[_i];
            addit(this.bundleRoot + (depName.replace(pathStart, path)));
          }
        } else {
          if (dep.isRelative()) {
            addit(this.bundleRoot + depName);
          } else {
            addit(this.bundleRoot + depName);
            addit(depName);
          }
        }
      }
    }
    return resPaths;
  };

  /*
    Loads *one* module, synchronously.
  
    Uses either node's `require` or the synchronous version of `RequireJs`'s.
    The latter is used for modules that :
      * either have a plugin (eg `"text!module.txt"`)
      * or modules that failed to load with node's require: these are assumed to be native AMD, hence and attempt is made to load with RequireJS.
  
    @note If loading failures occur, it makes more than one attempts to find/load a module (alt paths & node/rjs require), noting loading errors. If all loading attempts fail, **it QUITS with process.exit(1)**.
  
    @param {Dependency} dep The Dependency to be load.
    @return {module} loaded module or quits if it fails
  */


  NodeRequirer.prototype.loadModule = function(dep) {
    var addExt, att, attempts, err1, err2, err3, isCached, loadedModule, modulePath, resolvedPathNo, _i, _len, _modulePath, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    attempts = [];
    isCached = false;
    loadedModule = null;
    _ref = this.resolvePaths(dep, this.dirname);
    for (resolvedPathNo = _i = 0, _len = _ref.length; _i < _len; resolvedPathNo = ++_i) {
      modulePath = _ref[resolvedPathNo];
      if (!(!loadedModule)) {
        continue;
      }
      _modulePath = modulePath;
      if ((loadedModule = this.cachedModules[_modulePath])) {
        isCached = true;
      } else {
        if ((_ref1 = dep.pluginName) === (void 0) || _ref1 === 'node') {
          l.debug(95, "@nodeRequire '" + _modulePath + "'");
          attempts.push({
            modulePath: _modulePath,
            requireUsed: 'nodeRequire',
            resolvedPathNo: resolvedPathNo,
            dependency: {
              name: dep.name(),
              type: dep.type
            }
          });
          try {
            loadedModule = this.nodeRequire(_modulePath);
          } catch (err) {
            if (err1 === void 0 || err.toString() !== "Error: Cannot find module 'main'") {
              err1 = err;
            }
            l.debug(35, "FAILED: @nodeRequire '" + _modulePath + "' \n err=\n", err);
            _.extend(_.last(attempts), {
              urequireError: "Error loading node or UMD module through nodejs require.",
              error: {
                name: err.name,
                message: err.message,
                errToString: err.toString(),
                err: err
              }
            });
            addExt = function(file, ext) {
              var endsWith;
              endsWith = function(str, suffix) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1;
              };
              return file + (endsWith(file, ext) ? '' : ext);
            };
            _modulePath = addExt(_modulePath, '.js');
            if (!dep.isGlobal()) {
              l.debug(25, "FAILURE caused: @getRequirejs() '" + _modulePath + "'");
              attempts.push({
                modulePath: _modulePath,
                requireUsed: 'RequireJS',
                resolvedPathNo: resolvedPathNo,
                dependency: {
                  name: dep.name(),
                  type: dep.type
                }
              });
              try {
                loadedModule = this.getRequirejs()(_modulePath);
              } catch (err) {
                err2 = err;
                l.debug(35, "FAILED: @getRequirejs() '" + _modulePath + "' \n err=" + err2);
                _.extend(_.last(attempts), {
                  urequireError: "Error loading module through RequireJS; it previously failed with node's require.",
                  error: {
                    name: err2.name,
                    message: err2.message,
                    errToString: err2.toString(),
                    err: err2
                  }
                });
              }
            }
          }
        } else {
          _modulePath = "" + dep.pluginName + "!" + _modulePath;
          l.debug(25, "PLUGIN caused: @getRequirejs() '" + _modulePath + "'");
          attempts.push({
            modulePath: _modulePath,
            requireUsed: 'RequireJS',
            resolvedPathNo: resolvedPathNo,
            dependency: {
              name: dep.name(),
              type: dep.type,
              pluginName: dep.pluginName
            },
            pluginPaths: (_ref2 = this.requireJSConfig) != null ? _ref2.paths[dep.pluginName] : void 0,
            pluginResolvedPaths: (_ref3 = this.requirejs) != null ? (_ref4 = _ref3.s) != null ? (_ref5 = _ref4.contexts) != null ? (_ref6 = _ref5._) != null ? (_ref7 = _ref6.config) != null ? _ref7.paths[dep.pluginName] : void 0 : void 0 : void 0 : void 0 : void 0
          });
          try {
            loadedModule = this.getRequirejs()(_modulePath);
          } catch (err) {
            err3 = err;
            _.extend(_.last(attempts), {
              urequireError: "Error loading *plugin* module through RequireJS.",
              error: {
                name: err3.name,
                message: err3.message,
                errToString: err3.toString(),
                err: err3
              }
            });
          }
        }
      }
    }
    if (!loadedModule) {
      l.err("\n\n*uRequire " + version + "*: failed to load dependency: '" + dep + "' in module '" + this.modyle + "' from " + _modulePath + "\nQuiting with throwing 1st error - Detailed attempts follow:\n" + ((function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = attempts.length; _j < _len1; _j++) {
          att = attempts[_j];
          _results.push(JSON.stringify(att, null, ' '));
        }
        return _results;
      })()) + "\n\nDebug info:\n", this.debugInfo);
      throw err1;
    } else {
      l.debug(70, "" + (isCached ? "CACHE-" : '') + "loaded module: '" + (dep.name()) + "'\n        from : '" + _modulePath + "' :-)");
      if (!isCached) {
        l.debug(50, "debugInfo = \u001b[33m" + this.debugInfo + "\"");
      }
      return this.cachedModules[_modulePath] = loadedModule;
    }
  };

  /*
    The actual `require` method, called as synchronous or asynchronous.
  
    It is the method passed to the *factoryBody* of UMD modules
      (i.e what you call on your uRequire module when running on node)
    and the one used to load all deps before entering the module's factoryBody.
  
    @param { String, Array<String> } strDeps
        As `String`, its a single dependency to load *synchronously*, eg `"models/person"` or `'text!abc.txt'`
        As `Array<String>`, its an array of dependencies to load *asynchronously* the AMD/RequireJS way, eg `[ "models/person" or 'text!abc.txt' ]`
  
    @param {Function} callback The callback function to call when all dependencies are loaded, called asynchronously by default
            (or synchronously if all dependencies were cached, when it matched RequireJs's 2.0.x behaviour
            [not needed any more in 2.1.x](https://github.com/jrburke/requirejs/wiki/Upgrading-to-RequireJS-2.1#wiki-breaking-async) )
    @return {module} module loaded if called *synchronously*, or `undefined` if it was called *asynchronously* (why?)
  */


  NodeRequirer.prototype.require = function(strDeps, callback) {
    var dep, deps, loadDepsAndCall, strDep, _i, _len,
      _this = this;
    if (_(strDeps).isString()) {
      return this.loadModule(new Dependency(strDeps, this.modyle));
    } else {
      if (_(strDeps).isArray()) {
        deps = [];
        for (_i = 0, _len = strDeps.length; _i < _len; _i++) {
          strDep = strDeps[_i];
          deps.push(dep = new Dependency(strDep, this.modyle));
        }
        loadDepsAndCall = function() {
          var loadedDeps, _j, _len1;
          loadedDeps = [];
          for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
            dep = deps[_j];
            loadedDeps.push(_this.loadModule(dep));
          }
          if (_(callback).isFunction()) {
            return callback.apply(null, loadedDeps);
          }
        };
        process.nextTick(function() {
          return loadDepsAndCall();
        });
      }
    }
    return void 0;
  };

  return NodeRequirer;

}).call(this);

module.exports = NodeRequirer;
