var Dependency, pathRelative, _path,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_path = require('path');

pathRelative = require('./paths/pathRelative');

Dependency = (function() {

  function Dependency(dep, modyle, bundleFiles) {
    var indexOfSep;
    this.dep = dep;
    this.modyle = modyle != null ? modyle : '';
    this.bundleFiles = bundleFiles != null ? bundleFiles : [];
    this.dep = this.dep.replace(/\\/g, '\/');
    indexOfSep = this.dep.indexOf('!');
    if (indexOfSep > 0) {
      this.pluginName = this.dep.slice(0, (indexOfSep - 1) + 1 || 9e9);
    }
    this.resourceName = indexOfSep >= 0 ? this.dep.slice(indexOfSep + 1, (this.dep.length - 1) + 1 || 9e9) : this.dep;
    if (_path.extname(this.resourceName)) {
      this.extname = _path.extname(this.resourceName);
    }
  }

  Dependency.prototype.bundleRelative = function() {
    if (this.isFileRelative() && this.isBundleBoundary()) {
      return (_path.normalize("" + (_path.dirname(this.modyle)) + "/" + this.resourceName)).replace(/\\/g, '\/');
    } else {
      return this.resourceName;
    }
  };

  Dependency.prototype.fileRelative = function() {
    if (this.modyle && this.isFound()) {
      return pathRelative("$/" + (_path.dirname(this.modyle)), "$/" + (this.bundleRelative()), {
        dot4Current: true
      });
    } else {
      return this.resourceName;
    }
  };

  Dependency.prototype.isBundleBoundary = function() {
    if (this.isWebRoot() || (!this.modyle)) {
      return false;
    } else {
      return !!pathRelative("$/" + this.modyle + "/../../" + this.resourceName, "$");
    }
  };

  Dependency.prototype.toString = function() {
    return name();
  };

  Dependency.prototype.name = function(options) {
    var n, _ref, _ref1, _ref2;
    if (options == null) {
      options = {};
    }
    if ((_ref = options.ext) == null) {
      options.ext = true;
    }
    if ((_ref1 = options.plugin) == null) {
      options.plugin = true;
    }
    //if ((_ref2 = options.relativeType) == null) {
      options.relativeType = 'bundle';
    //}
    n = "" + ((options != null ? options.plugin : void 0) && this.pluginName ? this.pluginName + '!' : '') + ((options != null ? options.relativeType : void 0) === 'bundle' ? this.bundleRelative() : this.fileRelative());
    if (options.ext || !this.extname) {
      return n;
    } else {
      return n.slice(0, ((n.length - this.extname.length) - 1) + 1 || 9e9);
    }
  };

  Dependency.prototype.toString = function() {
    return this.name({
      plugin: true,
      relativeType: 'file',
      ext: true
    });
  };

  Dependency.prototype.isFileRelative = function() {
    return this.resourceName[0] === '.';
  };

  Dependency.prototype.isRelative = function() {
    return this.resourceName.indexOf('/') >= 0 && !this.isWebRoot();
  };

  Dependency.prototype.isWebRoot = function() {
    return this.resourceName[0] === '/';
  };

  Dependency.prototype.isGlobal = function() {
    return !this.isWebRoot() && !this.isRelative() && !this.isFound();
  };

  Dependency.prototype.isFound = function() {
    var _ref;
    return _ref = this.bundleRelative() + (this.extname ? '' : '.js'), __indexOf.call(this.bundleFiles, _ref) >= 0;
  };

  return Dependency;

})();

module.exports = Dependency;
