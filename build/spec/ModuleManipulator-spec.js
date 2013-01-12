var ModuleManipulator, assert, chai, expect;

console.log('\nModuleManipulator-spec loading');

chai = require("chai");

assert = chai.assert;

expect = chai.expect;

ModuleManipulator = require("../code/moduleManipulation/ModuleManipulator");

describe("ModuleManipulator", function() {
  it("should identify any non-AMD/UMD module as a node one", function() {
    var js, mi;
    js = "  function dosomething(someVar) {\n    abc(['underscore', 'depdir1/dep1'], function(_, dep1) {\n       dep1=new dep1();\n       var j = require('something');\n       return dep1.doit();\n    });\n}";
    mi = (new ModuleManipulator(js)).extractModuleInfo();
    return expect(mi).to.deep.equal({
      moduleType: 'nodejs',
      requireDependencies: ['something']
    });
  });
  it("should identify a UMD module", function() {
    var js, mi;
    js = "(function (root, factory) {\n    \"use strict\";\n    if (typeof exports === 'object') {\n        var nodeRequire = require('urequire').makeNodeRequire('.', __dirname, '.');\n        module.exports = factory(nodeRequire);\n    } else if (typeof define === 'function' && define.amd) {\n        define(factory);\n    }\n})(this, function (require) {\n  doSomething();\n});";
    mi = (new ModuleManipulator(js)).extractModuleInfo();
    return expect(mi).to.deep.equal({
      moduleType: 'UMD'
    });
  });
  it("should extract basic AMD info", function() {
    var js, mi;
    js = "define(['underscore', 'depdir1/dep1'], function(_, dep1) {\n  dep1=new dep1();\n  return dep1.doit();\n});";
    mi = (new ModuleManipulator(js, {
      extractFactory: true
    })).extractModuleInfo();
    return expect(mi).to.deep.equal({
      arrayDependencies: ['underscore', 'depdir1/dep1'],
      moduleType: 'AMD',
      amdCall: 'define',
      parameters: ['_', 'dep1'],
      factoryBody: 'dep1=new dep1;return dep1.doit()'
    });
  });
  it("should extract AMD dependency-less module", function() {
    var js, mi;
    js = "define(function(){\n  return {foo:bar};\n});";
    mi = (new ModuleManipulator(js, {
      extractFactory: true
    })).extractModuleInfo();
    return expect(mi).to.deep.equal({
      moduleType: 'AMD',
      amdCall: 'define',
      factoryBody: 'return{foo:bar}'
    });
  });
  it("should extract AMD dependency-less with 'require' as factory param", function() {
    var js, mi;
    js = "define(function(require){\n  return {foo:bar};\n});";
    mi = (new ModuleManipulator(js, {
      extractFactory: true
    })).extractModuleInfo();
    return expect(mi).to.deep.equal({
      moduleType: 'AMD',
      amdCall: 'define',
      parameters: ['require'],
      factoryBody: 'return{foo:bar}'
    });
  });
  it("should ignore amdefine & extract urequire.rootExports and moduleName as well", function() {
    var js, mi;
    js = "if (typeof define !== 'function') { var define = require('amdefine')(module) };\n\n({\n  urequire: {\n    rootExports: 'myLib'\n  }\n});\n\ndefine('myModule', ['underscore', 'depdir1/dep1'], function(_, dep1) {\n  dep1=new dep1();\n  return dep1.doit();\n});";
    mi = (new ModuleManipulator(js, {
      extractFactory: true
    })).extractModuleInfo();
    return expect(mi).to.deep.equal({
      rootExports: 'myLib',
      moduleName: 'myModule',
      arrayDependencies: ['underscore', 'depdir1/dep1'],
      moduleType: 'AMD',
      amdCall: 'define',
      parameters: ['_', 'dep1'],
      factoryBody: 'dep1=new dep1;return dep1.doit()'
    });
  });
  return it("should extract require('..' ) dependencies along with everything else", function() {
    var js, mi;
    js = "if (typeof define !== 'function') { var define = require('amdefine')(module); };\n({\n  urequire: {\n    rootExports: 'myLib'\n  }\n});\n\ndefine('myModule', ['require', 'underscore', 'depdir1/dep1'], function(require, _, dep1) {\n  _ = require('underscore');\n  var i = 1;\n  var r = require('someRequire');\n  if (require === 'require') {\n   for (i=1; i < 100; i++) {\n      require('myOtherRequire');\n   }\n   require('myOtherRequire');\n  }\n  console.log(\"main-requiring starting....\");\n  var crap = require(\"crap\" + i); // untrustedRequireDependencies\n\n  require(['asyncDep1', 'asyncDep2'], function(asyncDep1, asyncDep2) {\n    if (require('underscore')) {\n        require(['asyncDepOk', 'async' + crap2], function(asyncDepOk, asyncCrap2) {\n          return asyncDepOk + asyncCrap2;\n        });\n    }\n    return asyncDep1 + asyncDep2;\n  });\n\n  return {require: require('finalRequire')};\n});";
    mi = (new ModuleManipulator(js, {
      extractFactory: true
    })).extractModuleInfo();
    return expect(mi).to.deep.equal({
      rootExports: 'myLib',
      moduleName: 'myModule',
      moduleType: 'AMD',
      amdCall: 'define',
      arrayDependencies: ['require', 'underscore', 'depdir1/dep1'],
      parameters: ['require', '_', 'dep1'],
      factoryBody: '_=require("underscore");var i=1;var r=require("someRequire");if(require==="require"){for(i=1;i<100;i++){require("myOtherRequire")}require("myOtherRequire")}console.log("main-requiring starting....");var crap=require("crap"+i);require(["asyncDep1","asyncDep2"],function(asyncDep1,asyncDep2){if(require("underscore")){require(["asyncDepOk","async"+crap2],function(asyncDepOk,asyncCrap2){return asyncDepOk+asyncCrap2})}return asyncDep1+asyncDep2});return{require:require("finalRequire")}',
      requireDependencies: ['someRequire', 'myOtherRequire', 'finalRequire'],
      untrustedRequireDependencies: ['"crap"+i'],
      asyncDependencies: ['asyncDep1', 'asyncDep2', 'asyncDepOk'],
      untrustedAsyncDependencies: ['"async"+crap2']
    });
  });
});
