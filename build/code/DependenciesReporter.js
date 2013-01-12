var DependenciesReporter, log, slang, _,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

log = console.log;

slang = require('./utils/slang');

DependenciesReporter = (function() {
  var dependencyTypesMessages;

  function DependenciesReporter(interestingDepTypes) {
    this.interestingDepTypes = interestingDepTypes != null ? interestingDepTypes : _.keys(dependencyTypesMessages);
    this.reportData = {};
  }

  dependencyTypesMessages = {
    untrustedRequireDependencies: {
      header: "\u001b[31m Untrusted require('') dependencies found:",
      footer: "They are IGNORED. If evaluated name of the require() isnt in dependency array [..] before require() call, your app WILL HALT and WILL NOT WORK on the web-side (but should be OK on node).\u001b[0m"
    },
    untrustedAsyncDependencies: {
      header: "\u001b[31m Untrusted async require(['']) dependencies found:",
      footer: "They are IGNORED. If evaluated name of the require([..]) isnt found, you'll get an http error on web, or exception 'module not found' on node.).\u001b[0m"
    },
    notFoundInBundle: {
      header: "\u001b[31m Bundle-looking dependencies not found in bundle:",
      footer: "They are added as-is.\u001b[0m"
    },
    external: {
      header: "External dependencies (not checked in this version):",
      footer: "They are added as-is."
    },
    global: {
      header: "Global-looking dependencies (not checked in this version):",
      footer: "They are added as-is."
    },
    webRoot: {
      header: "Web root dependencies '/' (not checked in this version):",
      footer: "They are added as-is."
    }
  };

  DependenciesReporter.prototype.reportTemplate = function(texts, dependenciesFound) {
    var dependency, mf, moduleFiles;
    return "\n" + texts.header + "\n  " + ((function() {
      var _results;
      _results = [];
      for (dependency in dependenciesFound) {
        moduleFiles = dependenciesFound[dependency];
        _results.push("'" + dependency + "' @ [    " + ((function() {
          var _i, _len, _results1;
          _results1 = [];
          for (_i = 0, _len = moduleFiles.length; _i < _len; _i++) {
            mf = moduleFiles[_i];
            _results1.push("\n         '" + mf + "'");
          }
          return _results1;
        })()) + "\n  ]\n");
      }
      return _results;
    })()) + texts.footer + "\n";
  };

  DependenciesReporter.prototype.reportDep = function(dep, modyle) {
    var depType;
    depType = dep.isGlobal() ? 'global' : !(dep.isBundleBoundary() || dep.isWebRoot()) ? 'external' : dep.isBundleBoundary() && !(dep.isFound() || dep.isGlobal()) ? 'notFoundInBundle' : dep.isWebRoot() ? 'webRoot' : '';
    if (depType) {
      return this.addReportData(slang.objkv({}, depType, [dep.resourceName]), modyle);
    }
  };

  DependenciesReporter.prototype.addReportData = function(resolvedDeps, modyle) {
    var depType, resDep, resDeps, _base, _base1, _i, _len;
    for (depType in resolvedDeps) {
      resDeps = resolvedDeps[depType];
      if (!((!_.isEmpty(resDeps)) && __indexOf.call(this.interestingDepTypes, depType) >= 0)) {
        continue;
      }
      (_base = this.reportData)[depType] || (_base[depType] = {});
      for (_i = 0, _len = resDeps.length; _i < _len; _i++) {
        resDep = resDeps[_i];
        ((_base1 = this.reportData[depType])[resDep] || (_base1[resDep] = [])).push(modyle);
      }
    }
    return null;
  };

  DependenciesReporter.prototype.getReport = function() {
    var depType, depTypesMsgs, report;
    report = "";
    for (depType in dependencyTypesMessages) {
      depTypesMsgs = dependencyTypesMessages[depType];
      if (__indexOf.call(this.interestingDepTypes, depType) >= 0) {
        if (this.reportData[depType]) {
          report += this.reportTemplate(depTypesMsgs, this.reportData[depType]);
        }
      }
    }
    return report;
  };

  return DependenciesReporter;

})();

module.exports = DependenciesReporter;
