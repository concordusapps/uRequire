var Dependency, NR, assert, chai, dirname, expect, modyle, nr, rjsconf, upath, webRootMap, _, _fs;

console.log('\nNodeRequirer-test started');

chai = require('chai');

assert = chai.assert;

expect = chai.expect;

_ = require('lodash');

_fs = require('fs');

upath = require('../code/paths/upath');

NR = require("../code/NodeRequirer");

Dependency = require("../code/Dependency");

modyle = 'path/fromBundleRoot/toModuleName.js';

dirname = upath.dirname("" + __dirname + "/" + modyle);

webRootMap = '../fakeWebRoot/mapping/';

rjsconf = JSON.parse(_fs.readFileSync("" + __dirname + "/requirejs.config.json", 'utf-8'));

nr = new NR(modyle, dirname, webRootMap);

describe("NodeRequirer basics:", function() {
  it("identifies bundleRoot", function() {
    return expect(nr.bundleRoot).to.equal(upath.normalize("" + __dirname + "/"));
  });
  it("identifies webRoot", function() {
    return expect(nr.webRoot).to.equal(upath.normalize("" + __dirname + "/" + webRootMap));
  });
  it("loads 'requirejs.config.json' from bundleRoot", function() {
    return expect(nr.getRequireJSConfig()).to.deep.equal(rjsconf);
  });
  it("nodejs require-mock called with correct module path", function() {
    var modulePath;
    modulePath = '';
    nr.nodeRequire = function(m) {
      return modulePath = m;
    };
    nr.require('path/fromBundleRoot/to/anotherModule');
    return expect(modulePath).to.equal(upath.normalize("" + __dirname + "/path/fromBundleRoot/to/anotherModule"));
  });
  return describe("resolves Dependency paths:", function() {
    it("global-looking Dependency", function() {
      var resolvedDeps;
      return expect(resolvedDeps = nr.resolvePaths(new Dependency('underscore', modyle))).to.deep.equal(['underscore', upath.normalize("" + __dirname + "/underscore")]);
    });
    it("bundleRelative Dependency", function() {
      var depStr;
      depStr = 'some/pathTo/depName';
      return expect(nr.resolvePaths(new Dependency(depStr, modyle))).to.deep.equal([upath.normalize("" + __dirname + "/" + depStr)]);
    });
    it("fileRelative Dependency", function() {
      return expect(nr.resolvePaths(new Dependency('./rel/pathTo/depName', modyle))).to.deep.equal([upath.normalize("" + __dirname + "/" + (upath.dirname(modyle)) + "/rel/pathTo/depName")]);
    });
    return it("requirejs config {paths:..} Dependency", function() {
      return expect(nr.resolvePaths(new Dependency('src/depName', modyle))).to.deep.equal([upath.normalize("" + __dirname + "/../../src/depName")]);
    });
  });
});

describe("NodeRequirer uses requirejs config :", function() {
  it("statically stores parsed 'requirejs.config.json' for this bundleRoot", function() {
    return expect(NR.prototype.requireJSConfigs[nr.bundleRoot]).to.deep.equal(rjsconf);
  });
  it("identifies bundleRoot, via baseUrl (relative to webRoot)", function() {
    var baseUrl_webMap_relative;
    baseUrl_webMap_relative = "/some/webRoot/path";
    NR.prototype.requireJSConfigs[upath.normalize(__dirname + '/')].baseUrl = baseUrl_webMap_relative;
    nr = new NR(modyle, dirname, webRootMap);
    return expect(nr.bundleRoot).to.equal(upath.normalize("" + __dirname + "/" + webRootMap + "/" + baseUrl_webMap_relative + "/"));
  });
  return it("identifies bundleRoot, via baseUrl (relative to bundleRoot)", function() {
    var baseUrl_webMap_bundleRootRelative;
    baseUrl_webMap_bundleRootRelative = "../some/other/path";
    NR.prototype.requireJSConfigs[upath.normalize(__dirname + '/')].baseUrl = baseUrl_webMap_bundleRootRelative;
    nr = new NR(modyle, dirname, webRootMap);
    return expect(nr.bundleRoot).to.equal(upath.normalize("" + __dirname + "/" + baseUrl_webMap_bundleRootRelative + "/"));
  });
});
