var version = '0.2.9-3';var Dependency, ModuleGeneratorTemplates, ModuleManipulator, convertModule, l, _,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

ModuleGeneratorTemplates = require('../templates/ModuleGeneratorTemplates');

ModuleManipulator = require("../moduleManipulation/ModuleManipulator");

Dependency = require("../Dependency");

l = require('../utils/logger');

/*
@param {String} modyle The module name
@param {String} oldModuleJs The javascript content of the original/old module
@param {Array<String>} bundleFiles A list of the names of all files in bundle (bundle root directory)
@param {Object} options Options for conversion as passed by urequireCmd.
@param {DependencyReporter} reporter an optional `DependencyReporter`

@return {String} the converted module js
*/


convertModule = function(modyle, oldJs, bundleFiles, options, reporter) {
  var arrayDependencies, arrayDeps, asyncDeps, d, dep, deps, moduleInfo, moduleManipulator, newJs, pd, repData, reqDep, requireDeps, requireReplacements, strDep, strDepsArray, templateInfo, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
  moduleManipulator = new ModuleManipulator(oldJs, {
    beautify: true
  });
  moduleInfo = moduleManipulator.extractModuleInfo();
  if (_.isEmpty(moduleInfo)) {
    l.warn("Not AMD/node module '" + modyle + "', copying as-is.");
    newJs = oldJs;
  } else if (moduleInfo.moduleType === 'UMD') {
    l.warn("Already UMD module '" + modyle + "', copying as-is.");
    newJs = oldJs;
  } else if (moduleInfo.untrustedArrayDependencies) {
    l.err("Module '" + modyle + "', has untrusted deps " + ((function() {
      var _i, _len, _ref, _results;
      _ref = moduleInfo.untrustedDependencies;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        d = _ref[_i];
        _results.push(d);
      }
      return _results;
    })()) + ": copying as-is.");
    newJs = oldJs;
  } else {
    if ((_ref = moduleInfo.parameters) == null) {
      moduleInfo.parameters = [];
    }
    if ((_ref1 = moduleInfo.arrayDependencies) == null) {
      moduleInfo.arrayDependencies = [];
    }
    if (options.noExport) {
      delete moduleInfo.rootExports;
    } else {
      if (moduleInfo.rootExport) {
        moduleInfo.rootExports = moduleInfo.rootExport;
      }
      if (moduleInfo.rootExports) {
        if (!_.isArray(moduleInfo.rootExports)) {
          moduleInfo.rootExports = [moduleInfo.rootExports];
        }
      }
    }
    if (reporter) {
      _ref2 = [_.pick(moduleInfo, reporter.interestingDepTypes)];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        repData = _ref2[_i];
        reporter.addReportData(repData, modyle);
      }
    }
    if (_.isEmpty(moduleInfo.arrayDependencies)) {
      moduleInfo.parameters = [];
    } else {
      moduleInfo.parameters = moduleInfo.parameters.slice(0, (moduleInfo.arrayDependencies.length - 1) + 1 || 9e9);
    }
    _ref3 = [moduleInfo.parameters, moduleInfo.arrayDependencies];
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      pd = _ref3[_j];
      if (pd[0] === 'require') {
        pd.shift();
      }
    }
    requireReplacements = {};
    _ref4 = (function() {
      var _k, _l, _len2, _len3, _ref4, _ref5, _results;
      _ref4 = [moduleInfo.arrayDependencies, moduleInfo.requireDependencies, moduleInfo.asyncDependencies];
      _results = [];
      for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
        strDepsArray = _ref4[_k];
        deps = [];
        _ref5 = strDepsArray || [];
        for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
          strDep = _ref5[_l];
          dep = new Dependency(strDep, modyle, bundleFiles);
          deps.push(dep);
          requireReplacements[strDep] = dep.name(options.relativeType);
          if (reporter) {
            reporter.reportDep(dep, modyle);
          }
        }
        _results.push(deps);
      }
      return _results;
    })(), arrayDeps = _ref4[0], requireDeps = _ref4[1], asyncDeps = _ref4[2];
    moduleInfo.factoryBody = moduleManipulator.getFactoryWithReplacedRequires(requireReplacements);
    arrayDependencies = (function() {
      var _k, _len2, _results;
      _results = [];
      for (_k = 0, _len2 = arrayDeps.length; _k < _len2; _k++) {
        d = arrayDeps[_k];
        _results.push(d.toString());
      }
      return _results;
    })();
    if (!(_.isEmpty(arrayDependencies) && options.scanAllow && !moduleInfo.rootExports)) {
      for (_k = 0, _len2 = requireDeps.length; _k < _len2; _k++) {
        reqDep = requireDeps[_k];
        if (reqDep.pluginName !== 'node' && !(_ref5 = reqDep.toString(), __indexOf.call(arrayDependencies, _ref5) >= 0)) {
          arrayDependencies.push(reqDep.toString());
        }
      }
    }
    templateInfo = {
      version: version,
      moduleType: moduleInfo.moduleType,
      modulePath: modyle,
      webRootMap: options.webRootMap || '.',
      arrayDependencies: arrayDependencies,
      nodeDependencies: options.allNodeRequires ? arrayDependencies : (function() {
        var _l, _len3, _results;
        _results = [];
        for (_l = 0, _len3 = arrayDeps.length; _l < _len3; _l++) {
          d = arrayDeps[_l];
          _results.push(d.name());
        }
        return _results;
      })(),
      parameters: moduleInfo.parameters,
      factoryBody: moduleInfo.factoryBody,
      rootExports: moduleInfo.rootExports,
      noConflict: moduleInfo.noConflict,
      nodejs: moduleInfo.nodejs
    };
    l.verbose('Template params (main):\n', _.omit(templateInfo, 'version', 'modulePath', 'factoryBody'));
    newJs = (new ModuleGeneratorTemplates(templateInfo))[options.template]();
  }
  return newJs;
};

module.exports = convertModule;
