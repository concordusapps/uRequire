var assert, chai, expect, pathRelative;

console.log('\npathRelative-test started');

chai = require('chai');

assert = chai.assert;

expect = chai.expect;

pathRelative = require("../code/paths/pathRelative");

describe("pathRelative(from, to)", function() {
  it("should work in simple cases", function() {
    var from, to, _ref;
    from = 'common\\a\\b';
    to = 'common\\d\\e';
    expect(pathRelative(from, to)).to.equal("../../d/e");
    _ref = [to, from], from = _ref[0], to = _ref[1];
    return expect(pathRelative(from, to)).to.equal("../../a/b");
  });
  it("should blank on identical path", function() {
    var from, to;
    from = to = 'common/a/b';
    return expect(pathRelative(from, to)).to.equal("");
  });
  it("should dot4Current on small identical path", function() {
    var from, to;
    from = to = '/a';
    return expect(pathRelative(from, to, {
      dot4Current: true
    })).to.equal(".");
  });
  it('should calc go-back & forth paths', function() {
    var from, to, _ref;
    from = "/y/work/p/project/sourceTest/code/main";
    to = "/y/work/p/project/source/code/main//";
    expect(pathRelative(from, to)).to.equal("../../../source/code/main");
    _ref = [to, from], from = _ref[0], to = _ref[1];
    return expect(pathRelative(from, to)).to.equal("../../../sourceTest/code/main");
  });
  it('should handle mixed unix & windows style seps & doubles `/`', function() {
    var from, to, _ref;
    from = "/y///work\\p///project\\sourceTest///code/main\\//";
    to = "/y\\work\\p\\project\\source\\code\\main";
    expect(pathRelative(from, to)).to.equal("../../../source/code/main");
    _ref = [to, from], from = _ref[0], to = _ref[1];
    return expect(pathRelative(from, to)).to.equal("../../../sourceTest/code/main");
  });
  it("should handle 'no path found' will null", function() {
    return expect(pathRelative('junk\\a\\b', 'bin\\a\\b')).to.be.a('null');
  });
  it('should handle go-back/go forwards only correctly', function() {
    var from, to, _ref;
    from = "/y/work/p/a/b/c/d/";
    to = "/y/work/p";
    expect(pathRelative(from, to)).to.equal("../../../..");
    _ref = [to, from], from = _ref[0], to = _ref[1];
    return expect(pathRelative(from, to)).to.equal("a/b/c/d");
  });
  it('should go from `root` to `to` and vise versa, with dot4Current', function() {
    var from, to, _ref;
    from = "$";
    to = "$/work/p";
    expect(pathRelative(from, to, {
      dot4Current: true
    })).to.equal("./work/p");
    _ref = [to, from], from = _ref[0], to = _ref[1];
    return expect(pathRelative(from, to, {
      dot4Current: true
    })).to.equal("../..");
  });
  it('should consume pointless back and forths', function() {
    var from, to, _ref;
    from = "/y/work/./p/./a/../b/./c/../../../";
    to = "/y/work/p/./d/.";
    expect(pathRelative(from, to)).to.equal("p/d");
    _ref = [to, from], from = _ref[0], to = _ref[1];
    return expect(pathRelative(from, to)).to.equal("../..");
  });
  it('should handle it all together', function() {
    var from, to, _ref;
    from = "/y/work/p/a/..\\b////c/../..\\../";
    to = "/y/work\\p/d/../n\\../m///e/f//";
    expect(pathRelative(from, to)).to.equal("p/m/e/f");
    _ref = [to, from], from = _ref[0], to = _ref[1];
    return expect(pathRelative(from, to)).to.equal("../../../..");
  });
  it('should go off cliff (BEFORE the common path), ONLY if `to` says so', function() {
    var from, to, _ref;
    from = "/work/p/a/";
    to = "/work/../../../f/g";
    expect(pathRelative(from, to)).to.equal("../../../../../f/g");
    _ref = [to, from], from = _ref[0], to = _ref[1];
    return expect(pathRelative(from, to)).to.equal(null);
  });
  it('should navigate back and forth correctly', function() {
    var from, to;
    from = "/work1/../work2/g";
    to = "/work1/p/a";
    return expect(pathRelative(from, to)).to.equal('../../work1/p/a');
  });
  return it('should understand if `from` is ambiguously off the cliff ', function() {
    var from, to;
    from = "/work/../../f/g";
    to = "/work/p/a/";
    return expect(pathRelative(from, to)).to.equal(null);
  });
});
