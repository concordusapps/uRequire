var fName, fn, upath, _, _path,
  __slice = [].slice;

_ = require('lodash');

_path = require('path');

/*
  upath is a proxy to node's 'path', replacing '\' with '/' for all string results :-)
*/


upath = {};

for (fName in _path) {
  fn = _path[fName];
  if (_.isFunction(fn)) {
    upath[fName] = (function(fName) {
      return function() {
        var p, res;
        p = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        res = _path[fName].apply(_path, p);
        if (_.isString(res)) {
          return res.replace(/\\/g, '/');
        } else {
          return res;
        }
      };
    })(fName);
  }
}

module.exports = upath;
