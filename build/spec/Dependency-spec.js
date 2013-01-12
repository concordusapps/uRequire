var Dependency, assert, chai, expect;

console.log('\nDependency-test started');

chai = require('chai');

assert = chai.assert;

expect = chai.expect;

Dependency = require("../code/Dependency");

describe("Dependency", function() {
  it("split plugin, extension, resourceName & recostruct as String", function() {
    var dep;
    dep = new Dependency('node!somedir/dep.js');
    expect(dep.pluginName).to.equal('node');
    expect(dep.extname).to.equal('.js');
    expect(dep.bundleRelative()).to.equal('somedir/dep.js');
    expect(dep.fileRelative()).to.equal('somedir/dep.js');
    expect(dep.toString()).to.equal('node!somedir/dep.js');
    return expect(dep.name({
      plugin: false,
      ext: false
    })).to.equal('somedir/dep');
  });
  return it("uses modyle & bundleFiles to convert from fileRelative", function() {
    var dep;
    dep = new Dependency('node!../../../rootdir/dep', 'path/from/bundleroot/modyle.js', ['rootdir/dep.js']);
    expect(dep.pluginName).to.equal('node');
    expect(dep.extname).to.equal(void 0);
    expect(dep.bundleRelative()).to.equal('rootdir/dep');
    expect(dep.fileRelative()).to.equal('../../../rootdir/dep');
    expect(dep.toString()).to.equal('node!../../../rootdir/dep');
    return expect(dep.name({
      plugin: false,
      relativeType: 'bundle'
    })).to.equal('rootdir/dep');
  });
});

describe("Dependency - resolving many", function() {
  return it("resolves bundle&file relative, finds external, global, notFound, webRoot", function() {
    var bundleFiles, bundleRelative, d, dep, deps, external, fileRelative, global, modyle, notFoundInBundle, strDependencies, webRoot, _i, _len;
    modyle = 'actions/greet.js';
    bundleFiles = ['main.js', 'actions/greet.js', 'calc/add.js', 'calc/multiply.js', 'calc/more/powerof.js', 'data/numbers.js', 'data/messages/bye.js', 'data/messages/hello.js'];
    strDependencies = ['underscore', 'data/messages/hello.js', '../data/messages/bye', '../lame/dir.js', '../../some/external/lib.js', '/assets/jpuery-max'];
    deps = [];
    for (_i = 0, _len = strDependencies.length; _i < _len; _i++) {
      dep = strDependencies[_i];
      deps.push(new Dependency(dep, modyle, bundleFiles));
    }
    fileRelative = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        _results.push(d.toString());
      }
      return _results;
    })();
    bundleRelative = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        _results.push(d.bundleRelative());
      }
      return _results;
    })();
    global = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        if (d.isGlobal()) {
          _results.push(d.toString());
        }
      }
      return _results;
    })();
    external = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        if (!(d.isBundleBoundary() || d.isWebRoot())) {
          _results.push(d.toString());
        }
      }
      return _results;
    })();
    notFoundInBundle = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        if (d.isBundleBoundary() && !(d.isFound() || d.isGlobal())) {
          _results.push(d.toString());
        }
      }
      return _results;
    })();
    webRoot = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = deps.length; _j < _len1; _j++) {
        d = deps[_j];
        if (d.isWebRoot()) {
          _results.push(d.toString());
        }
      }
      return _results;
    })();
    return expect({
      bundleRelative: bundleRelative,
      fileRelative: fileRelative,
      global: global,
      external: external,
      notFoundInBundle: notFoundInBundle,
      webRoot: webRoot
    }).to.deep.equal({
      bundleRelative: ['underscore', 'data/messages/hello.js', 'data/messages/bye', 'lame/dir.js', '../../some/external/lib.js', '/assets/jpuery-max'],
      fileRelative: ['underscore', '../data/messages/hello.js', '../data/messages/bye', '../lame/dir.js', '../../some/external/lib.js', '/assets/jpuery-max'],
      global: ['underscore'],
      external: ['../../some/external/lib.js'],
      notFoundInBundle: ['../lame/dir.js'],
      webRoot: ['/assets/jpuery-max']
    });
  });
});
