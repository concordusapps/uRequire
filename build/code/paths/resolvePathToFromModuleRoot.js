var resolvePathToFromModuleRoot;

resolvePathToFromModuleRoot = function(modyle, pathFromModuleRoot) {
  var pathRelative, res, stepsToBundleRoot, _path;
  pathRelative = require('./pathRelative');
  _path = require('path');
  stepsToBundleRoot = pathRelative("$/" + (_path.dirname(modyle)), '$/', {
    dot4Current: true
  });
  if (pathFromModuleRoot) {
    if (pathFromModuleRoot[0] === '.') {
      res = _path.normalize(stepsToBundleRoot + '/' + pathFromModuleRoot);
    } else {
      res = pathFromModuleRoot;
    }
  } else {
    res = stepsToBundleRoot;
  }
  return res.replace(/\\/g, '/');
};

module.exports = resolvePathToFromModuleRoot;
