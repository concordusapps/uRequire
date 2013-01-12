var pathRelative;

pathRelative = function(from, to, options) {
  var commonPath, finalPath, lastFrom, lastTo, part, path, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
  options || (options = {});
  _ref = (function() {
    var _i, _len, _ref, _results;
    _ref = [from, to];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      path = _ref[_i];
      _results.push((path.replace(/\\/g, '/')).split('/'));
    }
    return _results;
  })(), from = _ref[0], to = _ref[1];
  _ref1 = (function() {
    var _i, _len, _ref1, _results;
    _ref1 = [from, to];
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      path = _ref1[_i];
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = path.length; _j < _len1; _j++) {
          part = path[_j];
          if (part !== '' && part !== '.') {
            _results1.push(part);
          }
        }
        return _results1;
      })());
    }
    return _results;
  })(), from = _ref1[0], to = _ref1[1];
  _ref2 = [from, to];
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    path = _ref2[_i];
    if (path.length === 0) {
      return null;
    }
  }
  commonPath = [];
  while ((lastFrom = from.shift()) === (lastTo = to.shift()) && (from.length > 0 || to.length > 0)) {
    commonPath.push(lastFrom);
  }
  finalPath = [];
  if (commonPath.length > 0 || lastFrom === lastTo) {
    if (lastFrom !== lastTo) {
      if (lastFrom) {
        from.unshift(lastFrom);
      }
      if (lastTo) {
        to.unshift(lastTo);
      }
      for (_j = 0, _len1 = from.length; _j < _len1; _j++) {
        part = from[_j];
        if (part !== '..') {
          finalPath.push('..');
        } else {
          if (finalPath.length > 0) {
            finalPath.pop();
          } else {
            if (commonPath.length > 0) {
              to.unshift(commonPath.pop());
            } else {
              return null;
            }
          }
        }
      }
      for (_k = 0, _len2 = to.length; _k < _len2; _k++) {
        part = to[_k];
        if (part !== '..') {
          finalPath.push("" + part);
        } else {
          if (finalPath[finalPath.length - 1] === '..') {
            finalPath.push('..');
          } else {
            finalPath.pop();
          }
        }
      }
    }
    if (options.dot4Current) {
      if (finalPath[0] !== '..') {
        finalPath.unshift('.');
      }
    }
    return finalPath.join("/");
  } else {
    return null;
  }
};

module.exports = pathRelative;
