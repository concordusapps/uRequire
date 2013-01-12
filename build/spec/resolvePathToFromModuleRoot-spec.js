var assert, chai, expect, resolvePathToFromModuleRoot;

console.log('\nresolvePathToFromModuleRoot-test started');

chai = require('chai');

resolvePathToFromModuleRoot = require("../code/paths/resolvePathToFromModuleRoot");

assert = chai.assert;

expect = chai.expect;

describe("Has bundle root as default for webRootMap", function() {
  it("counts 0 steps to reach bundle root from modyle @ bundle root", function() {
    return expect(resolvePathToFromModuleRoot('rootModule.js', null)).to.equal('.');
  });
  return it("counts 2 steps to reach bundle root from modyle @ 2 dirs from bundle root", function() {
    return expect(resolvePathToFromModuleRoot('dir1/dir2/someModule.js', null)).to.equal('../..');
  });
});

describe("Adjusts relative webRootMap paths to bundle root", function() {
  it("counts 0 extra steps to reach webRootMap from modyle @ root ", function() {
    return expect(resolvePathToFromModuleRoot('rootModule.js', '../../relative/path')).to.equal('../../relative/path');
  });
  return it("counts 2 extra steps to reach bundle path from modyle ", function() {
    return expect(resolvePathToFromModuleRoot('dir1/dir2/someModule.js', '..\\..\\relative\\path')).to.equal('../../../../relative/path');
  });
});

describe("puts absolute OS webRootMap paths as is", function() {
  return it("only fixes \\ to /", function() {
    return expect(resolvePathToFromModuleRoot('does/not/matter/Module.js', '/absolute\\os\\path')).to.equal('/absolute/os/path');
  });
});
